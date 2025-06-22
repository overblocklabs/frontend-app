"use client";

import React from 'react';
import { Tilt } from 'react-tilt'
import Image from 'next/image'


export default function Hero() {

  const scrollToActiveLotteries = () => {
    const activeLotteriesSection = document.getElementById('active-lotteries');
    if (activeLotteriesSection) {
      activeLotteriesSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToCreateLottery = () => {
    const createLotterySection = document.getElementById('create-lottery');
    if (createLotterySection) {
      createLotterySection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden hero-bg" id='home'>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="container relative z-10 mt-[150px]">
        <div className="text-center max-w-4xl mx-auto">


        <div className='flex flex-wrap gap-5 items-center justify-evenly w-full gap-5 mb-[50px]'>
            <Image src={'/images/stellar-logo.svg'} width={150} height={150} alt='stellar logo' />
            <Image src={'/images/soroban.svg'} width={150} height={150} alt='stellar logo' />
          </div>

          {/* Logo */}
          <div className="mb-8  flex justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 animate-float">
              <img
                src="/images/lotellar-logo.png"
                alt="Lotellar - Decentralized Lottery Platform"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary">
            <span>Decentralized</span>{' '}
            <span>Lottery Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Join ongoing lotteries and compete for amazing prizes. All results are transparent and verifiable on the blockchain.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Tilt>
              <button
                onClick={scrollToActiveLotteries}
                className="bg-primary text-white font-semibold px-8 py-4 text-lg rounded-sm hover:scale-105 transition-transform duration-300 hover:shadow-lg"
              >
                Explore Lotteries
              </button>
            </Tilt>
            <Tilt>
            <button
              onClick={scrollToCreateLottery}
              className="btn btn-outline px-8 py-4 text-lg hover:scale-105  rounded-sm transition-transform duration-300 border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
            >
              Create Lottery
            </button>
            </Tilt>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100+</div>
              <div className="text-sm text-muted">Active Lotteries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">50K+</div>
              <div className="text-sm text-muted">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">1M+</div>
              <div className="text-sm text-muted">XLM Distributed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-sm text-muted">Transparent</div>
            </div>
          </div>

        </div>
      </div>


    </section>
  );
} 