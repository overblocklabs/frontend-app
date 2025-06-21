"use client";

import { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';
import Link from 'next/link';

interface HeaderProps {
  onConnect: (publicKey: string) => void;
  publicKey: string | null;
}

export default function Header({ onConnect, publicKey }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled ? 'glass shadow-lg py-3 animate-slideInDown' : 'bg-background/80 backdrop-blur-md py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo - Skip to content link */}
        <a 
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-accent text-white px-4 py-2 rounded-md font-medium z-50"
          tabIndex={0}
        >
          Skip to main content
        </a>

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link 
            href="/" 
            className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded-md p-1"
            aria-label="Lotellar - Decentralized Lottery Platform Home"
          >
            <div className="h-12 w-12 animate-float">
              <img 
                src="/images/lotellar-logo.png" 
                alt="Lotellar Logo"
                className="w-full h-full object-contain"
                aria-hidden="true"
              />
            </div>
            <span className="text-xl font-light tracking-tight text-accent font-heading">Lotellar</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav 
          className="hidden md:flex items-center space-x-8"
          role="navigation"
          aria-label="Main navigation"
        >
          <Link 
            href="/" 
            className="text-base font-medium text-accent hover:text-accent transition-colors relative group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
            aria-current="page"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" aria-hidden="true"></span>
          </Link>
          <Link 
            href="#my-tickets" 
            className="text-base font-medium text-accent hover:text-accent transition-colors relative group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
          >
            My Tickets
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" aria-hidden="true"></span>
          </Link>
          <Link 
            href="#create-lottery" 
            className="text-base font-medium text-accent hover:text-accent transition-colors relative group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
          >
            Create Lottery
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" aria-hidden="true"></span>
          </Link>
          <Link 
            href="#contract-manager" 
            className="text-base font-medium text-accent hover:text-accent transition-colors relative group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
          >
            Community Lotteries
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" aria-hidden="true"></span>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={handleMobileMenuToggle}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Wallet Connection */}
        <div className="hidden md:flex items-center space-x-4">
          {publicKey && (
            <div 
              className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-card-bg/60 border border-border/50"
              role="status"
              aria-label="Wallet connection status"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
              <span className="text-xs text-muted font-medium">Connected</span>
            </div>
          )}
          <div className="scale-110">
            <WalletConnection onConnect={onConnect} />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-border/50"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-base font-medium text-white hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-current="page"
            >
              Home
            </Link>
            <Link 
              href="#my-tickets" 
              className="block text-base font-medium text-white hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Tickets
            </Link>
            <Link 
              href="#create-lottery" 
              className="block text-base font-medium text-white hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Lottery
            </Link>
            <Link 
              href="#contract-manager" 
              className="block text-base font-medium text-white hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community Lotteries
            </Link>
            
            <div className="pt-4 border-t border-border/50">
              {publicKey && (
                <div 
                  className="flex items-center space-x-2 px-2 py-2 mb-4"
                  role="status"
                  aria-label="Wallet connection status"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-xs text-muted font-medium">Wallet Connected</span>
                </div>
              )}
              <WalletConnection onConnect={onConnect} />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
} 