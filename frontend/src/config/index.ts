// Environment configuration
export const config = {
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || '',
  chainId: parseInt(process.env.REACT_APP_CHAIN_ID || '17000'),
  nftStorageKey: process.env.REACT_APP_NFT_STORAGE_KEY || '',
  networks: {
    holesky: {
      chainId: 17000,
      name: 'Holesky Testnet',
      rpcUrl: 'https://holesky.drpc.org',
      blockExplorer: 'https://holesky.etherscan.io',
    },
  },
};

export const SUPPORTED_CHAINS = [17000]; // Holesky Testnet