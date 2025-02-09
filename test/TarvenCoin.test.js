const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("TarvenCoin ERC20 Contract", function () {
  async function deployTarvenCoinFixture() {
    const [owner, ai, otherAccount, anotherAccount] = await ethers.getSigners();

    const TarvenCoin = await ethers.getContractFactory("TarvenCoin");
    const tarvenCoin = await TarvenCoin.deploy(ai.address);
    await tarvenCoin.waitForDeployment();
    
    return { tarvenCoin, owner, ai, otherAccount, anotherAccount };
  }

  describe("Deployment", function () {
    it("Should assign the initial minted tokens to the owner", async function () {
      const { tarvenCoin, owner } = await loadFixture(deployTarvenCoinFixture);
      expect(await tarvenCoin.balanceOf(owner.address)).to.equal(BigInt(10000*10**18));
    });
  });

  describe("Faucet functionality", function () {
    it("Should allow the AI address to mint tokens via faucet", async function () {
      const { tarvenCoin, owner, ai } = await loadFixture(deployTarvenCoinFixture);
      const balanceBefore = await tarvenCoin.balanceOf(owner.address);
      const mintAmount = 500;

      await tarvenCoin.connect(ai).faucet(owner.address, mintAmount);
      
      const balanceAfter = await tarvenCoin.balanceOf(owner.address);
      expect(balanceAfter).to.equal(balanceBefore+BigInt(mintAmount));
    });

    it("Should revert when faucet is called by a non-AI address", async function () {
      const { tarvenCoin, otherAccount } = await loadFixture(deployTarvenCoinFixture);
      await expect(
        tarvenCoin.connect(otherAccount).faucet(otherAccount.address, 100)
      ).to.be.revertedWith("Only AI can call this function");
    });
  });

  describe("AI Address Update", function () {
    it("Should allow the owner to update the AI address, and new AI can use faucet while the old AI cannot", async function () {
      const { tarvenCoin, owner, ai, anotherAccount } = await loadFixture(deployTarvenCoinFixture);

      await tarvenCoin.connect(owner).updateAIAddress(anotherAccount.address);

      expect(await tarvenCoin.aiAddress()).to.equal(anotherAccount.address);

      await expect(
        tarvenCoin.connect(ai).faucet(owner.address, 100)
      ).to.be.revertedWith("Only AI can call this function");

      const balanceBefore = await tarvenCoin.balanceOf(owner.address);
      await tarvenCoin.connect(anotherAccount).faucet(owner.address, 100);
      const balanceAfter = await tarvenCoin.balanceOf(owner.address);
      expect(balanceAfter).to.equal(balanceBefore+BigInt(100));
    });
  });

});
