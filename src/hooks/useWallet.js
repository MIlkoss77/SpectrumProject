import { useState, useEffect } from 'react';

export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setAccount(accounts[0]);
        setChainId(chain);
        setIsConnected(true);
      } catch (err) {
        console.error("MetaMask connection rejected", err);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => setAccount(accounts[0]));
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return { account, chainId, isConnected, connect };
};