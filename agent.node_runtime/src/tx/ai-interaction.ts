// scripts/ai-interaction.ts

import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// NFT 的信息结构
interface NFT {
  title: string;
  content: string;
}

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

// 初始化 provider、AI 钱包及合约实例
const provider = new ethers.JsonRpcProvider(RPC_URL);
const aiWallet = new ethers.Wallet(AI_PRIVATE_KEY, provider);

const tarvenCoin = new ethers.Contract(TARVENCOIN_ADDRESS, tarvenCoinABI, aiWallet);
const tarvenNFT = new ethers.Contract(TARVENNFT_ADDRESS, tarvenNFTABI, aiWallet);

/**
 * 调用 TarvenCoin 合约的 faucet 函数
 * @param recipient 接收代币的地址
 * @param amount 代币数量（number 类型，通过 ethers.parseUnits 得到 bigint）
 */
async function callFaucet(recipient: string, amount: number): Promise<{
  status: "success" | "error",
  txHash: string
}> {
  let txFaucet;
  try {
    const ethAmount = ethers.parseUnits(amount.toString(), 18);
    console.log(`Calling faucet: mint ${ethAmount} tokens to ${recipient}...`);
    txFaucet = await tarvenCoin.faucet(recipient, ethAmount);
    console.log("Waiting for faucet tx to be mined...");
    await txFaucet.wait();
    console.log("Faucet call successful, tx hash:", txFaucet.hash);
  } catch (error) {
    console.error("Faucet call failed:", error);
    return {"status": "error", "txHash": ""};
  }

  return {"status": "success", "txHash": txFaucet.hash};
}

/**
 * 调用 TarvenNFT 合约的 mintNFT 函数
 * @param recipient 接收 NFT 的地址
 * @param tokenData NFT 信息（包含标题和内容）
 */
async function callMintNFT(recipient: string, tokenData: NFT): Promise<{
  status: "success" | "error",
  txHash: string
}> {
  // 生成 SVG 图片，该图片将作为 NFT 的图像显示
  const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
  <style>
    .pixel { font-family: 'Press Start 2P', cursive; }
  </style>
  <rect width="100%" height="100%" fill="white"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="24" class="pixel">
    ${tokenData.title}
  </text>
  <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="12" class="pixel">
    BeforeLife
  </text>
  </svg>`;

  const base64Svg = Buffer.from(svgImage).toString("base64");
  const imageURI = `data:image/svg+xml;base64,${base64Svg}`;

  // 构造 NFT 元数据 JSON 对象，加入 image 字段
  const tokenMetadata = JSON.stringify({
    name: tokenData.title,
    description: tokenData.content,
    image: imageURI,
  });

  let txMintNFT;

  try {
    console.log(`Calling mintNFT: mint NFT to ${recipient} with tokenURI metadata...`);
    txMintNFT = await tarvenNFT.mintNFT(recipient, tokenMetadata);
    console.log("Waiting for mintNFT tx to be mined...");
    const receipt = await txMintNFT.wait();
    console.log("mintNFT call successful, tx hash:", txMintNFT.hash);
  } catch (error) {
    console.error("mintNFT call failed:", error);
    return {"status": "error", "txHash": ""};
  }

  return {"status": "success", "txHash": txMintNFT.hash};
}

async function main() {
  console.log("AI Wallet address:", await aiWallet.getAddress());

  // recipient 地址
  const recipient = "0x3a181F605bB12B792a59a6ba132de5B1085B57c8";

  // 示例 1：调用 faucet，铸造 100 个代币（假设代币为 18 位小数）
  await callFaucet(recipient, 100);

  // 示例 2：调用 mintNFT，传入 NFT 信息（title 和 content）
  const nftContent: NFT = {
    title: "Test NFT",
    content: "这里是一段测试文本，作为 NFT 的内容。"
  };
  await callMintNFT(recipient, nftContent);
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error("Error in execution:", error);
//     process.exit(1);
//   });

export {
  callFaucet,
  callMintNFT
}