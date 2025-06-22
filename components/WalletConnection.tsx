"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import usePasskey from "../hooks/passkey.hook";
import useWallet from "../hooks/useWallet.hook";
import useKeyStore from "../store/key.store";

export default function WalletConnection({ onConnect, onStart, onError, useConnect = false }: { onConnect?: () => void, onStart?: () => void, onError?: () => void, useConnect?: boolean }) {
  // const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { publicKey, handleLogin, isWalletLoading, isWalletError } = useWallet()
  const { handleLogout, handleRegister, connect, contractId, isPassKeyLoading, isPassKeyError } = usePasskey()
const {userPublicKey, setUserPublicKey} = useKeyStore()

  useEffect(() => {
    if (!contractId) {
      return
    }
    handleLogin(contractId)
  }, [contractId])

  useEffect(() => {
    if (!publicKey) {
      return
    }
    onConnect?.()
    setUserPublicKey(publicKey)
  }, [publicKey])

  useEffect(() => {
    if(isPassKeyLoading || isWalletLoading){
      onStart?.()
    }
  }, [isPassKeyLoading, isWalletLoading])

  useEffect(() => {
    if(isWalletError || isPassKeyError){
      onError?.()
    }
  }, [isPassKeyError, isWalletError])

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMenuOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsMenuOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          // Allow natural tab navigation within menu
          break;
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);


  // Handle copy address
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(publicKey || '');
      toast.success('Address copied to clipboard!');
      setIsMenuOpen(false);
    } catch (error) {
      const errorMsg = `Failed to copy address: ${(error as ApiErrorProps).message || 'Unknown error'}`;
      toast.error(errorMsg);
      console.error("Error copying address:", error);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Handle menu toggle
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if(!useConnect){
      return
    }
    window.addEventListener('connect-wallet', () => {
      connect()
    })
  }, [])

  return <>
    {!userPublicKey ? <div className="flex flex-wrap gap-2 items-center">
      <button
        ref={buttonRef}
        onClick={() => connect()}
        // disabled={isLoading}
        className="bg-primary text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-background animate-bounce"
        data-wallet-connect
        // aria-label={isLoading ? "Connecting to wallet..." : "Connect your Stellar wallet"}
        aria-describedby="wallet-connect-description"
      >
        Sign in
        {/* {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              <span>Please wait...</span>
            </div>
          ) : "Sign in"} */}
      </button>
      <button
        ref={buttonRef}
        onClick={handleRegister}
        // disabled={isLoading}
        className="bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-background animate-bounce"
        data-wallet-connect
        // aria-label={isLoading ? "Connecting to wallet..." : "Connect your Stellar wallet"}
        aria-describedby="wallet-connect-description"
      >
        {"Sign Up"}
      </button>
    </div> : <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        className="bg-primary font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-background"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label={`Wallet menu. Connected address: ${formatAddress(publicKey)}`}
        aria-describedby="wallet-status"
      >
        <div className="flex items-center">
          <div
            className="h-2 w-2 rounded-full bg-green-400 mr-2"
            aria-hidden="true"
            title="Wallet connected"
          ></div>
          <span>{formatAddress(publicKey)}</span>
          <svg
            className={`ml-2 h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div
        id="wallet-status"
        className="sr-only"
        aria-live="polite"
      >
        {publicKey ? `Wallet connected: ${publicKey}` : 'No wallet connected'}
      </div>

      {isMenuOpen && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-lg bg-card-bg border border-border shadow-lg z-50"
          role="menu"
          aria-labelledby="wallet-menu-button"
          aria-orientation="vertical"
        >
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-muted mb-1" id="wallet-address-label">Connected Wallet</p>
              <div
                className="font-mono text-xs bg-background p-2 rounded overflow-hidden break-all"
                role="text"
                aria-labelledby="wallet-address-label"
                aria-describedby="wallet-address-description"
              >
                {publicKey}
              </div>
              <div id="wallet-address-description" className="sr-only">
                Your full Stellar wallet address
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <button
                onClick={handleCopyAddress}
                className="btn btn-sm btn-ghost text-xs focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card-bg"
                role="menuitem"
                aria-label="Copy wallet address to clipboard"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline text-red-500 border-red-500 hover:bg-red-500/10 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-card-bg"
                role="menuitem"
                aria-label="Disconnect wallet"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden description for connect button */}
      <div id="wallet-connect-description" className="sr-only">
        Connect your Freighter wallet to interact with Stellar blockchain lotteries
      </div>
    </div>}
  </>




} 