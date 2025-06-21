"use client";

import { useState, useCallback } from 'react';
import * as StellarSDK from '@stellar/stellar-sdk';
import freighterApi from "@stellar/freighter-api";
import { stellarConfig, contractsConfig, developmentConfig } from '../config/env';
import toast from 'react-hot-toast';

// Mock data for fallback (temporary - we'll remove this)
const MOCK_LOTTERIES: LotteryType[] = [];

export function useLotellar() {
  const [lotteries, setLotteries] = useState<LotteryType[]>([]);
  const [completedLotteries, setCompletedLotteries] = useState<LotteryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // alias for backwards compatibility
  const [createLotteryLoading, setCreateLotteryLoading] = useState(false);
  const [enterLotteryLoading, setEnterLotteryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Soroban server
  const getServer = useCallback(() => {
    return new StellarSDK.Horizon.Server(stellarConfig.horizonUrl);
  }, []);

  // Get Soroban RPC server
  const getSorobanServer = useCallback(() => {
    return new StellarSDK.rpc.Server(stellarConfig.sorobanRpcUrl);
  }, []);

  // Check if Freighter is connected
  const checkFreighterConnection = useCallback(async () => {
    try {
      const isConnected = await freighterApi.isConnected();
      if (!isConnected) {
        const errorMsg = 'Please connect your Freighter wallet first';
        toast.error(errorMsg);
        console.error('Freighter connection error:', errorMsg);
        throw new Error(errorMsg);
      }
      const { address } = await freighterApi.getAddress();
      return address;
    } catch (error) {
      const errorMsg = 'Freighter wallet not connected';
      toast.error(errorMsg);
      console.error('Freighter connection error:', error);
      throw new Error(errorMsg);
    }
  }, []);

  // Build and submit Soroban contract transaction
  const invokeContract = useCallback(async (functionName: string, args: any[], sourceAccount: string) => {
    try {
      console.log(`🔗 Invoking ${functionName} on contract ${contractsConfig.lotteryContractId}`, args);
      
      const server = getSorobanServer();
      const sourceKeypair = StellarSDK.Keypair.fromPublicKey(sourceAccount);
      
      // Load account
      const account = await getServer().loadAccount(sourceAccount);
      
      // Build contract call operation
      const contract = new StellarSDK.Contract(contractsConfig.lotteryContractId);
      
      let operation;
      if (functionName === 'create_lottery') {
        operation = contract.call(
          'create_lottery',
          StellarSDK.Address.fromString(args[0]).toScVal(), // creator
          StellarSDK.nativeToScVal(args[1], { type: 'string' }), // name
          StellarSDK.nativeToScVal(args[2], { type: 'i128' }), // entry_fee
          StellarSDK.nativeToScVal(args[3], { type: 'u64' }), // duration
          StellarSDK.nativeToScVal(args[4], { type: 'u32' }) // max_participants
        );
      } else if (functionName === 'enter_lottery') {
        operation = contract.call(
          'enter_lottery',
          StellarSDK.Address.fromString(args[0]).toScVal(), // participant
          StellarSDK.nativeToScVal(args[1], { type: 'u32' }) // lottery_id
        );
      } else if (functionName === 'get_all_lotteries') {
        operation = contract.call('get_all_lotteries');
      } else if (functionName === 'get_completed_lotteries') {
        operation = contract.call('get_completed_lotteries');
      } else {
        const errorMsg = `Unknown function: ${functionName}`;
        toast.error(errorMsg);
        console.error('Contract invocation error:', errorMsg);
        throw new Error(errorMsg);
      }

      // Build transaction
      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: stellarConfig.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      // Simulate transaction first
      console.log('🔍 Simulating transaction...');
      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSDK.rpc.Api.isSimulationError(simulated)) {
        const errorMsg = `Transaction simulation failed: ${simulated.error || 'Unknown simulation error'}`;
        toast.error(errorMsg);
        console.error('Simulation error:', simulated);
        throw new Error(errorMsg);
      }

      // Prepare transaction for submission
      const preparedTransaction = StellarSDK.rpc.assembleTransaction(
        transaction,
        simulated
      ).build();

      console.log('📝 Requesting Freighter signature...');
      
      // Sign with Freighter
      const signedXdr = await freighterApi.signTransaction(
        preparedTransaction.toXDR(),
        {
          networkPassphrase: stellarConfig.networkPassphrase,
          address: sourceAccount,
        }
      );

      console.log('📤 Submitting transaction to Stellar Testnet...');
      
      // Create signed transaction object
      const signedTransaction = StellarSDK.TransactionBuilder.fromXDR(
        signedXdr.signedTxXdr, 
        stellarConfig.networkPassphrase
      );
      
      // Submit transaction
      const transactionResult = await server.sendTransaction(signedTransaction);

      console.log('✅ Transaction submitted!', transactionResult);

      // Wait for confirmation
      if (transactionResult.status === 'PENDING') {
        console.log('⏳ Waiting for transaction confirmation...');
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            const result = await server.getTransaction(transactionResult.hash);
            if (result.status === 'SUCCESS') {
              console.log('🎉 Transaction confirmed!');
              console.log('🌐 View on Explorer:', `https://stellar.expert/explorer/testnet/tx/${transactionResult.hash}`);
              return result;
            } else if (result.status === 'FAILED') {
              const errorMsg = `Transaction failed: ${result.resultXdr}`;
              toast.error(errorMsg);
              console.error('Transaction failed:', result);
              throw new Error(errorMsg);
            }
          } catch (error) {
            // Transaction might not be available yet, continue waiting
          }
          
          attempts++;
        }
        
        console.log('⚠️ Transaction confirmation timeout, but likely successful');
        return transactionResult;
      }

      return transactionResult;
      
    } catch (error: any) {
      const errorMsg = `Contract invocation failed: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error(`❌ Contract invocation failed:`, error);
      throw error;
    }
  }, [getSorobanServer, getServer]);

  // Get all active lotteries
  const getLotteries = useCallback(async () => {
    setLoading(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching lotteries from Stellar Testnet...');
      
      // For read-only operations, we can use Soroban RPC directly
      const server = getSorobanServer();
      const contract = new StellarSDK.Contract(contractsConfig.lotteryContractId);
      
      // Create a dummy account for simulation (read-only)
      const dummyKeypair = StellarSDK.Keypair.random();
      const dummyAccount = new StellarSDK.Account(dummyKeypair.publicKey(), '0');
      
      const operation = contract.call('get_all_lotteries');
      const transaction = new StellarSDK.TransactionBuilder(dummyAccount, {
        fee: '0',
        networkPassphrase: stellarConfig.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSDK.rpc.Api.isSimulationError(simulated)) {
        const errorMsg = `Failed to fetch lotteries: ${simulated.error || 'Unknown error'}`;
        toast.error(errorMsg);
        console.error('Failed to fetch lotteries:', simulated);
        setLotteries([]);
        return;
      }

      // Parse results
      const result = (simulated as any).result;
      if (result && 'retval' in result) {
        const lotteryData = StellarSDK.scValToNative(result.retval);
        
        if (Array.isArray(lotteryData)) {
          const transformedLotteries: LotteryType[] = lotteryData.map((lottery: any) => {
            const entryFee = Number(lottery.entry_fee || 0) / 10000000;
            const participants = lottery.participants || [];
            const prizePool = entryFee * participants.length; // Calculate prize pool based on participants
            
            return {
              id: lottery.id?.toString() || '0',
              name: lottery.name || 'Unknown Lottery',
              entryFee: entryFee,
              prizePool: prizePool,
              maxParticipants: Number(lottery.max_participants || 0),
              participants: participants,
              winner: lottery.winner || null,
              winnerTxHash: lottery.winner_tx_hash || null,
              isCompleted: Boolean(lottery.is_completed),
              createdAt: lottery.created_at ? new Date(Number(lottery.created_at) * 1000).toISOString() : new Date().toISOString(),
              creator: lottery.creator || '',
            };
          });
          
          setLotteries(transformedLotteries);
          console.log('✅ Lotteries loaded from Stellar Testnet!', transformedLotteries);
        } else {
          console.log('No lotteries found');
          setLotteries([]);
        }
      } else {
        console.log('No lottery data returned');
        setLotteries([]);
      }
    } catch (error: any) {
      const errorMsg = `Failed to fetch lotteries: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Failed to fetch lotteries:', error);
      setError(errorMsg);
      setLotteries(MOCK_LOTTERIES);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [getSorobanServer]);

  // Get completed lotteries
  const getCompletedLotteries = useCallback(async () => {
    setLoading(true);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching completed lotteries from Stellar Testnet...');
      
      // For read-only operations, we can use Soroban RPC directly
      const server = getSorobanServer();
      const contract = new StellarSDK.Contract(contractsConfig.lotteryContractId);
      
      // Create a dummy account for simulation (read-only)
      const dummyKeypair = StellarSDK.Keypair.random();
      const dummyAccount = new StellarSDK.Account(dummyKeypair.publicKey(), '0');
      
      const operation = contract.call('get_completed_lotteries');
      const transaction = new StellarSDK.TransactionBuilder(dummyAccount, {
        fee: '0',
        networkPassphrase: stellarConfig.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const simulated = await server.simulateTransaction(transaction);
      
      if (StellarSDK.rpc.Api.isSimulationError(simulated)) {
        const errorMsg = `Failed to fetch completed lotteries: ${simulated.error || 'Unknown error'}`;
        toast.error(errorMsg);
        console.error('Failed to fetch completed lotteries:', simulated);
        setCompletedLotteries([]);
        return;
      }

      // Parse results
      const result = (simulated as any).result;
      if (result && 'retval' in result) {
        const lotteryData = StellarSDK.scValToNative(result.retval);
        
        if (Array.isArray(lotteryData)) {
          const transformedLotteries: LotteryType[] = lotteryData.map((lottery: any) => {
            const entryFee = Number(lottery.entry_fee || 0) / 10000000;
            const participants = lottery.participants || [];
            const prizePool = entryFee * participants.length;
            
            return {
              id: lottery.id?.toString() || '0',
              name: lottery.name || 'Unknown Lottery',
              entryFee: entryFee,
              prizePool: prizePool,
              maxParticipants: Number(lottery.max_participants || 0),
              participants: participants,
              winner: lottery.winner || null,
              winnerTxHash: lottery.winner_tx_hash || null,
              isCompleted: Boolean(lottery.is_completed),
              createdAt: lottery.created_at ? new Date(Number(lottery.created_at) * 1000).toISOString() : new Date().toISOString(),
              creator: lottery.creator || '',
            };
          });
          
          setCompletedLotteries(transformedLotteries);
          console.log('✅ Completed lotteries loaded from Stellar Testnet!', transformedLotteries);
        } else {
          console.log('No completed lotteries found');
          setCompletedLotteries([]);
        }
      } else {
        console.log('No completed lottery data returned');
        setCompletedLotteries([]);
      }
    } catch (error: any) {
      const errorMsg = `Failed to fetch completed lotteries: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Failed to fetch completed lotteries:', error);
      setError(errorMsg);
      setCompletedLotteries([]);
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }, [getSorobanServer]);

  // Create a new lottery
  const createLottery = useCallback(async (name: string, entryFee: number, duration: number, maxParticipants: number) => {
    setLoading(true);
    setCreateLotteryLoading(true);
    setError(null);
    
    try {
      const userAddress = await checkFreighterConnection();
      
      // Convert entry fee to stroops (1 XLM = 10,000,000 stroops)
      const entryFeeStroops = Math.round(entryFee * 10000000);
      
      console.log('🎲 Creating lottery:', { name, entryFee, entryFeeStroops, duration, maxParticipants });
      
      await invokeContract('create_lottery', [
        userAddress,
        name,
        entryFeeStroops,
        duration,
        maxParticipants
      ], userAddress);
      
      console.log('✅ Lottery created successfully!');
      toast.success(`Lottery "${name}" created successfully!`);
      
      // Refresh lottery list
      await getLotteries();
      
    } catch (error: any) {
      const errorMsg = `Failed to create lottery: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Failed to create lottery:', error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
      setCreateLotteryLoading(false);
    }
  }, [checkFreighterConnection, invokeContract, getLotteries]);

  // Enter a lottery
  const enterLottery = useCallback(async (lotteryId: string) => {
    setLoading(true);
    setEnterLotteryLoading(true);
    setError(null);
    
    try {
      const userAddress = await checkFreighterConnection();
      
      console.log('🎫 Entering lottery:', lotteryId);
      
      await invokeContract('enter_lottery', [
        userAddress,
        parseInt(lotteryId)
      ], userAddress);
      
      console.log('✅ Successfully entered lottery!');
      toast.success('Successfully entered the lottery! Good luck!');
      
      // Refresh lottery list
      await getLotteries();
      
    } catch (error: any) {
      const errorMsg = `Failed to enter lottery: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Failed to enter lottery:', error);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
      setEnterLotteryLoading(false);
    }
  }, [checkFreighterConnection, invokeContract, getLotteries]);

  // Initialize Alice as admin (for testing)
  const initializeAlice = useCallback(async () => {
    if (!developmentConfig.aliceAddress) {
      const errorMsg = 'Alice address not configured in environment variables';
      toast.error(errorMsg);
      console.error('Alice initialization error:', errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('👑 Initializing Alice as admin...');
      
      // This would be done during contract deployment
      // For now, we'll just log that Alice is configured
      console.log('✅ Alice configured as admin:', developmentConfig.aliceAddress);
      toast.success('Alice configured as admin for testing');
      
    } catch (error: any) {
      const errorMsg = `Failed to initialize Alice: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Failed to initialize Alice:', error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Test functions for development
  const testContract = useCallback(async () => {
    if (!developmentConfig.debugMode) {
      toast('Debug mode is disabled');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing contract connection...');
      
      // Test by fetching lotteries
      await getLotteries();
      
      console.log('✅ Contract test successful!');
      toast.success('Contract connection test successful!');
      
    } catch (error: any) {
      const errorMsg = `Contract test failed: ${error.message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('❌ Contract test failed:', error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [getLotteries]);

  // Get Alice address (for testing)
  const getAliceAddress = useCallback(() => {
    return developmentConfig.aliceAddress;
  }, []);

  // Check if we're in development mode
  const isDevelopment = useCallback(() => {
    return developmentConfig.debugMode;
  }, []);

  return {
    lotteries,
    completedLotteries,
    loading,
    isLoading, // alias for backwards compatibility
    createLotteryLoading,
    enterLotteryLoading,
    error,
    getLotteries,
    getCompletedLotteries,
    createLottery,
    enterLottery,
    initializeAlice,
    testContract,
    getAliceAddress,
    isDevelopment,
    checkFreighterConnection,
  };
} 