const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("TarvenNFT ERC721 Contract", function () {
  async function deployTarvenNFTFixture() {
    const [owner, ai, otherAccount, newAI] = await ethers.getSigners();

    const TarvenNFT = await ethers.getContractFactory("TarvenNFT");
    const tarvenNFT = await TarvenNFT.deploy(ai.address);
    await tarvenNFT.waitForDeployment();

    return { tarvenNFT, owner, ai, otherAccount, newAI };
  }

  describe("Minting functionality", function () {
    it("should allow the AI address to mint NFT and correctly set tokenURI", async function () {
      const { tarvenNFT, ai, owner } = await loadFixture(deployTarvenNFTFixture);
      
      const sampleMetadata = JSON.stringify({
        name: "Test NFT",
        description: "A sample NFT minted via the AI faucet",
        content: "这里是一段测试文本，作为 NFT 的内容。"
      });

      const tx = await tarvenNFT.connect(ai).mintNFT(owner.address, sampleMetadata);
      await tx.wait();

      expect(await tarvenNFT.ownerOf(1)).to.equal(owner.address);
      
      const tokenURI = await tarvenNFT.tokenURI(1);
      expect(tokenURI).to.equal(sampleMetadata);
    });

    it("should revert when a non-AI address attempts to mint NFT", async function () {
      const { tarvenNFT, otherAccount } = await loadFixture(deployTarvenNFTFixture);
      
      const sampleMetadata = JSON.stringify({
        name: "Test NFT",
        description: "A sample NFT minted via the AI faucet",
        content: "这里是一段测试文本，作为 NFT 的内容。"
      });

      await expect(
        tarvenNFT.connect(otherAccount).mintNFT(otherAccount.address, sampleMetadata)
      ).to.be.revertedWith("Only AI can call this function");
    });
  });

  describe("AI Address Update", function () {
    it("should allow the owner to update the AI address; new AI can mint NFT while old AI cannot", async function () {
      const { tarvenNFT, owner, ai, newAI } = await loadFixture(deployTarvenNFTFixture);
      
      const updateTx = await tarvenNFT.connect(owner).updateAIAddress(newAI.address);
      await updateTx.wait();

      expect(await tarvenNFT.aiAddress()).to.equal(newAI.address);

      const sampleMetadata = JSON.stringify({
        name: "Test NFT",
        description: "A sample NFT minted via the updated AI faucet",
        content: "更新 AI 地址后的测试文本。"
      });

      await expect(
        tarvenNFT.connect(ai).mintNFT(owner.address, sampleMetadata)
      ).to.be.revertedWith("Only AI can call this function");

      const tx = await tarvenNFT.connect(newAI).mintNFT(owner.address, sampleMetadata);
      await tx.wait();

      expect(await tarvenNFT.ownerOf(1)).to.equal(owner.address);
      const tokenURI = await tarvenNFT.tokenURI(1);
      expect(tokenURI).to.equal(sampleMetadata);
    });
  });
});
