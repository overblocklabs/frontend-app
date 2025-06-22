"use client";

import React, { useState } from "react";
import { CommunityLotteryData } from "./CommunityLotteryForm";
import { LoadingSpinner } from "./LoadingSkeleton";

export interface CommunityLotteryType extends CommunityLotteryData {
  id: string;
  participants: string[];
  winner: string | null;
  winnerTxHash: string | null;
  isCompleted: boolean;
  createdAt: string;
  creator: string;
  prizePool: number;
}

interface CommunityLotteryCardProps {
  lottery: CommunityLotteryType;
  userPublicKey: string | null;
  onEnter: (lotteryId: string) => void;
}

export default function CommunityLotteryCard({ lottery, userPublicKey, onEnter }: CommunityLotteryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedRequirements, setCompletedRequirements] = useState<string[]>([]);
  
  const isActive = lottery.participants.length < lottery.maxParticipants && !lottery.isCompleted;
  const hasJoined = userPublicKey && lottery.participants.includes(userPublicKey);
  const isWinner = lottery.isCompleted && lottery.winner === userPublicKey;
  
  // Calculate progress percentage
  const progressPercentage = (lottery.participants.length / lottery.maxParticipants) * 100;
  

  // Handle enter lottery
  const handleEnterLottery = async () => {

    if(!userPublicKey){
      window.dispatchEvent(new Event('connect-wallet'))
      return 
    }

    if (!isActive || hasJoined) return;
    
    // Check if all requirements are completed (temporarily disabled for testing)
    // if (activeRequirements > 0 && !allRequirementsCompleted()) {
    //   alert('Please complete all requirements before entering the lottery!');
    //   return;
    // }
    
    setIsLoading(true);
    try {
      console.log('🎯 CommunityLotteryCard: Calling onEnter with lottery ID:', lottery.id);
      await onEnter(lottery.id);
    } catch (error) {
      console.error('🚨 CommunityLotteryCard: Error in handleEnterLottery:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Count active requirements
  const activeRequirements = [
    lottery.requirements.twitterFollow,
    lottery.requirements.minimumTokenBalance,
    lottery.requirements.nftCheck
  ].filter(Boolean).length;

  // Handle requirement completion
  const handleRequirementComplete = (requirementType: string) => {
    if (!completedRequirements.includes(requirementType)) {
      setCompletedRequirements(prev => [...prev, requirementType]);
    }
  };

  // Handle Twitter link click
  const handleTwitterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mark Twitter requirement as completed
    handleRequirementComplete('twitter');
    // Open Twitter link
    window.open(`https://x.com/${lottery.requirements.twitterHandle.replace('@', '')}`, '_blank');
  };

  // Handle token requirement click
  const handleTokenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate token balance check (in real app, you'd check actual balance)
    handleRequirementComplete('token');
  };

  // Handle NFT requirement click
  const handleNftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate NFT ownership check (in real app, you'd check actual NFT ownership)
    handleRequirementComplete('nft');
  };

  return (
    <article
      className={`relative overflow-hidden transition-all duration-700 ease-out transform ${
        isHovered ? 'scale-[1.03] shadow-2xl z-20 -rotate-1' : 'z-10 hover:scale-[1.01]'
      } bg-gradient-to-br from-brand-red/10 via-background/90 to-brand-red-light/5 backdrop-blur-lg border-2 border-brand-red/30 rounded-2xl p-6 animate-fadeInUp`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: 320 }}
    >
      {/* Community Badge */}
      <div className="mb-2 ml-auto w-max">
        <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          COMMUNITY
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-brand-red/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-brand-red-light/10 rounded-full blur-lg"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg transform rotate-3">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 leading-tight capitalize">
              {lottery.name}
            </h3>
            <p className="text-sm text-muted line-clamp-2 mb-3">
              {lottery.description}
            </p>
            <div className="flex items-center gap-2">
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-green-500/20 text-green-400' : 'bg-brand-red/20 text-brand-red'
                }`}
              >
                {isActive ? 'Active' : 'Ended'}
              </span>
              {activeRequirements > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400">
                  {activeRequirements} Requirements
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-background/40 rounded-lg p-3 border border-brand-red/20">
            <p className="text-xs text-accent uppercase tracking-wider">Participants</p>
            <p className="text-lg font-bold text-primary">
              {lottery.participants.length}/{lottery.maxParticipants}
            </p>
          </div>
          <div className="bg-background/40 rounded-lg p-3 border border-brand-red/20">
            <p className="text-xs text-accent uppercase tracking-wider">Winners</p>
            <p className="text-lg font-bold text-primary">
              {lottery.winnerCount}
            </p>
          </div>
          <div className="bg-background/40 rounded-lg p-3 border border-brand-red/20">
            <p className="text-xs text-accent uppercase tracking-wider">Entry Fee</p>
            <p className="text-lg font-bold text-primary">
              {lottery.entryFee} XLM
            </p>
          </div>
          <div className="bg-background/40 rounded-lg p-3 border border-brand-red/20">
            <p className="text-xs text-accent uppercase tracking-wider">Prize Pool</p>
            <p className="text-lg font-bold text-primary">
              {lottery.prizePool} XLM
            </p>
          </div>
        </div>

        {/* Requirements Section */}
        {activeRequirements > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-3">Entry Requirements:</h4>
            <div className="space-y-2">
              {lottery.requirements.twitterFollow && (
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-muted">Follow</span>
                  <button 
                    onClick={handleTwitterClick}
                    className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded"
                  >
                    {lottery.requirements.twitterHandle}
                  </button>
                  {completedRequirements.includes('twitter') && (
                    <svg className="w-4 h-4 text-green-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              )}
              {lottery.requirements.minimumTokenBalance && (
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <button 
                    onClick={handleTokenClick}
                    className="text-muted hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded"
                  >
                    Hold {lottery.requirements.tokenAmount} {lottery.requirements.tokenSymbol}
                  </button>
                  {completedRequirements.includes('token') && (
                    <svg className="w-4 h-4 text-green-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              )}
              {lottery.requirements.nftCheck && (
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <button 
                    onClick={handleNftClick}
                    className="text-muted hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 rounded"
                  >
                    Own NFT from collection
                  </button>
                  {completedRequirements.includes('nft') && (
                    <svg className="w-4 h-4 text-green-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-background/60 rounded-full h-2">
            <div 
              className="gradient-bg h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleEnterLottery}
          disabled={!isActive || hasJoined || isLoading}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-300 relative overflow-hidden ${
            !userPublicKey 
              ? 'bg-primary text-white hover:shadow-lg' 
              : isWinner
                ? 'bg-primary text-white'
                : hasJoined
                  ? 'bg-primary text-blue-400 border border-blue-500/30'
                  : isActive
                    ? 'bg-primary text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span>Processing...</span>
            </div>
          ) : !userPublicKey ? (
            'Connect Wallet'
          ) : isWinner ? (
            '🎉 You Won!'
          ) : hasJoined ? (
            '✓ Entered'
          ) : isActive ? (
            'Enter Community Lottery'
          ) : (
            'Lottery Ended'
          )}
        </button>

        {/* Winner Info */}
        {lottery.isCompleted && lottery.winner && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-400 font-medium">
              Winner: {formatAddress(lottery.winner)}
            </p>
          </div>
        )}
      </div>
    </article>
  );
} 