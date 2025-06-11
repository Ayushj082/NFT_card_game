import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { ADDRESS, ABI } from "../contract/index";
import { createEventListeners } from "./createEventListeners";
import { useNavigate } from "react-router-dom";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState({status: false, type:'info', message: ''});
    const connectionRef = useRef(null);
    const isConnecting = useRef(false);
    const navigate = useNavigate();

    // Initialize Web3Modal only once
    const web3ModalRef = useRef(
        new Web3Modal({
            cacheProvider: true,
            providerOptions: {},
            theme: 'dark'
        })
    );

    // Handle account changes
    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
        } else {
            setWalletAddress('');
            setContract(null);
        }
    };

    // Handle chain changes
    const handleChainChanged = () => {
        window.location.reload();
    };

    // Set up contract and connection
    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(accounts[0]);
            setError('');
          } catch (err) {
            setError(err.message || 'Wallet connection failed');
          }

        if (isConnecting.current) return;
        isConnecting.current = true;
        setError(null);
        
        try {
            const connection = await web3ModalRef.current.connect();
            connectionRef.current = connection;
            
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(ADDRESS, ABI, signer);
            
            // Get initial account
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
            }
            
            // Set up event listeners
            connection.on('accountsChanged', handleAccountsChanged);
            connection.on('chainChanged', handleChainChanged);
            
            setContract(contract);
            return contract;
        } catch (err) {
            console.error("Connection error:", err);
            setError(err.message);
            return null;
        } finally {
            isConnecting.current = false;
        }
    };

    // Initialize connection on mount
    useEffect(() => {
        const init = async () => {
            // Check if already connected
            if (web3ModalRef.current.cachedProvider) {
                await connectWallet();
            }
        };
        
        init();

        // Cleanup event listeners
        return () => {
            if (connectionRef.current) {
                connectionRef.current.removeListener('accountsChanged', handleAccountsChanged);
                connectionRef.current.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, []);

    useEffect(() => {
        if (contract){
            createEventListeners({
                navigate,contract, provider,walletAddress,setShowAlert,
            })
        }
    }, [contract]);

    useEffect(() => {
        if (showAlert?.status) {
            const timer = setTimeout(() => {
                setShowAlert({status: false, type: 'info', message: ''});
            }, [5000]);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    return (
        <GlobalContext.Provider value={{ 
            contract, 
            walletAddress, 
            connectWallet,
            error,
            showAlert,
            setShowAlert
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);