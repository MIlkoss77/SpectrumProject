import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const Web3Context = createContext()

export function useWeb3() {
    return useContext(Web3Context)
}

export function Web3Provider({ children }) {
    const [account, setAccount] = useState(null)
    const [provider, setProvider] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState(null)

    const connectWallet = async () => {
        if (!window.ethereum) {
            console.warn('MetaMask not detected. Web3 features will be disabled.')

            // Handle mobile Deep Linking for MetaMask
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                const dappUrl = window.location.href.split('//')[1]; // Remove http:// or https://
                window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
            } else {
                alert("Please install the MetaMask extension to connect.");
            }
            return
        }

        setIsConnecting(true)
        setError(null)

        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            const accounts = await browserProvider.send("eth_requestAccounts", [])
            const network = await browserProvider.getNetwork()

            setProvider(browserProvider)
            setAccount(accounts[0])
            setChainId(network.chainId)

        } catch (err) {
            console.error("Connection failed", err)
            setError(err.message)
        } finally {
            setIsConnecting(false)
        }
    }

    const disconnectWallet = () => {
        setAccount(null)
        setProvider(null)
        setChainId(null)
    }

    // Auto-connect if already authorized
    useEffect(() => {
        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            browserProvider.send("eth_accounts", []).then((accounts) => {
                if (accounts.length > 0) {
                    setProvider(browserProvider)
                    setAccount(accounts[0])
                    browserProvider.getNetwork().then(net => setChainId(net.chainId))
                }
            }).catch(console.error)

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                } else {
                    setAccount(null)
                }
            })

            // Listen for chain changes
            window.ethereum.on('chainChanged', () => {
                window.location.reload()
            })
        }
    }, [])

    const value = {
        account,
        provider,
        chainId,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet
    }

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    )
}
