declare interface Window {
  freighterApi: {
    isConnected: () => Promise<boolean>;
    getAddress: () => Promise<{ address: string }>;
    setAllowed: () => Promise<void>;
    signTransaction: (xdr: string, network?: string) => Promise<string>;
    signAuthEntry: (entryXdr: string, network?: string) => Promise<string>;
  };
} 