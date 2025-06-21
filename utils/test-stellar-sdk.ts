import * as StellarSDK from '@stellar/stellar-sdk';

// Log the structure of the SDK
console.log('StellarSDK keys:', Object.keys(StellarSDK));

// Check for Server class
console.log('Has Server:', 'Server' in StellarSDK);

// Check for SorobanRpc
console.log('Has SorobanRpc:', 'SorobanRpc' in StellarSDK);

// Check for Soroban
console.log('Has Soroban:', 'Soroban' in StellarSDK);

// Check for other potential server classes
if ('SorobanRpc' in StellarSDK) {
  const sorobanRpc = (StellarSDK as any).SorobanRpc;
  console.log('SorobanRpc keys:', Object.keys(sorobanRpc));
  console.log('Has SorobanRpc.Server:', 'Server' in sorobanRpc);
}

if ('Soroban' in StellarSDK) {
  const soroban = (StellarSDK as any).Soroban;
  console.log('Soroban keys:', Object.keys(soroban));
  console.log('Has Soroban.Server:', 'Server' in soroban);
} 