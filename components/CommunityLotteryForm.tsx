"use client";

import { useState } from 'react';
import { LoadingSpinner } from './LoadingSkeleton';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CommunityLotteryFormProps {
  userPublicKey: string | null;
  onCreate: (lotteryData: CommunityLotteryData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export interface CommunityLotteryData {
  name: string;
  description: string;
  entryFee: number;
  duration: number;
  maxParticipants: number;
  winnerCount: number;
  requirements: {
    twitterFollow: boolean;
    twitterHandle: string;
    minimumTokenBalance: boolean;
    tokenAmount: number;
    tokenSymbol: string;
    nftCheck: boolean;
    nftCollection: string;
  };
}

export default function CommunityLotteryForm({ userPublicKey, onCreate, isLoading, onClose }: CommunityLotteryFormProps) {
  const [formStep, setFormStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [entryFee, setEntryFee] = useState(1);
  const [duration, setDuration] = useState(7); // days
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [winnerCount, setWinnerCount] = useState(1);
  const router = useRouter()

  // Requirements
  const [twitterFollow, setTwitterFollow] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [minimumTokenBalance, setMinimumTokenBalance] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(100);
  const [tokenSymbol, setTokenSymbol] = useState('XLM');
  const [nftCheck, setNftCheck] = useState(false);
  const [nftCollection, setNftCollection] = useState('');

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step >= 0) {
      if (!name.trim()) {
        newErrors.name = 'Lottery name is required';
      } else if (name.trim().length < 3) {
        newErrors.name = 'Lottery name must be at least 3 characters';
      }

      if (!description.trim()) {
        newErrors.description = 'Description is required';
      } else if (description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }
    }

    if (step >= 1) {
      if (entryFee <= 0) {
        newErrors.entryFee = 'Entry fee must be greater than 0';
      }

      if (duration <= 0) {
        newErrors.duration = 'Duration must be greater than 0';
      }

      if (maxParticipants < 2) {
        newErrors.maxParticipants = 'Minimum 2 participants required';
      }

      if (winnerCount <= 0) {
        newErrors.winnerCount = 'At least 1 winner required';
      }

      if (winnerCount >= maxParticipants) {
        newErrors.winnerCount = 'Winner count must be less than max participants';
      }
    }

    if (step >= 2) {
      if (twitterFollow && !twitterHandle.trim()) {
        newErrors.twitterHandle = 'Twitter handle is required when Twitter follow is enabled';
      }

      if (minimumTokenBalance && tokenAmount <= 0) {
        newErrors.tokenAmount = 'Token amount must be greater than 0';
      }

      if (minimumTokenBalance && !tokenSymbol.trim()) {
        newErrors.tokenSymbol = 'Token symbol is required when token balance check is enabled';
      }

      if (nftCheck && !nftCollection.trim()) {
        newErrors.nftCollection = 'NFT collection address is required when NFT check is enabled';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userPublicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateStep(2)) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const lotteryData: CommunityLotteryData = {
      name,
      description,
      entryFee,
      duration: duration * 24 * 60 * 60, // Convert days to seconds
      maxParticipants,
      winnerCount,
      requirements: {
        twitterFollow,
        twitterHandle,
        minimumTokenBalance,
        tokenAmount,
        tokenSymbol,
        nftCheck,
        nftCollection,
      },
    };

    try {
      await onCreate(lotteryData);
      // Reset form like in normal CreateLotteryForm
      setName('');
      setDescription('');
      setEntryFee(1);
      setDuration(7);
      setMaxParticipants(10);
      setWinnerCount(1);
      setTwitterFollow(false);
      setTwitterHandle('');
      setMinimumTokenBalance(false);
      setTokenAmount(100);
      setTokenSymbol('XLM');
      setNftCheck(false);
      setNftCollection('');
      setFormStep(0);
      setErrors({});
      onClose();
      router.push('#community-lotteries-gallery')
      toast.success('Community lottery created successfully!');
    } catch (err) {
      const errorMsg = `Failed to create lottery: ${(err as ApiErrorProps).message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('CommunityLotteryForm error:', err);
    }
  };

  const handleNext = (step: number) => {
    if (validateStep(step)) {
      setFormStep(step + 1);
    }
  };

  const handleBack = (step: number) => {
    setFormStep(step - 1);
    setErrors({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-card-bg rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-labelledby="community-form-title"
        aria-modal="true"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 id="community-form-title" className="text-2xl font-bold text-primary">
            Create Community Lottery
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red rounded"
            aria-label="Close form"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <nav aria-label="Form progress" className="flex justify-between mb-8">
          <div className={`flex flex-col items-center ${formStep >= 0 ? 'text-accent' : 'text-muted'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formStep >= 0 ? 'bg-primary text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            >
              1
            </div>
            <span className="text-sm">Details</span>
          </div>
          <div className="grow border-t border-border self-center mx-3" aria-hidden="true"></div>
          <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-accent' : 'text-muted'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formStep >= 1 ? 'bg-primary text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            >
              2
            </div>
            <span className="text-sm">Settings</span>
          </div>
          <div className="grow border-t border-border self-center mx-3" aria-hidden="true"></div>
          <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-accent' : 'text-muted'}`}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                formStep >= 2 ? 'bg-primary text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            >
              3
            </div>
            <span className="text-sm">Requirements</span>
          </div>
        </nav>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Details */}
          {formStep === 0 && (
            <fieldset className="space-y-6">
              <legend className="sr-only">Lottery Details</legend>

              <div>
                <label htmlFor="lottery-name" className="block text-sm font-medium mb-2">
                  Lottery Name *
                </label>
                <input
                  type="text"
                  id="lottery-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="e.g. Community XLM Giveaway"
                  required
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <label htmlFor="lottery-description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="lottery-description"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red resize-none ${
                    errors.description ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Describe your lottery, prizes, and any special conditions..."
                  required
                />
                {errors.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleNext(0)}
                  disabled={!name.trim() || !description.trim()}
                  className="bg-primary text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  Next
                </button>
              </div>
            </fieldset>
          )}

          {/* Step 2: Settings */}
          {formStep === 1 && (
            <fieldset className="space-y-6">
              <legend className="sr-only">Lottery Settings</legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="entry-fee" className="block text-sm font-medium mb-2">
                    Entry Fee (XLM) *
                  </label>
                  <input
                    type="number"
                    id="entry-fee"
                    value={entryFee}
                    onChange={(e) => {
                      setEntryFee(Number(e.target.value));
                      if (errors.entryFee) setErrors(prev => ({ ...prev, entryFee: '' }));
                    }}
                    min="0.1"
                    step="0.1"
                    className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                      errors.entryFee ? 'border-red-500' : 'border-border'
                    }`}
                    required
                  />
                  {errors.entryFee && (
                    <div className="text-red-500 text-sm mt-1">{errors.entryFee}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-2">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                      if (errors.duration) setErrors(prev => ({ ...prev, duration: '' }));
                    }}
                    min="1"
                    max="30"
                    className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                      errors.duration ? 'border-red-500' : 'border-border'
                    }`}
                    required
                  />
                  {errors.duration && (
                    <div className="text-red-500 text-sm mt-1">{errors.duration}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="max-participants" className="block text-sm font-medium mb-2">
                    Max Participants *
                  </label>
                  <input
                    type="number"
                    id="max-participants"
                    value={maxParticipants}
                    onChange={(e) => {
                      setMaxParticipants(Number(e.target.value));
                      if (errors.maxParticipants) setErrors(prev => ({ ...prev, maxParticipants: '' }));
                    }}
                    min="2"
                    max="1000"
                    className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                      errors.maxParticipants ? 'border-red-500' : 'border-border'
                    }`}
                    required
                  />
                  {errors.maxParticipants && (
                    <div className="text-red-500 text-sm mt-1">{errors.maxParticipants}</div>
                  )}
                </div>

                <div>
                  <label htmlFor="winner-count" className="block text-sm font-medium mb-2">
                    Number of Winners *
                  </label>
                  <input
                    type="number"
                    id="winner-count"
                    value={winnerCount}
                    onChange={(e) => {
                      setWinnerCount(Number(e.target.value));
                      if (errors.winnerCount) setErrors(prev => ({ ...prev, winnerCount: '' }));
                    }}
                    min="1"
                    max={Math.max(1, maxParticipants - 1)}
                    className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                      errors.winnerCount ? 'border-red-500' : 'border-border'
                    }`}
                    required
                  />
                  {errors.winnerCount && (
                    <div className="text-red-500 text-sm mt-1">{errors.winnerCount}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => handleBack(1)}
                  className="btn btn-outline px-6 py-3"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleNext(1)}
                  className="bg-primary text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  Next
                </button>
              </div>
            </fieldset>
          )}

          {/* Step 3: Requirements */}
          {formStep === 2 && (
            <fieldset className="space-y-6">
              <legend className="sr-only">Entry Requirements</legend>

              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-white">Entry Requirements</h4>
                <p className="text-sm text-muted">Set requirements participants must meet to enter your lottery</p>

                {/* Twitter Follow */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium text-white">Twitter Follow</h5>
                      <p className="text-sm text-muted">Require participants to follow a Twitter account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={twitterFollow}
                        onChange={(e) => setTwitterFollow(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {twitterFollow && (
                    <input
                      type="text"
                      placeholder="@username"
                      value={twitterHandle}
                      onChange={(e) => {
                        setTwitterHandle(e.target.value);
                        if (errors.twitterHandle) setErrors(prev => ({ ...prev, twitterHandle: '' }));
                      }}
                      className={`w-full px-4 py-2 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                        errors.twitterHandle ? 'border-red-500' : 'border-border'
                      }`}
                    />
                  )}
                  {errors.twitterHandle && (
                    <div className="text-red-500 text-sm mt-1">{errors.twitterHandle}</div>
                  )}
                </div>

                {/* Token Balance */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium text-white">Minimum Token Balance</h5>
                      <p className="text-sm text-muted">Require participants to hold a minimum amount of tokens</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={minimumTokenBalance}
                        onChange={(e) => setMinimumTokenBalance(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {minimumTokenBalance && (
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={tokenAmount}
                        onChange={(e) => {
                          setTokenAmount(Number(e.target.value));
                          if (errors.tokenAmount) setErrors(prev => ({ ...prev, tokenAmount: '' }));
                        }}
                        min="0"
                        className={`px-4 py-2 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                          errors.tokenAmount ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Token Symbol"
                        value={tokenSymbol}
                        onChange={(e) => {
                          setTokenSymbol(e.target.value);
                          if (errors.tokenSymbol) setErrors(prev => ({ ...prev, tokenSymbol: '' }));
                        }}
                        className={`px-4 py-2 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                          errors.tokenSymbol ? 'border-red-500' : 'border-border'
                        }`}
                      />
                    </div>
                  )}
                  {(errors.tokenAmount || errors.tokenSymbol) && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.tokenAmount || errors.tokenSymbol}
                    </div>
                  )}
                </div>

                {/* NFT Check */}
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h5 className="font-medium text-white">NFT Ownership</h5>
                      <p className="text-sm text-muted">Require participants to own NFTs from a specific collection</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nftCheck}
                        onChange={(e) => setNftCheck(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {nftCheck && (
                    <input
                      type="text"
                      placeholder="NFT Collection Contract Address"
                      value={nftCollection}
                      onChange={(e) => {
                        setNftCollection(e.target.value);
                        if (errors.nftCollection) setErrors(prev => ({ ...prev, nftCollection: '' }));
                      }}
                      className={`w-full px-4 py-2 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand-red ${
                        errors.nftCollection ? 'border-red-500' : 'border-border'
                      }`}
                    />
                  )}
                  {errors.nftCollection && (
                    <div className="text-red-500 text-sm mt-1">{errors.nftCollection}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => handleBack(2)}
                  className="btn btn-outline px-6 py-3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-red hover:shadow-lg animate-pulse"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </div>
                  ) : (
                    'Create Community Lottery'
                  )}
                </button>
              </div>
            </fieldset>
          )}
        </form>
      </div>
    </div>
  );
} 