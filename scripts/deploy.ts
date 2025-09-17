import { ethers } from "hardhat";

async function main() {
  console.log("Deploying DACVRegistry contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy the contract
  const DACVRegistry = await ethers.getContractFactory("DACVRegistry");
  const dacvRegistry = await DACVRegistry.deploy();
  
  // Wait for deployment to complete
  await dacvRegistry.waitForDeployment();
  const contractAddress = await dacvRegistry.getAddress();
  
  console.log("DACVRegistry deployed to:", contractAddress);
  
  // Save deployment information
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: process.env.HARDHAT_NETWORK || "localhost",
    deploymentTime: new Date().toISOString(),
    chainId: (await deployer.provider.getNetwork()).chainId.toString(),
  };
  
  console.log("Deployment Info:", deploymentInfo);
  
  // Verify contract on Etherscan (if not localhost)
  if (process.env.HARDHAT_NETWORK !== "localhost" && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await dacvRegistry.deploymentTransaction()?.wait(5);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await require("hardhat").run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n✅ Deployment completed successfully!`);
    console.log(`📄 Contract Address: ${address}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Update your .env file with the contract address`);
    console.log(`2. Add authorized issuers using the addIssuer function`);
    console.log(`3. Start the frontend application`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });