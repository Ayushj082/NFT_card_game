import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomButton, PageHOC } from '../components';
import styles from '../styles';

const JoinBattle = () => {
  const { contract, gameData, setShowAlert, setBattleName, walletAddress, setErrorMessage} = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 1) navigate(`/battle/${gameData.activeBattle.name}`);
  }, [gameData]);

  const handleClick = async (battleName) => {
    setBattleName(battleName);

    try {
      const tx = await contract.joinBattle(battleName, {
        gasLimit: 200000
      });
      setShowAlert({ status: true, type: 'info',  message: `Joining ${battleName}…` });

      await tx.wait();

      setShowAlert({ status: true, type: 'success', message: `Joined ${battleName}!` });
      navigate(`/battle/${battleName}`);
    } catch (error) {
      setErrorMessage(error);
    }
  };

  const handleDeleteBattle = async (battleName) => {
    try {
      const tx = await contract.deletePendingBattle(battleName, {
        gasLimit: 200000
      });
      setShowAlert({ status: true, type: 'info', message: `Deleting battle ${battleName}…` });

      await tx.wait();

      setShowAlert({ status: true, type: 'success', message: `Battle ${battleName} deleted!` });
    } catch (error) {
      setErrorMessage(error);
    }
  };

  useEffect(() => {
    const active = gameData.activeBattle;
    if (active?.players.includes(walletAddress)) {
      navigate(`/battle/${active.name}`);
    }
  }, [gameData.activeBattle, walletAddress]);

  return (
    <>
        <h2 className={styles.joinHeadText}>Available Battles:</h2>
        <div className={styles.joinContainer}>
          {gameData.pendingBattles.length
            ? gameData.pendingBattles
              .filter((battle) => !battle.players.includes(walletAddress) && battle.battleStatus !== 1)
              .map((battle, index) => (
                <div key={battle.name + index} className={styles.flexBetween}>
                  <p className={styles.joinBattleTitle}>{index + 1}. {battle.name}</p>
                  <div className="flex gap-2">
                    {battle.players[0].toLowerCase() === walletAddress.toLowerCase() ? (
                      <CustomButton
                        title="Delete"
                        handleClick={() => handleDeleteBattle(battle.name)}
                        restStyles="bg-red-500 hover:bg-red-600"
                      />
                    ) : (
                      <CustomButton
                        title="Join"
                        handleClick={() => handleClick(battle.name)}
                      />
                    )}
                  </div>
                </div>
              )) : (
                <p className={styles.joinLoading}>Reload the page to see new battles</p>
            )}
        </div>
        <p className={styles.infoText} onClick={() => navigate('/create-battle')}>
        Or create a new battle
        </p>
    </>
  )
}

export default PageHOC(
  JoinBattle,
  <>Join <br /> a Battle</>,
  <>Join already existing battles</>,
);
