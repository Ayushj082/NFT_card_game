import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { ADDRESS, ABI } from "../contract/index";
import { createEventListeners } from "./createEventListeners";
import { useNavigate } from "react-router-dom";
import { GetParams } from "../utils/onboard";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState('');
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState({status: false, type:'info', message: ''});
    const [battleName, setBattleName] = useState('');
    const [gameData, setGameData] = useState({ players: [], pendingBattles: [], activeBattle: null });
    const [updateGameData, setUpdateGameData] = useState(0);
    const [battleGround, setBattleGround] = useState('bg-astral');
    const [step, setStep]= useState(1);
    const [errorMessage, setErrorMessage]= useState('');

    const player1Ref = useRef();
    const player2Ref = useRef();

    const connectionRef = useRef(null);
    const isConnecting = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
      const battlegroundFromLocalStorage = localStorage.getItem('battleground');

      if(battlegroundFromLocalStorage) {
        setBattleGround(battlegroundFromLocalStorage);
      }else {
        localStorage.setItem('battleground', battleGround)
      }
    }, [])

    // Reset web3 onbording modal params
    useEffect(() => {
        const resetParams = async ()=>{
            const currentStep = await GetParams();

            setStep(currentStep.step)
        }
        resetParams();

        window?.ethereum?.on('chainChanged', ()=>resetParams());
        window?.ethereum?.on('accountsChanged', ()=>resetParams());
      }, [])

    //* Set the wallet address to the state
    const updateCurrentWalletAddress = async () => {
        if (isConnecting.current) return;
        isConnecting.current = true;
        
        try {
            const accounts = await window?.ethereum?.request({ method: 'eth_requestAccounts' });
            if (accounts) {
                setWalletAddress(accounts[0]);
                const connection = await web3ModalRef.current.connect();
                connectionRef.current = connection;
                
                const provider = new ethers.providers.Web3Provider(connection);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(ADDRESS, ABI, signer);
                setContract(contract);
                
                // Set up event listeners
                connection.on('accountsChanged', handleAccountsChanged);
                connection.on('chainChanged', handleChainChanged);
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError(err.message);
        } finally {
            isConnecting.current = false;
        }
    };

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
    // const connectWallet = async () => {
    //     console.log("Connecting wallet...");
    //     try {
    //         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    //         setWalletAddress(accounts[0]);
    //         setError('');
    //       } catch (err) {
    //         setError(err.message || 'Wallet connection failed');
    //         console.error("Wallet connection error:", err);
    //         return;
    //       }

    //     if (isConnecting.current) return;
    //     isConnecting.current = true;
    //     setError(null);
        
    //     try {
    //         const connection = await web3ModalRef.current.connect();
    //         console.log("Wallet connected");
    //         connectionRef.current = connection;
            
    //         const provider = new ethers.providers.Web3Provider(connection);
    //         const signer = provider.getSigner();
    //         const contract = new ethers.Contract(ADDRESS, ABI, signer);
    //         setContract(contract);
            
    //         // Get initial account
    //         const accounts = await provider.listAccounts();
    //         if (accounts.length > 0) {
    //             setWalletAddress(accounts[0]);
    //         }
            
    //         // Set up event listeners
    //         connection.on('accountsChanged', handleAccountsChanged);
    //         connection.on('chainChanged', handleChainChanged);
            
    //         // setContract(contract);
    //         return contract;
    //     } catch (err) {
    //         console.error("Connection error:", err);
    //         setError(err.message);
    //         // return null;
    //     } finally {
    //         isConnecting.current = false;
    //     }
    // };

    // Initialize connection on mount
    useEffect(() => {
        const init = async () => {
            // Check if already connected
            if (web3ModalRef.current.cachedProvider) {
                await updateCurrentWalletAddress();
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
        if (step !== -1 && contract){
            createEventListeners({
                navigate,contract, provider,walletAddress,setShowAlert,
                setUpdateGameData, player1Ref, player2Ref
            })
        }
    }, [contract, step]);

    useEffect(() => {
        if (showAlert?.status) {
            const timer = setTimeout(() => {
                setShowAlert({status: false, type: 'info', message: ''});
            }, [5000]);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: 'failure',
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

    //* Set the game data to the state
    useEffect(() => {
        const fetchGameData = async () => {
            if (contract) {
                const fetchedBattles = await contract.getAllBattles();
                const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
                let activeBattle = null;

                fetchedBattles.forEach((battle) => {
                if (battle.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())) {
                    if (battle.winner.startsWith('0x00')) {
                    activeBattle = battle;
                    }
                }
                });

                setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
            }
        };

        fetchGameData();
    }, [contract, updateGameData]);

    return (
        <GlobalContext.Provider value={{ 
            contract, 
            walletAddress,
            error,
            showAlert,
            setShowAlert,
            battleName, setBattleName,
            gameData,
            battleGround,
            setBattleGround,
            errorMessage, setErrorMessage,
            player1Ref, player2Ref,
            updateCurrentWalletAddress
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => useContext(GlobalContext);