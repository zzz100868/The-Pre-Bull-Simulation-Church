import { ethers } from "ethers";

// PBT 合约 ABI（仅需要的函数）
const PBT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function recordConversion(string calldata agentId) external",
  "function balanceOf(address account) view returns (uint256)",
  "event Converted(string agentId, uint256 timestamp)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

export function initChain(): boolean {
  const rpcUrl = process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz";
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.PBT_CONTRACT_ADDRESS;

  if (
    !privateKey ||
    !contractAddress ||
    privateKey === "your_private_key_here" ||
    contractAddress === "your_contract_address_here"
  ) {
    console.warn(
      "⚠️  Chain config missing (PRIVATE_KEY or PBT_CONTRACT_ADDRESS). Running in mock mode."
    );
    return false;
  }

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, PBT_ABI, wallet);
    console.log("✅ Chain connected:", contractAddress);
    return true;
  } catch (error) {
    console.error("Chain init failed:", error);
    return false;
  }
}

export async function mintPBT(
  toAddress: string,
  amount: number
): Promise<string> {
  if (!contract) {
    // Mock mode: return fake tx hash
    const mockHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    console.log(`[mock] mint ${amount} PBT to ${toAddress} → ${mockHash}`);
    return mockHash;
  }

  try {
    const tx = await contract.mint(
      toAddress,
      ethers.parseEther(amount.toString())
    );
    const receipt = await tx.wait();
    console.log(`mint ${amount} PBT → tx: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error("mint failed:", error);
    throw error;
  }
}

export async function recordConversion(agentId: string): Promise<string> {
  if (!contract) {
    const mockHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    console.log(`[mock] recordConversion(${agentId}) → ${mockHash}`);
    return mockHash;
  }

  try {
    const tx = await contract.recordConversion(agentId);
    const receipt = await tx.wait();
    console.log(`recordConversion(${agentId}) → tx: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error("recordConversion failed:", error);
    throw error;
  }
}

// 用于给每个 agent 分配一个确定性地址（demo 用）
export function getAgentAddress(agentId: string): string {
  const hash = ethers.id(agentId);
  return ethers.getAddress("0x" + hash.slice(26));
}
