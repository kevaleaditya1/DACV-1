const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account (contract owner)
  const [deployer] = await ethers.getSigners();
  console.log("Adding issuer with account:", deployer.address);

  // IMPORTANT: Replace this with your actual deployed contract address
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x3753cfB00dd01D35A36284A909EcBb73a06Fcc7b";
  
  if (contractAddress === "0x3753cfB00dd01D35A36284A909EcBb73a06Fcc7b") {
    console.error("❌ Please set CONTRACT_ADDRESS environment variable or update the script with your deployed contract address");
    console.log("Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/add-issuer.js --network holesky");
    process.exit(1);
  }
  
  console.log("Contract Address:", contractAddress);
  
  // Connect to the deployed contract
  const DACVRegistry = await ethers.getContractFactory("DACVRegistry");
  const dacvRegistry = DACVRegistry.attach(contractAddress);

  // University details
  const universityAddress = deployer.address; // Use deployer as university for testing
  const universityName = "Test University";
  const universityCountry = "Test Country";

  console.log("Adding university issuer...");
  console.log("University Address:", universityAddress);
  console.log("University Name:", universityName);
  console.log("University Country:", universityCountry);

  try {
    // Add the issuer
    const tx = await dacvRegistry.addIssuer(
      universityAddress,
      universityName,
      universityCountry
    );
    
    await tx.wait();
    console.log("✅ University issuer added successfully!");
    console.log("Transaction hash:", tx.hash);

    // Verify the issuer was added
    const isAuthorized = await dacvRegistry.authorizedIssuers(universityAddress);
    console.log("Is authorized:", isAuthorized);

    const issuerInfo = await dacvRegistry.issuers(universityAddress);
    console.log("Issuer info:", {
      name: issuerInfo.name,
      country: issuerInfo.country,
      isActive: issuerInfo.isActive,
      credentialsIssued: issuerInfo.credentialsIssued.toString()
    });

  } catch (error) {
    console.error("❌ Failed to add issuer:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Setup completed!");
    console.log("Next steps:");
    console.log("1. Update frontend/.env with contract address");
    console.log("2. Restart frontend development server");
    console.log("3. Connect MetaMask to Holesky testnet");
    console.log("4. Test the university dashboard");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });