# DACV Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required for deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Required for IPFS functionality
NFT_STORAGE_API_KEY=your_nft_storage_api_key
```

Create frontend environment file:

```bash
cd frontend
cp .env.example .env
```

### 3. Compile and Test Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm run test
```

### 4. Deploy Smart Contract

#### Local Development
```bash
# Start local blockchain
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

#### Sepolia Testnet
```bash
# Deploy to Sepolia
npm run deploy:sepolia
```

### 5. Update Frontend Configuration

After deployment, update `frontend/.env`:

```env
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_CHAIN_ID=11155111
REACT_APP_NFT_STORAGE_KEY=your_nft_storage_api_key
```

### 6. Start Frontend Application

```bash
cd frontend
npm start
```

## Getting API Keys

### 1. Infura (Required for Sepolia deployment)
1. Go to [infura.io](https://infura.io)
2. Create account and new project
3. Copy the Sepolia endpoint URL

### 2. Etherscan (Required for contract verification)
1. Go to [etherscan.io](https://etherscan.io)
2. Create account
3. Go to API Keys section
4. Generate new API key

### 3. NFT.Storage (Required for IPFS)
1. Go to [nft.storage](https://nft.storage)
2. Create account
3. Generate API token
4. Add to both backend and frontend environment files:
   - Backend `.env`: `NFT_STORAGE_API_KEY=your_key`
   - Frontend `.env`: `REACT_APP_NFT_STORAGE_KEY=your_key`

### 4. MetaMask Setup
1. Install MetaMask browser extension
2. Create or import wallet
3. Add Sepolia testnet
4. Get test ETH from [Sepolia faucet](https://sepoliafaucet.com)

## System Administration

### Adding Authorized Issuers

Only the contract owner can add universities as authorized issuers:

```bash
# Using Hardhat console
npx hardhat console --network sepolia

# In console:
const contract = await ethers.getContractAt("DACVRegistry", "CONTRACT_ADDRESS");
await contract.addIssuer("UNIVERSITY_WALLET_ADDRESS", "Harvard University", "USA");
```

### Managing the System

The contract owner can:
- Add/remove authorized issuers
- Pause/unpause the system for emergencies
- Revoke any credential

## User Workflows

### University (Issuer)
1. Connect wallet to DACV system
2. Must be added as authorized issuer by admin
3. Upload credential document (PDF/image)
4. Fill student and credential details
5. Issue credential (stores on IPFS + blockchain)
6. Share verification QR code with student

### Student
1. Connect wallet to view credentials
2. View all credentials issued to their address
3. Generate QR codes for verification
4. Share verification links with employers

### Employer
1. Connect wallet (optional - can verify without wallet)
2. Enter credential ID or scan QR code
3. Instantly verify credential authenticity
4. View credential details and issuer information

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contract │    │      IPFS       │
│   (React)       │◄──►│   (Solidity)    │◄──►│   (Documents)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    MetaMask     │    │   Ethereum      │    │  NFT.Storage    │
│   (Wallet)      │    │   Blockchain    │    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Features

- **Tamper-Proof**: Credentials stored as hashes on blockchain
- **Authorized Issuers**: Only whitelisted institutions can issue
- **Revocation**: Issuers can revoke compromised credentials
- **Privacy**: Only hashes stored on-chain, documents on IPFS
- **Emergency Controls**: Owner can pause system if needed

## Troubleshooting

### Common Issues

1. **"Not an authorized issuer"**
   - Contact system admin to add your wallet as authorized issuer

2. **"Insufficient funds"**
   - Get test ETH from Sepolia faucet
   - Check you're on correct network

3. **"Contract not found"**
   - Verify contract address in environment variables
   - Ensure you're on correct network (Sepolia)

4. **IPFS upload fails**
   - Check NFT.Storage API key
   - Verify file size and format

### Support

For technical issues:
1. Check console for error messages
2. Verify environment configuration
3. Ensure wallet is connected to correct network
4. Contact system administrator for issuer authorization