import React, {useEffect, useState} from 'react';
import {PageHOC, CustomInput, CustomButton} from '../components';
import { useGlobalContext } from '../context';
import WalletConnect from '../components/WalletConnect';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { contract, walletAddress, setShowAlert} = useGlobalContext();
  const [playerName, setPlayerName] = useState('');
  const navigate= useNavigate();

  const handleClick = async () => {
    try {
      const playerExists = await contract.isPlayer(walletAddress);
      if (!playerExists) {
        await contract.registerPlayer(playerName,playerName);

        setShowAlert({
          status: true,
          type: 'success',
          message: `${playerName} is being summoned`
        });
      }
    } catch (error) {
      setShowAlert({
        status: true,
        type: "failure",
        message: error.message
      });
    }
  }

  useEffect(() => {
    const checkForPlayerToken=async()=>{
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);

      if (playerExists && playerTokenExists) navigate('/create-battle')
    }

    if (contract) checkForPlayerToken();
}, [contract]);

  return (
    <div className='flex flex-col'>
      <CustomInput
        label="Name"
        placeHolder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />

      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />
    </div>
  )
};

export default PageHOC(
  Home,
  (
    <>
      Welcome to AVAX GODS <br /> a WEB3 NFT Card Game
    </>
  ),
  (
    <>
      Connect your wallet to start playing <br /> the ultimate WEB3 experience
    </>
  )
);
