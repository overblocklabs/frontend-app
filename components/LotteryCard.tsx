"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSkeleton";

interface LotteryCardProps {
  lottery: LotteryType;
  userPublicKey: string | null;
  onEnter: (lotteryId: string) => void;
}

export default function LotteryCard({ lottery, userPublicKey, onEnter }: LotteryCardProps) {

  const [isLoading, setIsLoading] = useState(false);
  
  const isActive = lottery.participants.length < lottery.maxParticipants && !lottery.isCompleted;
  const hasJoined = userPublicKey && lottery.participants.includes(userPublicKey);
  const isWinner = lottery.isCompleted && lottery.winner === userPublicKey;
  
  // Calculate progress percentage
  const progressPercentage = (lottery.participants.length / lottery.maxParticipants) * 100;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Handle enter lottery
  const handleEnterLottery = async () => {
    if(!userPublicKey){
      return window.dispatchEvent(new Event('connect-wallet'))
    }
    if (!isActive || hasJoined) return;
    setIsLoading(true);
    try {
      await onEnter(lottery.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (isActive && userPublicKey && !hasJoined && !isLoading) {
        handleEnterLottery();
      }
    }
  };

  // Get status text for screen readers
  const getStatusText = () => {
    if (isWinner) return 'You won this lottery!';
    if (hasJoined) return 'You have entered this lottery';
    if (isActive) return 'Active lottery - available to join';
    return 'Lottery has ended';
  };

  // Get button text and state
  const getButtonProps = () => {
    if (!userPublicKey) {
      return {
        text: 'Connect Wallet',
        disabled: false,
        ariaLabel: 'Connect your wallet to participate in this lottery'
      };
    }
    if (isWinner) {
      return {
        text: 'You Won! 🎉',
        disabled: true,
        ariaLabel: `Congratulations! You won ${(lottery.prizePool * 0.9).toFixed(2)} XLM in this lottery`
      };
    }
    if (hasJoined) {
      return {
        text: 'Entered ✓',
        disabled: true,
        ariaLabel: 'You have already entered this lottery'
      };
    }
    if (isActive) {
      return {
        text: 'Enter Lottery',
        disabled: isLoading,
        ariaLabel: `Enter lottery "${lottery.name}" with ${lottery.entryFee} XLM entry fee`
      };
    }
    return {
      text: 'Lottery Ended',
      disabled: true,
      ariaLabel: 'This lottery has ended'
    };
  };

  const buttonProps = getButtonProps();

  return (
    <article
      className="card neon-card transition-all duration-500 ease-out transform px-6 py-7 z-10"
      style={{ minHeight: 260 }}
      role="article"
      aria-labelledby={`lottery-title-${lottery.id}`}
      aria-describedby={`lottery-details-${lottery.id}`}
    >
      {/* Screen reader status announcement */}
      <div className="sr-only" aria-live="polite" id={`lottery-status-${lottery.id}`}>
        {getStatusText()}
      </div>

      <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6 h-full flex-wrap">
        {/* Left: Icon and title */}
        <div className="flex items-center gap-4 min-w-[160px]">
          <div 
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
            aria-hidden="true"
          >
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h3 
              id={`lottery-title-${lottery.id}`}
              className="text-xl font-bold text-white mb-1 leading-tight capitalize"
              style={{ textShadow: '0 0 4px rgba(139, 69, 255, 0.5)' }}
            >
              {lottery.name}
            </h3>
            <p className="text-xs text-muted">#{lottery.id.substring(0, 8)}</p>
            <div className="mt-2">
              <span 
                className={`badge ${
                  isActive ? 'badge-neon-purple' : lottery.isCompleted ? 'badge-neon-cyan' : 'badge-neon-blue'
                }`}
                role="status"
                aria-label={`Lottery status: ${isActive ? 'Active' : lottery.isCompleted ? 'Ended' : 'In Progress'}`}
              >
                {isActive ? 'Active' : lottery.isCompleted ? 'Ended' : 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Participants and progress bar */}
        <div className="flex-1 flex flex-col justify-center min-w-[180px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted">Participants</span>
            <span 
              className="text-xs font-semibold text-accent"
              aria-label={`${lottery.participants.length} of ${lottery.maxParticipants} participants`}
            >
              {lottery.participants.length}/{lottery.maxParticipants}
            </span>
          </div>
          
          <div className="progress-bar mb-2" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
              aria-hidden="true"
            />
          </div>
          
          <div className="sr-only">
            Progress: {lottery.participants.length} out of {lottery.maxParticipants} participants ({Math.round(progressPercentage)}% full)
          </div>
          
          {lottery.isCompleted && lottery.winner && (
            <div className="text-xs text-accent font-medium mt-1">
              Winner: <span aria-label={`Winner address: ${lottery.winner}`}>{formatAddress(lottery.winner)}</span>
            </div>
          )}
        </div>

        {/* Right: Prize and button */}
        <div className="flex flex-col items-end justify-between w-full h-full">
          <div className="text-right">
            <div className="text-xs text-accent uppercase tracking-wider mb-1">Prize Pool</div>
            <div 
              className="text-2xl font-extrabold neon-glow-purple neon-pulse leading-tight"
              aria-label={`Prize pool: ${lottery.prizePool} XLM`}
            >
              {lottery.prizePool} <span className="text-base font-medium neon-glow-cyan">XLM</span>
            </div>
          </div>
          
          <div className="w-full mt-4">
            <button
              onClick={handleEnterLottery}
              onKeyDown={handleKeyDown}
              disabled={buttonProps.disabled || isLoading}
              className={`btn w-full py-2.5 px-6 font-semibold text-base transition-all duration-200 relative z-10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                !userPublicKey 
                  ? 'btn-primary' 
                  : isWinner
                    ? 'btn-primary'
                    : hasJoined
                      ? 'btn-primary'
                      : isActive
                        ? 'btn-primary'
                        : 'btn-outline opacity-50 cursor-not-allowed'
              }`}
              aria-label={buttonProps.ariaLabel}
              aria-describedby={`lottery-details-${lottery.id}`}
              tabIndex={0}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span>Processing...</span>
                </div>
              ) : buttonProps.text}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden detailed information for screen readers */}
      <div id={`lottery-details-${lottery.id}`} className="sr-only">
        Lottery Details: Entry fee {lottery.entryFee} XLM. 
        Created on {formatDate(lottery.createdAt)}. 
        Current prize pool: {lottery.prizePool} XLM. 
        {lottery.isCompleted 
          ? `This lottery has ended. Winner: ${lottery.winner ? formatAddress(lottery.winner) : 'Unknown'}`
          : `${lottery.maxParticipants - lottery.participants.length} spots remaining.`
        }
        {hasJoined && ' You have entered this lottery.'}
        {isWinner && ` Congratulations! You won ${(lottery.prizePool * 0.9).toFixed(2)} XLM.`}
      </div>
    </article>
  );
} 