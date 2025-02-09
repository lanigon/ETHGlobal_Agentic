const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TokenEscrow Contract", function () {
  async function deployTokenEscrowFixture() {
    const [owner, ai, sender, receiver, otherAccount] = await ethers.getSigners();

    const TarvenCoin = await ethers.getContractFactory("TarvenCoin");
    const tarvenCoin = await TarvenCoin.deploy(ai.address);
    await tarvenCoin.waitForDeployment();

    const claimPeriod = 86400; // 1 day in seconds
    const TokenEscrow = await ethers.getContractFactory("TokenEscrow");
    const tokenEscrow = await TokenEscrow.deploy(tarvenCoin.target, claimPeriod);
    await tokenEscrow.waitForDeployment();

    const decimals = await tarvenCoin.decimals();
    const faucetAmount = ethers.parseUnits("500", decimals);
    await tarvenCoin.connect(ai).faucet(sender.address, faucetAmount);

    return { tarvenCoin, tokenEscrow, owner, ai, sender, receiver, otherAccount, claimPeriod, faucetAmount };
  }

  describe("Deployment", function () {
    it("Should mint 500 coins to sender", async function () {
      const { tarvenCoin, sender } = await loadFixture(deployTokenEscrowFixture);
      expect(await tarvenCoin.balanceOf(sender.address)).to.equal(BigInt(500*10**18));
    });
  });

  describe("Deposit and Claim", function () {
    it("should allow sender to deposit tokens and receiver to claim them within claim period", async function () {
      const { tarvenCoin, tokenEscrow, sender, receiver, claimPeriod } = await loadFixture(deployTokenEscrowFixture);

      const decimals = await tarvenCoin.decimals();
      const depositAmount = ethers.parseUnits("200", decimals);

      await tarvenCoin.connect(sender).approve(tokenEscrow.target, depositAmount);

      const depositTx = await tokenEscrow.connect(sender).deposit(receiver.address, depositAmount);
      await depositTx.wait();
      const depositId = 1;

      expect(await tarvenCoin.balanceOf(tokenEscrow.target)).to.equal(depositAmount);

      await time.increase(claimPeriod / 2);

      const receiverBalanceBefore = await tarvenCoin.balanceOf(receiver.address);

      await tokenEscrow.connect(receiver).claim(depositId);

      const receiverBalanceAfter = await tarvenCoin.balanceOf(receiver.address);
      expect(receiverBalanceAfter - receiverBalanceBefore).to.equal(depositAmount);
    });
  });

  describe("Refund", function () {
    it("should allow sender to refund tokens if receiver does not claim within claim period", async function () {
      const { tarvenCoin, tokenEscrow, sender, receiver, claimPeriod } = await loadFixture(deployTokenEscrowFixture);

      const decimals = await tarvenCoin.decimals();
      const depositAmount = ethers.parseUnits("150", decimals);

      await tarvenCoin.connect(sender).approve(tokenEscrow.target, depositAmount);

      const depositTx = await tokenEscrow.connect(sender).deposit(receiver.address, depositAmount);
      await depositTx.wait();
      const depositId = 1; 

      await time.increase(claimPeriod + 10);

      const senderBalanceBefore = await tarvenCoin.balanceOf(sender.address);

      await tokenEscrow.connect(sender).refund(depositId);

      const senderBalanceAfter = await tarvenCoin.balanceOf(sender.address);
      expect(senderBalanceAfter - senderBalanceBefore).to.equal(depositAmount);
    });
  });

  describe("Edge Cases and Access Control", function () {
    it("should revert refund call by sender if claim period not expired", async function () {
      const { tarvenCoin, tokenEscrow, sender, receiver, claimPeriod } = await loadFixture(deployTokenEscrowFixture);
      const decimals = await tarvenCoin.decimals();
      const depositAmount = ethers.parseUnits("100", decimals);

      await tarvenCoin.connect(sender).approve(tokenEscrow.target, depositAmount);
      await tokenEscrow.connect(sender).deposit(receiver.address, depositAmount);
      const depositId = 1;

      await expect(tokenEscrow.connect(sender).refund(depositId))
        .to.be.revertedWith("Claim period not expired");
    });

    it("should revert claim call by receiver if claim period expired", async function () {
      const { tarvenCoin, tokenEscrow, sender, receiver, claimPeriod } = await loadFixture(deployTokenEscrowFixture);
      const decimals = await tarvenCoin.decimals();
      const depositAmount = ethers.parseUnits("100", decimals);

      await tarvenCoin.connect(sender).approve(tokenEscrow.target, depositAmount);
      await tokenEscrow.connect(sender).deposit(receiver.address, depositAmount);
      const depositId = 1;

      await time.increase(claimPeriod + 1);
      await expect(tokenEscrow.connect(receiver).claim(depositId))
        .to.be.revertedWith("Claim period expired");
    });

    it("should revert claim and refund calls from accounts other than sender and receiver", async function () {
      const { tarvenCoin, tokenEscrow, sender, receiver, otherAccount, claimPeriod } = await loadFixture(deployTokenEscrowFixture);
      const decimals = await tarvenCoin.decimals();
      const depositAmount = ethers.parseUnits("100", decimals);

      await tarvenCoin.connect(sender).approve(tokenEscrow.target, depositAmount);
      await tokenEscrow.connect(sender).deposit(receiver.address, depositAmount);
      const depositId = 1;

      await expect(tokenEscrow.connect(otherAccount).claim(depositId))
        .to.be.revertedWith("Only designated recipient can claim");

      await time.increase(claimPeriod + 1);
      await expect(tokenEscrow.connect(otherAccount).refund(depositId))
        .to.be.revertedWith("Only sender can refund");
    });
  });
});
