interface LotteryType {
    id: string;
    name: string;
    entryFee: number;
    prizePool: number;
    maxParticipants: number;
    participants: string[];
    winner: string | null;
    winnerTxHash: string | null;
    isCompleted: boolean;
    createdAt: string;
    creator: string;
    isCommunityLottery?: boolean;
    description?: string;
    winnerCount?: number;
    requirements?: {
      twitterFollow: boolean;
      twitterHandle: string;
      minimumTokenBalance: boolean;
      tokenAmount: number;
      tokenSymbol: string;
      nftCheck: boolean;
      nftCollection: string;
    };
  } 