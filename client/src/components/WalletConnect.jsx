import React from 'react';
import { useGlobalContext } from '../context';

const WalletConnect = () => {
  const { connectWallet, walletAddress, error } = useGlobalContext();

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {!walletAddress ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>Connected: {walletAddress}</div>
      )}
    </div>
  );
};

export default WalletConnect;