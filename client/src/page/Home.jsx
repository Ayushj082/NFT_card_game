<<<<<<< HEAD
import React from 'react';

const Home = () => {
  return (
    <div>
      <h1 className="text-5xl p-3">Avax Gods</h1>
      <h2 className="text-3xl p-3">Web3 NFT Battle-style Card Game</h2>
      <p className="text-xl p-3">Made with 💜 by JavaScript Mastery</p>
=======
import React, {useState} from 'react';
import {PageHOC, CustomInput, CustomButton} from '../components';
import { useGlobalContext } from '../context';

const Home = () => {
  const { contract, walletAddress} = useGlobalContext();
  const [playerName, setPlayerName] = useState('');

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
        handleClick={() => {}}
        restStyles="mt-6"
      />
>>>>>>> origin/master
    </div>
  )
};

<<<<<<< HEAD
export default Home;
=======
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
>>>>>>> origin/master
