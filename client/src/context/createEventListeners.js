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
}