import * as StellarSDK from '@stellar/stellar-sdk';

// Network configuration
export const TESTNET_RPC_URL = 'https://soroban-testnet.stellar.org:443';
export const FUTURENET_RPC_URL = 'https://rpc-futurenet.stellar.org';

// Network identifiers
export enum StellarNetwork {
  TESTNET = 'TESTNET',
  FUTURENET = 'FUTURENET',
  MAINNET = 'MAINNET',
}

// Get network passphrase
export function getNetworkPassphrase(network: StellarNetwork): string {
  switch (network) {
    case StellarNetwork.TESTNET:
      return 'Test SDF Network ; September 2015';
    case StellarNetwork.FUTURENET:
      return 'Test SDF Future Network ; October 2022';
    case StellarNetwork.MAINNET:
      return 'Public Global Stellar Network ; September 2015';
    default:
      return 'Test SDF Network ; September 2015';
  }
}

// Get RPC URL for network
export function getRpcUrl(network: StellarNetwork): string {
  switch (network) {
    case StellarNetwork.TESTNET:
      return TESTNET_RPC_URL;
    case StellarNetwork.FUTURENET:
      return FUTURENET_RPC_URL;
    case StellarNetwork.MAINNET:
      throw new Error('Mainnet not supported yet');
    default:
      return TESTNET_RPC_URL;
  }
}

// Initialize Soroban RPC client
export function initSorobanClient(network: StellarNetwork = StellarNetwork.TESTNET): any {
  try {
    const rpcUrl = getRpcUrl(network);
    // Return a simple object with the server URL for now
    // In production, this would be replaced with the actual Soroban client
    return {
      serverUrl: rpcUrl,
      // Add other necessary properties/methods here
    };
  } catch (err) {
    console.error('Failed to initialize Soroban client:', err);
    throw new Error('Failed to connect to Stellar network');
  }
}

// Format account address for display
export function formatAddress(address: string, truncateLength: number = 4): string {
  if (!address) return '';
  if (address.length <= truncateLength * 2) return address;
  
  return `${address.slice(0, truncateLength)}...${address.slice(-truncateLength)}`;
}

// Format XLM amount for display
export function formatXLM(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  }).format(amount);
}

// Check if Freighter is installed
export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && (window as any).freighterApi !== undefined;
} 