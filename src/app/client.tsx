"use client";

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Hero from '../../components/Hero';
import LotteryCard from '../../components/LotteryCard';
import CreateLotteryForm from '../../components/CreateLotteryForm';
import Footer from '../../components/Footer';
import { useLotellar } from '../../hooks/lotellar.hook';
import WalletConnection from '../../components/WalletConnection';
import { LotteryCardSkeleton, WinnerCardSkeleton, LoadingSection } from '../../components/LoadingSkeleton';

import CommunityLotteryForm, { CommunityLotteryData } from '../../components/CommunityLotteryForm';
import CommunityLotteryCard, { CommunityLotteryType } from '../../components/CommunityLotteryCard';
import toast, { Toaster } from 'react-hot-toast';

export default function Client() {
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);
  
  // Community Lottery Form State
  const [showCommunityForm, setShowCommunityForm] = useState(false);
  const [communityLotteryLoading, setCommunityLotteryLoading] = useState(false);
  const [communityLotteries, setCommunityLotteries] = useState<CommunityLotteryType[]>([]);

  const { lotteries, completedLotteries, isLoading, createLotteryLoading, getLotteries, getCompletedLotteries, createLottery, enterLottery, checkFreighterConnection } = useLotellar();

  // Load lotteries on page load
  useEffect(() => {
    // Track page view
    
    getLotteries();
    getCompletedLotteries();
    
    // Load community lotteries from localStorage
    const savedCommunityLotteries = localStorage.getItem('communityLotteries');
    if (savedCommunityLotteries) {
      setCommunityLotteries(JSON.parse(savedCommunityLotteries));
    } else {
      // Load mock community lotteries for demo
      setCommunityLotteries([
      {
        id: 'community-1',
        name: 'XLM Hodlers Giveaway',
        description: 'Special lottery for XLM holders in our community. Win big prizes by holding XLM tokens!',
        entryFee: 5,
        duration: 7 * 24 * 60 * 60,
        maxParticipants: 50,
        winnerCount: 3,
        participants: ['user1', 'user2', 'user3'],
        winner: null,
        winnerTxHash: null,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        creator: 'community-creator-1',
        prizePool: 15,
        requirements: {
          twitterFollow: true,
          twitterHandle: '@OverBlock_',
          minimumTokenBalance: true,
          tokenAmount: 100,
          tokenSymbol: 'XLM',
          nftCheck: false,
          nftCollection: ''
        }
      },
      {
        id: 'community-2',
        name: 'NFT Community Lottery',
        description: 'Exclusive lottery for NFT holders. Show your NFT collection and win amazing rewards!',
        entryFee: 10,
        duration: 14 * 24 * 60 * 60,
        maxParticipants: 30,
        winnerCount: 1,
        participants: ['user1', 'user2'],
        winner: null,
        winnerTxHash: null,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        creator: 'community-creator-2',
        prizePool: 20,
        requirements: {
          twitterFollow: true,
          twitterHandle: '@LotellarNFT',
          minimumTokenBalance: false,
          tokenAmount: 0,
          tokenSymbol: '',
          nftCheck: true,
          nftCollection: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
                 }
       }
     ]);
    }

  }, [getLotteries, getCompletedLotteries]);

  // Handle wallet connection
  const handleWalletConnect = (address: string) => {
    setUserPublicKey(address);
  };

  // Handle lottery creation
  const handleCreateLottery = async (name: string, entryFee: number, duration: number, maxParticipants: number) => {
    if (!userPublicKey) return;
    
    try {
      await createLottery(name, entryFee, duration, maxParticipants);
    } catch (error) {
      console.error('Failed to create lottery:', error);
      throw error;
    }
  };

  // Handle entering a lottery
  const handleEnterLottery = async (lotteryId: string) => {
    if (!userPublicKey) return;
    
    try {
      
      await enterLottery(lotteryId);
      
      
      // Refresh both active and completed lotteries
      setTimeout(() => {
        getCompletedLotteries();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to enter lottery:', error);
      
    }
  };

  // Handle community lottery creation - Normal lottery create işlevinin aynısı
  const handleCreateCommunityLottery = async (lotteryData: CommunityLotteryData) => {
    if (!userPublicKey) return;
    
    setCommunityLotteryLoading(true);
    
    try {
      
      console.log('🎲 Creating community lottery:', { 
        name: lotteryData.name, 
        entryFee: lotteryData.entryFee, 
        duration: lotteryData.duration, 
        maxParticipants: lotteryData.maxParticipants 
      });
      
      // Create lottery on blockchain first (same as normal lottery)
      await createLottery(
        lotteryData.name, 
        lotteryData.entryFee, 
        Math.floor(lotteryData.duration / (24 * 60 * 60)), // Convert seconds to days for normal lottery
        lotteryData.maxParticipants
      );
      
      console.log('✅ Community lottery created on blockchain successfully!');
      
      // Store additional community lottery data in localStorage
      const lotteryId = `community-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newCommunityLottery: CommunityLotteryType = {
        id: lotteryId, // Use unique community lottery ID
        name: lotteryData.name,
        description: lotteryData.description,
        entryFee: lotteryData.entryFee,
        duration: lotteryData.duration,
        maxParticipants: lotteryData.maxParticipants,
        winnerCount: lotteryData.winnerCount,
        participants: [],
        winner: null,
        winnerTxHash: null,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        creator: userPublicKey,
        prizePool: 0,
        requirements: lotteryData.requirements
      };
      
      setCommunityLotteries(prev => {
        const updated = [...prev, newCommunityLottery];
        localStorage.setItem('communityLotteries', JSON.stringify(updated));
        return updated;
      });
      
      // Track successful creation
      
      // Refresh lottery list to show new lottery
      await getLotteries();
      
      // Close the form after successful creation
      setShowCommunityForm(false);
      
      // Show success message
      toast.success(`Community lottery "${lotteryData.name}" created successfully!`);
      
    } catch (error) {
      console.error('Failed to create community lottery:', error);
      
      
      throw error;
    } finally {
      setCommunityLotteryLoading(false);
    }
  };

  // Handle entering a community lottery - Normal lottery enter işlevinin aynısı
  const handleEnterCommunityLottery = async (lotteryId: string) => {
    if (!userPublicKey) return;
    
    try {
      // Track community lottery entry attempt
      const targetLottery = communityLotteries.find(l => l.id === lotteryId);
      
      // Find the corresponding blockchain lottery ID
      // For now, we'll use normal lottery enter pattern but with community lottery tracking
      const userAddress = await checkFreighterConnection();
      
      console.log('🎫 Entering community lottery:', lotteryId);
      
             // Use enterLottery function (same as normal lottery)
       // Since community lotteries are also created on blockchain, we can use the same enter function
       // We need to find the corresponding blockchain lottery ID
       const blockchainLotteryId = lotteries.find(l => l.name === targetLottery?.name)?.id;
       
       if (blockchainLotteryId) {
         await enterLottery(blockchainLotteryId);
       } else {
         throw new Error('Blockchain lottery not found for this community lottery');
       }
      
      // Update community lottery state after successful entry
      setCommunityLotteries(prev => {
        const updated = prev.map(lottery => {
          if (lottery.id === lotteryId) {
            const updatedParticipants = [...lottery.participants, userAddress];
            return {
              ...lottery,
              participants: updatedParticipants,
              prizePool: lottery.entryFee * updatedParticipants.length
            };
          }
          return lottery;
        });
        localStorage.setItem('communityLotteries', JSON.stringify(updated));
        return updated;
      });
      
      
      console.log('✅ Successfully entered community lottery!');
      toast.success('Successfully entered the community lottery! Good luck!');
      
      // Refresh both active and completed lotteries
      setTimeout(() => {
        getCompletedLotteries();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to enter community lottery:', error);
      
      const errorMsg = `Failed to enter community lottery: ${(error as ApiErrorProps).message || 'Unknown error'}`;
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen">
        <Toaster />
      {/* Header */}
      <Header onConnect={handleWalletConnect} publicKey={userPublicKey} />

      {/* Main Content */}
      <main id="main-content" className="min-h-screen" role="main">
        {/* Hero Section */}
        <Hero />

      {/* Active Lotteries Section */}
      <section id="active-lotteries" className="py-20 bg-background/50">
        <div className="container">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="section-title">Active Lotteries</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Join ongoing lotteries and compete for amazing prizes. All results are transparent and verifiable on the blockchain.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <LotteryCardSkeleton key={index} />
              ))}
            </div>
          ) : lotteries.filter(lottery => !lottery.isCompleted).length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card-bg flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Active Lotteries</h3>
              <p className="text-muted mb-6">Be the first to create a lottery and start winning!</p>
              <button className="btn btn-accent">
                Create Lottery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-10 md:gap-15 lg:gap-20 relative">
              {lotteries
                .filter(lottery => !lottery.isCompleted && !lottery.isCommunityLottery)
                .map((lottery) => (
                  <LotteryCard
                    key={lottery.id}
                    lottery={lottery}
                    userPublicKey={userPublicKey}
                    onEnter={handleEnterLottery}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Winners Section */}
      <section id="winners" className="py-20 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="container">
          <div className="text-center mb-16 animate-slideInLeft">
            <h2 className="section-title">🏆 Winners</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Celebrate our recent lottery winners! These lucky participants have won big prizes in our decentralized lotteries.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <WinnerCardSkeleton key={index} />
              ))}
            </div>
          ) : completedLotteries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card-bg flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Winners Yet</h3>
              <p className="text-muted mb-6">Complete a lottery to see winners appear here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedLotteries
                .slice()
                .reverse() // Show most recent winners first
                .map((lottery) => (
                  <div key={lottery.id} className="card p-6 bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">{lottery.name}</h3>
                      
                      <div className="mb-4">
                        <p className="text-sm text-muted mb-1">Winner</p>
                        <p className="text-sm font-mono text-accent break-all">
                          {lottery.winner ? `${lottery.winner.substring(0, 6)}...${lottery.winner.substring(lottery.winner.length - 6)}` : 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted">Prize Won</p>
                          <p className="text-lg font-bold text-accent">{(lottery.prizePool * 0.9).toFixed(2)} XLM</p>
                          <p className="text-xs text-muted">(90% of pool)</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Total Pool</p>
                          <p className="text-lg font-bold text-white">{lottery.prizePool} XLM</p>
                          <p className="text-xs text-muted">({lottery.participants.length} players)</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <p className="text-xs text-muted mb-2">
                          Won on {new Date(lottery.createdAt).toLocaleDateString()}
                        </p>
                        <div className="text-center">
                          {lottery.winnerTxHash ? (
                            <a 
                              href={`https://stellar.expert/explorer/testnet/tx/${lottery.winnerTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-accent hover:text-accent-hover transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Winner TX
                            </a>
                          ) : (
                            <a 
                              href={`https://stellar.expert/explorer/testnet/account/${lottery.winner}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs text-muted hover:text-accent transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              View Winner
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Community Lotteries Gallery Section */}
      <section id="community-lotteries-gallery" className="py-20 bg-gradient-to-br from-brand-red/5 via-background/95 to-brand-red-light/5">
        <div className="container">
          <div className="text-center mb-16 animate-slideInRight">
            <h2 className="section-title gradient-text-red">🌟 Community Lotteries</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Exclusive lotteries with special requirements and enhanced prizes. Join our community challenges and win big!
            </p>
          </div>

          {communityLotteries.filter(lottery => !lottery.isCompleted).length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg-red-subtle flex items-center justify-center">
                <svg className="w-10 h-10 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Community Lotteries Yet</h3>
              <p className="text-muted mb-6">Be the first to create a community lottery with special requirements!</p>
              <button 
                onClick={() => setShowCommunityForm(true)}
                className="gradient-bg-red text-white font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300"
              >
                Create Community Lottery
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {communityLotteries
                .filter(lottery => !lottery.isCompleted)
                .map((lottery) => (
                  <CommunityLotteryCard
                    key={lottery.id}
                    lottery={lottery}
                    userPublicKey={userPublicKey}
                    onEnter={handleEnterCommunityLottery}
                  />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Lottery Section */}
      <section id="create-lottery" className="py-20 bg-card-bg/30">
        <div className="container">
          <div className="text-center mb-16 animate-slideInRight">
            <h2 className="section-title">Create Your Own Lottery</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Set up a new lottery with custom parameters. Define entry fees, participant limits, and prize distribution.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <CreateLotteryForm 
              userPublicKey={userPublicKey}
              onCreate={handleCreateLottery}
              isLoading={createLotteryLoading}
            />
          </div>
        </div>
      </section>

      {/* My Tickets Section */}
      <section id="my-tickets" className="py-20 bg-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">My Tickets</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              View all your active lottery tickets and track your winnings.
            </p>
          </div>
          
          {!userPublicKey ? (
            <div className="text-center py-10 max-w-2xl mx-auto">
              <div className="card p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-card-bg flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-muted mb-6">Connect your Stellar wallet to view your tickets and track your lottery entries.</p>
                <WalletConnection onConnect={handleWalletConnect} />
              </div>
            </div>
          ) : isLoading ? (
            <LoadingSection 
              title="Loading Your Tickets" 
              description="Fetching your lottery entries from the blockchain..." 
            />
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Your Active Tickets</h3>
                
                {lotteries.filter(lottery => 
                  lottery.participants.includes(userPublicKey)
                ).length > 0 ? (
                  <div className="space-y-4">
                    {lotteries
                      .filter(lottery => lottery.participants.includes(userPublicKey))
                      .map(lottery => (
                        <div key={lottery.id} className="flex items-center justify-between p-4 bg-card-bg/50 rounded-lg border border-border/50">
                          <div>
                            <h4 className="font-medium text-white">{lottery.name}</h4>
                            <p className="text-sm text-muted">Entry Fee: {lottery.entryFee} XLM</p>
                          </div>
                          <div className="text-right">
                            <div className={`badge ${lottery.isCompleted ? 'badge-accent' : 'badge-primary'}`}>
                              {lottery.isCompleted ? 'Completed' : 'Active'}
                            </div>
                            {lottery.isCompleted && lottery.winner === userPublicKey && (
                              <div className="badge badge-success mt-2 ml-2">Winner!</div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted mb-4">You haven&apos;t entered any lotteries yet.</p>
                    <a href="#active-lotteries" className="btn btn-primary">Browse Lotteries</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Community Lotteries Section */}
      <section id="Community Lotteries" className="py-20 bg-card-bg/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title">Community Lotteries</h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Manage your create Community lotteries.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full gradient-bg-red-subtle flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">Create New Community Lottery</h3>
              <p className="text-muted mb-8 max-w-md mx-auto">
                Start your own lottery and bring your community together. Set custom parameters and watch the excitement grow!
              </p>
              
              <button 
                onClick={() => setShowCommunityForm(true)}
                className="gradient-bg-red text-white font-semibold px-8 py-4 text-lg rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-card-bg"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Lottery
              </button>
            </div>
          </div>
        </div>
      </section>

        {/* Footer */}
        <Footer />
      </main>

      {/* Community Lottery Form Modal */}
      {showCommunityForm && (
        <CommunityLotteryForm
          userPublicKey={userPublicKey}
          onCreate={handleCreateCommunityLottery}
          isLoading={communityLotteryLoading}
          onClose={() => setShowCommunityForm(false)}
        />
      )}
    </div>
  );
} 