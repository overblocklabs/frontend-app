"use client";

import { useState } from 'react';
import { appConfig } from '../config/env';
import { LoadingSpinner } from './LoadingSkeleton';
import toast from 'react-hot-toast';

interface CreateLotteryFormProps {
  userPublicKey: string | null;
  onCreate: (name: string, entryFee: number, duration: number, maxParticipants: number) => Promise<void>;
  isLoading: boolean;
}

export default function CreateLotteryForm({ userPublicKey, onCreate, isLoading }: CreateLotteryFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [entryFee, setEntryFee] = useState(1);
  const [maxParticipants, setMaxParticipants] = useState(appConfig.minParticipants);
  const [formStep, setFormStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation functions
  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step >= 0) {
      if (!name.trim()) {
        newErrors.name = 'Lottery name is required';
      } else if (name.trim().length < 3) {
        newErrors.name = 'Lottery name must be at least 3 characters';
      }
    }

    if (step >= 1) {
      if (entryFee <= 0) {
        newErrors.entryFee = 'Entry fee must be greater than 0';
      }

      if (!maxParticipants || maxParticipants < appConfig.minParticipants) {
        newErrors.maxParticipants = `Minimum ${appConfig.minParticipants} participants required`;
      }

      if (maxParticipants > appConfig.maxParticipants) {
        newErrors.maxParticipants = `Maximum ${appConfig.maxParticipants} participants allowed`;
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

    try {
      await onCreate(name, entryFee, appConfig.defaultLotteryDuration, maxParticipants);
      // Reset form
      setName('');
      setEntryFee(1);
      setMaxParticipants(appConfig.minParticipants);
      setIsFormOpen(false);
      setFormStep(0);
      setErrors({});
    } catch (err) {
      const errorMsg = `Failed to create lottery: ${(err as ApiErrorProps).message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error('CreateLotteryForm error:', err);
    }
  };

  const handleNext = (step: number) => {
    if (validateStep(step)) {
      setFormStep(step + 1);
    }
  };

  const handleBack = (step: number) => {
    setFormStep(step - 1);
    setErrors({}); // Clear errors when going back
  };

  // Handle escape key to close form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFormOpen) {
      setIsFormOpen(false);
      setFormStep(0);
      setErrors({});
    }
  };

  if (!isFormOpen) {
    return (
      <section
        className="text-center max-w-xl mx-auto"
        id="create-lottery"
        aria-labelledby="create-lottery-heading"
      >
       
        
        
        
        
        <button
          onClick={() => setIsFormOpen(true)}
          disabled={!userPublicKey}
          className={`btn px-6 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 hover:scale-105 hover:shadow-lg ${userPublicKey ? 'btn-accent animate-pulse' : 'btn-outline'}`}
          aria-describedby={!userPublicKey ? "wallet-connect-requirement" : undefined}
        >
          {userPublicKey ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Lottery
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect Wallet to Create
            </>
          )}
        </button>

        {!userPublicKey && (
          <div id="wallet-connect-requirement" className="text-xs text-muted mt-2">
            You need to connect your Stellar wallet to create a lottery
          </div>
        )}
      </section>
    );
  }

      return (
    <div
      className="bg-card-bg rounded-lg p-8 max-w-lg mx-auto border border-border animate-fadeInUp shadow-2xl"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="form-title"
      aria-describedby="form-description"
      aria-modal="true"
    >
      <div className="flex justify-between items-center mb-8">
        <h3 id="form-title" className="text-2xl font-bold">Create New Lottery</h3>
        <button
          onClick={() => {
            setIsFormOpen(false);
            setFormStep(0);
            setErrors({});
          }}
          className="text-muted hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
          aria-label="Close form"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div id="form-description" className="sr-only">
        Multi-step form to create a new lottery. Step {formStep + 1} of 3.
      </div>

      {/* Step indicator */}
      <nav aria-label="Form progress" className="flex justify-between mb-10">
        <div className={`flex flex-col items-center ${formStep >= 0 ? 'text-accent' : 'text-muted'}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 0 ? 'bg-accent text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            aria-current={formStep === 0 ? 'step' : undefined}
            role="img"
            aria-label={`Step 1: Details ${formStep > 0 ? '(completed)' : formStep === 0 ? '(current)' : ''}`}
          >
            1
          </div>
          <span className="text-sm">Details</span>
        </div>
        <div className="grow border-t border-border self-center mx-3" aria-hidden="true"></div>
        <div className={`flex flex-col items-center ${formStep >= 1 ? 'text-accent' : 'text-muted'}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 1 ? 'bg-accent text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            aria-current={formStep === 1 ? 'step' : undefined}
            role="img"
            aria-label={`Step 2: Parameters ${formStep > 1 ? '(completed)' : formStep === 1 ? '(current)' : ''}`}
          >
            2
          </div>
          <span className="text-sm">Parameters</span>
        </div>
        <div className="grow border-t border-border self-center mx-3" aria-hidden="true"></div>
        <div className={`flex flex-col items-center ${formStep >= 2 ? 'text-accent' : 'text-muted'}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formStep >= 2 ? 'bg-accent text-white' : 'bg-card-bg border border-border text-muted'
              }`}
            aria-current={formStep === 2 ? 'step' : undefined}
            role="img"
            aria-label={`Step 3: Review ${formStep === 2 ? '(current)' : ''}`}
          >
            3
          </div>
          <span className="text-sm">Review</span>
        </div>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Step 1: Details */}
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
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent ${errors.name ? 'border-red-500' : 'border-border'
                  }`}
                placeholder="e.g. Weekly Lottery #4"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : "name-help"}
                autoFocus
              />
              {errors.name && (
                <div id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.name}
                </div>
              )}
              <div id="name-help" className="text-xs text-muted mt-1">
                Choose a memorable name for your lottery
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleNext(0)}
                disabled={!name.trim()}
                className="gradient-bg-red text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-card-bg hover:shadow-lg"
                aria-describedby={!name.trim() ? "next-disabled-help" : undefined}
              >
                Next
              </button>
              {!name.trim() && (
                <div id="next-disabled-help" className="sr-only">
                  Enter a lottery name to continue
                </div>
              )}
            </div>
          </fieldset>
        )}

        {/* Step 2: Parameters */}
        {formStep === 1 && (
          <fieldset className="space-y-6">
            <legend className="sr-only">Lottery Parameters</legend>

            <div>
              <label htmlFor="entry-fee" className="block text-sm font-medium mb-2">
                Entry Fee (XLM) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="entry-fee"
                  name="entryFee"
                  value={entryFee}
                  onChange={(e) => {
                    setEntryFee(Number(e.target.value));
                    if (errors.entryFee) {
                      setErrors(prev => ({ ...prev, entryFee: '' }));
                    }
                  }}
                  min="0.1"
                  step="0.1"
                  className={`w-full px-4 py-3 pr-16 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent ${errors.entryFee ? 'border-red-500' : 'border-border'
                    }`}
                  required
                  aria-invalid={!!errors.entryFee}
                  aria-describedby={errors.entryFee ? "entry-fee-error" : "entry-fee-help"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <span className="text-yellow-400 text-sm font-medium" aria-hidden="true">XLM</span>
                </div>
              </div>
              {errors.entryFee && (
                <div id="entry-fee-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.entryFee}
                </div>
              )}
              <div id="entry-fee-help" className="text-xs text-muted mt-1">
                Amount each participant must pay to enter (minimum 0.1 XLM)
              </div>
            </div>

            <div>
              <label htmlFor="max-participants" className="block text-sm font-medium mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                id="max-participants"
                name="maxParticipants"
                value={maxParticipants}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= appConfig.minParticipants || e.target.value === '') {
                    setMaxParticipants(value);
                    if (errors.maxParticipants) {
                      setErrors(prev => ({ ...prev, maxParticipants: '' }));
                    }
                  }
                }}
                min={appConfig.minParticipants}
                max={appConfig.maxParticipants}
                placeholder={`Min. ${appConfig.minParticipants}`}
                className={`w-full px-4 py-3 bg-background border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted ${errors.maxParticipants ? 'border-red-500' : 'border-border'
                  }`}
                required
                aria-invalid={!!errors.maxParticipants}
                aria-describedby={errors.maxParticipants ? "max-participants-error" : "max-participants-help"}
              />
              {errors.maxParticipants && (
                <div id="max-participants-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.maxParticipants}
                </div>
              )}
              <div id="max-participants-help" className="text-xs text-muted mt-1">
                <span className="font-medium text-accent">Min. {appConfig.minParticipants}</span> participants required
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => handleBack(1)}
                className="bg-muted hover:bg-muted-hover text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-card-bg"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleNext(1)}
                className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card-bg"
              >
                Next
              </button>
            </div>
          </fieldset>
        )}

        {/* Step 3: Review */}
        {formStep === 2 && (
          <fieldset className="space-y-6">
            <legend className="sr-only">Review and Submit</legend>

            <div className="bg-background/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-white mb-3">Review Your Lottery</h4>

              <div className="flex justify-between">
                <span className="text-sm text-muted">Lottery Name:</span>
                <span className="text-sm font-medium text-white" id="review-name">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Entry Fee:</span>
                <span className="text-sm font-medium text-white" id="review-fee">{entryFee} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Max Participants:</span>
                <span className="text-sm font-medium text-white" id="review-participants">{maxParticipants}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Potential Prize Pool:</span>
                <span className="text-sm font-medium text-accent" id="review-prize">
                  {(entryFee * maxParticipants).toFixed(2)} XLM
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => handleBack(2)}
                className="bg-muted hover:bg-muted-hover text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-muted focus:ring-offset-2 focus:ring-offset-card-bg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-accent hover:bg-accent-hover text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card-bg"
                aria-describedby="submit-help"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </div>
                ) : 'Create Lottery'}
              </button>
            </div>

            <div id="submit-help" className="text-xs text-muted">
              This will create your lottery on the Stellar blockchain. Transaction fees may apply.
            </div>
          </fieldset>
        )}
      </form>
    </div>
  );
} 