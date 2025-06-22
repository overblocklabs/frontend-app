// Environment Configuration Management
// Centralized configuration with validation and type safety

interface EnvironmentConfig {
  // Network Configuration
  stellar: {
    network: 'testnet' | 'mainnet' | 'futurenet';
    networkPassphrase: string;
    sorobanRpcUrl: string;
    horizonUrl: string;
  };
  
  // Contract Addresses
  contracts: {
    lotteryContractId: string;
    nativeTokenAddress: string;
  };
  
  // Platform Configuration
  platform: {
    address: string;
    feePercentage: number;
  };
  
  // Application Settings
  app: {
    name: string;
    version: string;
    defaultLotteryDuration: number;
    minParticipants: number;
    maxParticipants: number;
  };
  
  // Development Settings
  development: {
    debugMode: boolean;
    enableConsoleLogs: boolean;
    aliceAddress?: string;
  };
}

class ConfigurationManager {
  private config: EnvironmentConfig;
  
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }
  
  private loadConfiguration(): EnvironmentConfig {
    // Statically reference all env vars so Next.js includes them in bundle
    const envVars = {
      NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
      NEXT_PUBLIC_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
      NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
      NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL,
      NEXT_PUBLIC_LOTTERY_CONTRACT_ID: process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ID,
      NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS,
      NEXT_PUBLIC_PLATFORM_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_ADDRESS,
      NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE: process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_DEFAULT_LOTTERY_DURATION: process.env.NEXT_PUBLIC_DEFAULT_LOTTERY_DURATION,
      NEXT_PUBLIC_MIN_PARTICIPANTS: process.env.NEXT_PUBLIC_MIN_PARTICIPANTS,
      NEXT_PUBLIC_MAX_PARTICIPANTS: process.env.NEXT_PUBLIC_MAX_PARTICIPANTS,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
      NEXT_PUBLIC_ENABLE_CONSOLE_LOGS: process.env.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS,
      NEXT_PUBLIC_ALICE_ADDRESS: process.env.NEXT_PUBLIC_ALICE_ADDRESS,
    };

    return {
      stellar: {
        network: this.getEnvVarStatic(envVars.NEXT_PUBLIC_STELLAR_NETWORK, 'testnet') as 'testnet' | 'mainnet' | 'futurenet',
        networkPassphrase: this.getEnvVarStatic(envVars.NEXT_PUBLIC_NETWORK_PASSPHRASE, 'Test SDF Network ; September 2015'),
        sorobanRpcUrl: this.getEnvVarStatic(envVars.NEXT_PUBLIC_SOROBAN_RPC_URL, 'https://soroban-testnet.stellar.org:443'),
        horizonUrl: this.getEnvVarStatic(envVars.NEXT_PUBLIC_HORIZON_URL, 'https://horizon-testnet.stellar.org'),
      },
      
      contracts: {
        lotteryContractId: this.getRequiredEnvVarStatic(envVars.NEXT_PUBLIC_LOTTERY_CONTRACT_ID, 'NEXT_PUBLIC_LOTTERY_CONTRACT_ID'),
        nativeTokenAddress: this.getEnvVarStatic(envVars.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS, 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'),
      },
      
      platform: {
        address: this.getRequiredEnvVarStatic(envVars.NEXT_PUBLIC_PLATFORM_ADDRESS, 'NEXT_PUBLIC_PLATFORM_ADDRESS'),
        feePercentage: this.getEnvVarAsNumberStatic(envVars.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE, 10),
      },
      
      app: {
        name: this.getEnvVarStatic(envVars.NEXT_PUBLIC_APP_NAME, 'Lotellar DApp'),
        version: this.getEnvVarStatic(envVars.NEXT_PUBLIC_APP_VERSION, '1.0.0'),
        defaultLotteryDuration: this.getEnvVarAsNumberStatic(envVars.NEXT_PUBLIC_DEFAULT_LOTTERY_DURATION, 3600),
        minParticipants: this.getEnvVarAsNumberStatic(envVars.NEXT_PUBLIC_MIN_PARTICIPANTS, 2),
        maxParticipants: this.getEnvVarAsNumberStatic(envVars.NEXT_PUBLIC_MAX_PARTICIPANTS, 100),
      },
      
      development: {
        debugMode: this.getEnvVarAsBooleanStatic(envVars.NEXT_PUBLIC_DEBUG_MODE, false),
        enableConsoleLogs: this.getEnvVarAsBooleanStatic(envVars.NEXT_PUBLIC_ENABLE_CONSOLE_LOGS, false),
        aliceAddress: this.getEnvVarStatic(envVars.NEXT_PUBLIC_ALICE_ADDRESS),
      },
    };
  }
  
  private getEnvVar(key: string, defaultValue?: string): string {
   
    const value = process.env[key];
    console.log(value, key)
    console.log(process.env.NEXT_PUBLIC_ALICE_ADDRESS)
    if (value === undefined || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable ${key} is not set and no default value provided`);
    }
    return value;
  }
  
  private getRequiredEnvVarStatic(value: string | undefined, keyName: string): string {
    if (value === undefined || value === '') {
      // Fallback values for development
      const fallbacks: Record<string, string> = {
        'NEXT_PUBLIC_LOTTERY_CONTRACT_ID': 'CB6TJS7GMEDUHTGYUZUR2QS2W23DTLPMVQ27Y3KHQOZ4RHSV6WKQZNW2',
        'NEXT_PUBLIC_PLATFORM_ADDRESS': 'GB5626HXJS47GALUIJB65PAR2GDF3WRMZ3UCDLVRX4VWNL6FR4A6YP6D'
      };
      
      if (fallbacks[keyName]) {
        console.warn(`⚠️ Using fallback value for ${keyName}`);
        return fallbacks[keyName];
      }
      
      throw new Error(`Required environment variable ${keyName} is not set`);
    }
    return value;
  }
  
  private getEnvVarStatic(value: string | undefined, defaultValue?: string): string {
    if (value === undefined || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable is not set and no default value provided`);
    }
    return value;
  }

  private getEnvVarAsNumberStatic(value: string | undefined, defaultValue?: number): number {
    if (value === undefined || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable is not set and no default value provided`);
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      throw new Error(`Environment variable is not a valid number: ${value}`);
    }
    
    return numValue;
  }
  
  private getEnvVarAsBooleanStatic(value: string | undefined, defaultValue?: boolean): boolean {
    if (value === undefined || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`Environment variable is not set and no default value provided`);
    }
    
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return true;
    } else if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return false;
    } else {
      throw new Error(`Environment variable is not a valid boolean: ${value}`);
    }
  }
  
  private validateConfiguration(): void {
    const errors: string[] = [];
    
    // Validate network
    const validNetworks = ['testnet', 'mainnet', 'futurenet'];
    if (!validNetworks.includes(this.config.stellar.network)) {
      errors.push(`Invalid network: ${this.config.stellar.network}. Must be one of: ${validNetworks.join(', ')}`);
    }
    
    // Validate URLs
    try {
      new URL(this.config.stellar.sorobanRpcUrl);
    } catch (e) {
      errors.push(`Invalid Soroban RPC URL: ${this.config.stellar.sorobanRpcUrl}`);
    }
    
    try {
      new URL(this.config.stellar.horizonUrl);
    } catch (e) {
      errors.push(`Invalid Horizon URL: ${this.config.stellar.horizonUrl}`);
    }
    
    // Validate contract IDs (basic Stellar address format)
    if (!this.isValidStellarAddress(this.config.contracts.lotteryContractId)) {
      errors.push(`Invalid lottery contract ID: ${this.config.contracts.lotteryContractId}`);
    }
    
    if (!this.isValidStellarAddress(this.config.contracts.nativeTokenAddress)) {
      errors.push(`Invalid native token address: ${this.config.contracts.nativeTokenAddress}`);
    }
    
    if (!this.isValidStellarAddress(this.config.platform.address)) {
      errors.push(`Invalid platform address: ${this.config.platform.address}`);
    }
    
    // Validate ranges
    if (this.config.platform.feePercentage < 0 || this.config.platform.feePercentage > 100) {
      errors.push(`Platform fee percentage must be between 0 and 100, got: ${this.config.platform.feePercentage}`);
    }
    
    if (this.config.app.minParticipants < 2) {
      errors.push(`Minimum participants must be at least 2, got: ${this.config.app.minParticipants}`);
    }
    
    if (this.config.app.maxParticipants < this.config.app.minParticipants) {
      errors.push(`Maximum participants (${this.config.app.maxParticipants}) must be greater than minimum participants (${this.config.app.minParticipants})`);
    }
    
    if (this.config.app.defaultLotteryDuration <= 0) {
      errors.push(`Default lottery duration must be positive, got: ${this.config.app.defaultLotteryDuration}`);
    }
    
    // Validate development settings
    if (this.config.development.aliceAddress && !this.isValidStellarAddress(this.config.development.aliceAddress)) {
      errors.push(`Invalid Alice address: ${this.config.development.aliceAddress}`);
    }
    
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }
  
  private isValidStellarAddress(address: string): boolean {
    // Basic Stellar address validation (starts with G or C, 56 characters)
    const stellarAddressRegex = /^[GC][A-Z2-7]{55}$/;
    return stellarAddressRegex.test(address);
  }
  
  // Getter methods for easy access
  get stellar() {
    return this.config.stellar;
  }
  
  get contracts() {
    return this.config.contracts;
  }
  
  get platform() {
    return this.config.platform;
  }
  
  get app() {
    return this.config.app;
  }
  
  get development() {
    return this.config.development;
  }
  
  // Utility methods
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  get isMainnet(): boolean {
    return this.config.stellar.network === 'mainnet';
  }
  
  get isTestnet(): boolean {
    return this.config.stellar.network === 'testnet';
  }
  
  // Debug logging
  logConfiguration(): void {
    if (this.config.development.enableConsoleLogs) {
      console.log('📋 Application Configuration:', {
        network: this.config.stellar.network,
        contractId: this.config.contracts.lotteryContractId,
        platformAddress: this.config.platform.address,
        debugMode: this.config.development.debugMode,
        version: this.config.app.version,
      });
    }
  }
  
  // Get configuration for external services
  getStellarSDKConfig() {
    return {
      networkPassphrase: this.config.stellar.networkPassphrase,
      sorobanRpcUrl: this.config.stellar.sorobanRpcUrl,
      horizonUrl: this.config.stellar.horizonUrl,
    };
  }
}

// Create and export singleton instance
let configInstance: ConfigurationManager;

try {
  configInstance = new ConfigurationManager();
  configInstance.logConfiguration();
} catch (error) {
  console.error('❌ Configuration Error:', error);
  throw error;
}

export const config = configInstance;

// Export individual configurations for convenience
export const {
  stellar: stellarConfig,
  contracts: contractsConfig,
  platform: platformConfig,
  app: appConfig,
  development: developmentConfig
} = config; 