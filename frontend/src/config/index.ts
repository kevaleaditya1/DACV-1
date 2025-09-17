// Environment configuration
export const config = {
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '',
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '17000'),
  nftStorageKey: process.env.REACT_APP_NFT_STORAGE_KEY || '',
  networks: {
    holesky: {
      chainId: 17000,
      name: 'Holesky Testnet',
      rpcUrl: 'https://ethereum-holesky.publicnode.com',
      blockExplorer: 'https://holesky.etherscan.io',
    },
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://sepolia.infura.io/v3/',
      blockExplorer: 'https://sepolia.etherscan.io',
    },
    polygon_amoy: {
      chainId: 80002,
      name: 'Polygon Amoy Testnet',
      rpcUrl: 'https://rpc-amoy.polygon.technology/',
      blockExplorer: 'https://amoy.polygonscan.com',
    },
    base_goerli: {
      chainId: 84531,
      name: 'Base Goerli Testnet',
      rpcUrl: 'https://goerli.base.org',
      blockExplorer: 'https://goerli.basescan.org',
    },
  },
};

export const SUPPORTED_CHAINS = [17000, 11155111, 80002, 84531]; // Holesky, Sepolia, Polygon Amoy, Base Goerli