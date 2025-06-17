import { ethers } from "ethers";
import { ABI } from "../contract/index";

const AddNewEvent= (eventfilter,provider,cb)=>{
    provider?.removeListener?.(eventfilter);

    provider?.on?.(eventfilter, (logs) => {
        const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);
        cb(parsedLog);
    })
}

export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert})=>{
    const NewPlayerEventFilter = contract.filters.NewPlayer();
    AddNewEvent(NewPlayerEventFilter,provider,({args})=>{
        console.log('New Player Created', args);
        if (walletAddress === args.owner){
            setShowAlert({
                status: true,
                type: 'success',
                message: "Player has been successfully registered"
              });
        }
    })


    const NewBattleEventFilter = contract.filters.NewBattle();
    AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
        console.log('New battle started!', args, walletAddress);

        if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
        navigate(`/battle/${args.battleName}`);
        }

        setUpdateGameData((prevUpdateGameData) => prevUpdateGameData + 1);
    });
}

// import { ethers } from "ethers";
// import { ABI } from "../contract/index";

// const AddNewEvent = (eventfilter, provider, cb) => {
//   provider?.removeListener?.(eventfilter);
//   provider?.on?.(eventfilter, (logs) => {
//     const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);
//     cb(parsedLog);
//   });
// };

// export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert }) => {
//   // When a new player is created
//   const NewPlayerEventFilter = contract.filters.NewPlayer();
//   AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
//     console.log('New Player Created', args);
//     if (walletAddress === args.owner) {
//       setShowAlert({
//         status: true,
//         type: 'success',
//         message: "Player has been successfully registered"
//       });
//     }
//   });

//   // When a battle is created
//   const battleCreatedFilter = contract.filters.BattleCreated();
//   AddNewEvent(battleCreatedFilter, provider, ({ args }) => {
//     const [creator, battleName] = args;
//     if (creator.toLowerCase() === walletAddress.toLowerCase()) {
//       setShowAlert({
//         status: true,
//         type: 'success',
//         message: `Battle "${battleName}" created! Waiting for opponent...`,
//       });

//       navigate(`/battle/${battleName}`);
//     }
//   });

//   // When the battle is ready to start
//   const battleStartedFilter = contract.filters.BattleInitiated();
//   AddNewEvent(battleStartedFilter, provider, ({ args }) => {
//     const [player1, player2, battleName] = args;
//     if (
//       player1.toLowerCase() === walletAddress.toLowerCase() ||
//       player2.toLowerCase() === walletAddress.toLowerCase()
//     ) {
//       setShowAlert({
//         status: true,
//         type: 'success',
//         message: `Battle "${battleName}" is starting!`,
//       });

//       navigate(`/battle/${battleName}`);
//     }
//   });
// };
