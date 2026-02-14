import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PBT with account:", deployer.address);

  const PBT = await ethers.getContractFactory("PBT");
  const pbt = await PBT.deploy();
  await pbt.waitForDeployment();

  const address = await pbt.getAddress();
  console.log("PBT deployed to:", address);
  console.log("\nAdd this to your backend .env:");
  console.log(`PBT_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
