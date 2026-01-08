import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../lib/supabaseClient';

const CTGOLD_MINT_ADDRESS = '3HDPgNPPZRZqvdyuiCNVPUSwCAFeJ6xPJH2VaLXEpump';
const MIN_CTGOLD_BALANCE = 1000000;

interface WalletContextType {
  connected: boolean;
  walletAddress: string | null;
  walletBalance: number;
  internalBalance: number;
  isActive: boolean;
  isVIP: boolean;
  mockMode: boolean;
  userData: any;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  toggleMockMode: () => void;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [internalBalance, setInternalBalance] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);

  const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=72f05c39-7249-45a5-9118-d0fcce17c267', 'confirmed');

  const checkCTGOLDBalance = async (publicKey: PublicKey): Promise<number> => {
    if (mockMode) {
      console.log('[MOCK MODE] Returning mock balance: 5,000,000 CTGOLD');
      return 5000000;
    }

    const walletAddress = publicKey.toString();
    console.log('=== CTGOLD Balance Check Started ===');
    console.log('Wallet Address:', walletAddress);

    const MINT_ADDRESS_STRING = '3HDPgNPPZRZqvdyuiCNVPUSwCAFeJ6xPJH2VaLXEpump';
    console.log('Mint Address String:', MINT_ADDRESS_STRING);

    let ctgoldMintPublicKey: PublicKey;
    try {
      ctgoldMintPublicKey = new PublicKey(MINT_ADDRESS_STRING);
      console.log('✓ Successfully created PublicKey for mint:', ctgoldMintPublicKey.toString());
    } catch (error) {
      console.error('✗ Failed to create PublicKey from mint address:', error);
      return 0;
    }

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}/${maxRetries}: Fetching token accounts...`);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          mint: ctgoldMintPublicKey,
        });

        console.log('✓ RPC Response received');
        console.log('Token Accounts Found:', tokenAccounts.value.length);

        if (tokenAccounts.value.length === 0) {
          console.warn('⚠ No token accounts found for CTGOLD mint');
          console.log('This means the wallet has no CTGOLD tokens or the token account doesn\'t exist yet');
          return 0;
        }

        let totalBalance = 0;
        tokenAccounts.value.forEach((account, index) => {
          const accountInfo = account.account.data.parsed.info;
          const amount = accountInfo.tokenAmount.uiAmount;
          const decimals = accountInfo.tokenAmount.decimals;
          const rawAmount = accountInfo.tokenAmount.amount;

          console.log(`Account ${index + 1}:`, {
            address: account.pubkey.toString(),
            balance: amount,
            decimals: decimals,
            rawAmount: rawAmount
          });

          if (amount) {
            totalBalance += amount;
          }
        });

        console.log('=== Balance Check Complete ===');
        console.log('Total CTGOLD Balance:', totalBalance.toLocaleString());
        console.log('Minimum Required:', MIN_CTGOLD_BALANCE.toLocaleString());
        console.log('Has Sufficient Balance:', totalBalance >= MIN_CTGOLD_BALANCE);
        console.log('==============================');

        return totalBalance;
      } catch (error: any) {
        retryCount++;
        console.error(`✗ Error on attempt ${retryCount}/${maxRetries}:`, {
          message: error?.message || 'Unknown error',
          code: error?.code,
          error: error
        });

        if (retryCount >= maxRetries) {
          console.error('❌ Max retries reached, balance check failed');
          console.error('Returning balance: 0');
          return 0;
        }

        const delayMs = 2000 * retryCount;
        console.log(`Waiting ${delayMs}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return 0;
  };

  const loadUserData = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from('web3_users')
        .select('*')
        .eq('wallet_address', address)
        .maybeSingle();

      if (data) {
        setUserData(data);
        setInternalBalance(data.internal_balance);
        setIsActive(data.is_active);
        setIsVIP(data.is_vip);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshBalances = async () => {
    if (!walletAddress) return;

    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await checkCTGOLDBalance(publicKey);
      setWalletBalance(balance);
      await loadUserData(walletAddress);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const connectWallet = async () => {
    setConnecting(true);

    try {
      if (mockMode) {
        const mockAddress = 'MockWalletAddress123456789';
        setWalletAddress(mockAddress);
        setWalletBalance(5000000);
        setConnected(true);
        await loadUserData(mockAddress);
        setConnecting(false);
        return;
      }

      if (!window.solana || !window.solana.isPhantom) {
        alert('Please install Phantom wallet!');
        setConnecting(false);
        return;
      }

      console.log('=== Wallet Connection Started ===');
      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      console.log('✓ Phantom wallet connected');
      console.log('Wallet Address:', address);

      setWalletAddress(address);

      console.log('Starting CTGOLD balance check...');
      const balance = await checkCTGOLDBalance(response.publicKey);
      console.log('Balance check returned:', balance);

      setWalletBalance(balance);

      if (balance < MIN_CTGOLD_BALANCE) {
        console.warn(`⚠ Insufficient balance: ${balance} < ${MIN_CTGOLD_BALANCE}`);
        alert(
          `Insufficient CTGOLD holdings. You need at least ${MIN_CTGOLD_BALANCE.toLocaleString()} CTGOLD tokens to access the member area.`
        );
      } else {
        console.log('✓ Sufficient CTGOLD balance confirmed');
      }

      setConnected(true);
      console.log('✓ Wallet connection complete');

      console.log('Loading user data from database...');
      await loadUserData(address);
      console.log('=== Wallet Connection Process Complete ===');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (window.solana && !mockMode) {
      window.solana.disconnect();
    }

    setConnected(false);
    setWalletAddress(null);
    setWalletBalance(0);
    setInternalBalance(0);
    setIsActive(false);
    setIsVIP(false);
    setUserData(null);
  };

  const toggleMockMode = () => {
    if (connected) {
      disconnectWallet();
    }
    setMockMode(!mockMode);
  };

  useEffect(() => {
    if (!mockMode && window.solana) {
      window.solana.on('connect', () => {
        console.log('Wallet connected');
      });

      window.solana.on('disconnect', () => {
        disconnectWallet();
      });

      window.solana.on('accountChanged', (publicKey: PublicKey | null) => {
        if (publicKey) {
          const address = publicKey.toString();
          setWalletAddress(address);
          refreshBalances();
        } else {
          disconnectWallet();
        }
      });
    }
  }, [mockMode]);

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        walletBalance,
        internalBalance,
        isActive,
        isVIP,
        mockMode,
        userData,
        connecting,
        connectWallet,
        disconnectWallet,
        toggleMockMode,
        refreshBalances,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
  }
}
