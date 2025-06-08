import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ethers } from 'ethers';
import { useNavigate } from "react-router-dom";
import { Web3Modal } from '@web3modal/react'; // Uncomment this when you integrate it

import { ABI, ADDRESS } from "../contract";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState('');
    const [contract, setContract] = useState('');

    //* set the wallet address to the state
    const updateCurrentWalletAddress = async () => {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        if(accounts) setWalletAddress(accounts[0]);
    }

    useEffect( () => {
        updateCurrentWalletAddress();

        window.ethereum.on('accountsChanged', updateCurrentWalletAddress)
    }, []);

    //* set the smart contract and provider to the state
    useEffect( () => {
        const setSmartContractAndProvider = async () => {
            const Web3Modal = new Web3Modal();
            const connection = await Web3Modal.connect();
            const newProvider = new ethers.providers.Web3Provider(connection);
            const signer = newProvider.signer();
            const newContract = new ethers.Contract(ADDRESS, ABI, signer);

            setProvider(newProvir);
            setContract(newContracdet);
        }
        setSmartContractAndProvider();
    }, []);

    return (
        <GlobalContext.Provider value={{
            contract, walletAddress
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);
