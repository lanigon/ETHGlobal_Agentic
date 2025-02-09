// scripts/ai-interaction.ts

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// 从环境变量中读取配置
const RPC_URL = process.env.SEPOLIA_RPC_URL as string;
const AI_PRIVATE_KEY = process.env.AI_PRIVATE_KEY as string;
const TARVENCOIN_ADDRESS = process.env.TARVENCOIN_ADDRESS as string;
const TARVENNFT_ADDRESS = process.env.TARVENNFT_ADDRESS as string;

const tarvenCoinABI = [
  "function faucet(address recipient, uint256 amount) external"
];

const tarvenNFTABI = [
  "function mintNFT(address recipient, string memory tokenURI) external returns (uint256)"
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const aiWallet = new ethers.Wallet(AI_PRIVATE_KEY, provider);

  console.log("AI Wallet address:", await aiWallet.getAddress());

  const tarvenCoin = new ethers.Contract(TARVENCOIN_ADDRESS, tarvenCoinABI, aiWallet);
  const tarvenNFT = new ethers.Contract(TARVENNFT_ADDRESS, tarvenNFTABI, aiWallet);

  // 示例 1：调用 TarvenCoin 合约的 faucet 函数
  const recipient = "0x3a181F605bB12B792a59a6ba132de5B1085B57c8"; 
  const amount = ethers.parseUnits("100", 18); // 假设代币采用 18 个小数位

  console.log(`Calling faucet: mint ${amount} tokens to ${recipient}...`);
  const txFaucet = await tarvenCoin.faucet(recipient, amount);
  console.log("Waiting for faucet tx to be mined...");
  await txFaucet.wait();
  console.log("Faucet call successful, tx hash:", txFaucet.hash);

  // 示例 2：调用 TarvenNFT 合约的 mintNFT 函数
  // 构造 NFT 的元数据，这里以纯文本的 JSON 格式为例
  const tokenMetadata = JSON.stringify({
    name: "Test NFT",
    description: "A sample NFT minted via the AI faucet",
    content: "这里是一段测试文本，作为 NFT 的内容。"
  });
  console.log(`Calling mintNFT: mint NFT to ${recipient} with tokenURI metadata...`);
  const txMintNFT = await tarvenNFT.mintNFT(recipient, tokenMetadata);
  console.log("Waiting for mintNFT tx to be mined...");
  const receipt = await txMintNFT.wait();

  // 如果 mintNFT 返回 tokenId，可以在 receipt.logs 中查找或直接通过返回值获得
  console.log("mintNFT call successful, tx hash:", txMintNFT.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in execution:", error);
    process.exit(1);
  });
