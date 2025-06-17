// import React, { useEffect, useState } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';

// import styles from '../styles';
// import { useGlobalContext } from '../context';
// import { CustomButton, CustomInput, PageHOC , GameLoad } from '../components';

// const CreateBattle = () => {
//   const { contract, battleName, setBattleName } = useGlobalContext();
//   const [waitBattle, setWaitBattle] = useState(false);
//   const navigate = useNavigate();

//   const handleClick = async () => {
//     if (battleName === '' || battleName.trim() === '') return null;

//     try {
//       await contract.createBattle(battleName);

//       setWaitBattle(true);
//     } catch (error) {
//       // setErrorMessage(error);
//     }
//   };
//   return (
//     <>
//       {waitBattle && <GameLoad />}

//       <div className="flex flex-col mb-5">
//         <CustomInput
//           label="Battle"
//           placeHolder="Enter battle name"
//           value={battleName}
//           handleValueChange={setBattleName}
//         />

//         <CustomButton
//           title="Create Battle"
//           handleClick={handleClick}
//           restStyles="mt-6"
//         />
//       </div>
//       <p className={styles.infoText} onClick={() => navigate('/join-battle')}>
//         Or join already existing battles
//       </p>
//     </>
//   )
// };

// export default PageHOC(
//   CreateBattle,
//   (<>Create <br /> a new Battle </>),
//   (<>Create your own Battle and wait for others to join you</>)
// );

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { useGlobalContext } from '../context';
import { CustomButton, CustomInput, PageHOC, GameLoad } from '../components';

const CreateBattle = () => {
  const { contract, battleName, setBattleName, setShowAlert, gameData } = useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // if (gameData?.activeBattle?.battleStatus === 1) {
    //   navigate(`/battle/${gameData.activeBattle.name}`);
    // } else 
    if (gameData?.activeBattle?.battleStatus === 0) {
      setWaitBattle(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    if (!battleName || battleName.trim() === '') return;

    if (!contract) {
      setShowAlert?.({
        status: true,
        type: 'failure',
        message: 'Smart contract not loaded',
      });
      return;
    }

    try {
      const tx = await contract.createBattle(battleName);
      await tx.wait(); // Wait for transaction to be mined

      setWaitBattle(true);
    } catch (error) {
      setShowAlert?.({
        status: true,
        type: 'failure',
        message: error?.reason || 'Create Battle Failed',
      });
    }
  };

  return (
    <>
      {waitBattle && <GameLoad />}

      <div className="flex flex-col mb-5">
        <CustomInput
          label="Battle"
          placeHolder="Enter battle name"
          value={battleName}
          handleValueChange={setBattleName}
        />

        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate('/join-battle')}>
        Or join already existing battles
      </p>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  (<>Create <br /> a new Battle </>),
  (<>Create your own Battle and wait for others to join you</>)
);
