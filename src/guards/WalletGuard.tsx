import { Navigate, Outlet } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const MIN_CTGOLD_REQUIREMENT = 1000000;

export function RequireWalletConnection() {
  const { connected } = useWallet();

  if (!connected) {
    return <Navigate to="/web3/landing" replace />;
  }

  return <Outlet />;
}

export function RequireCTGOLDBalance() {
  const { connected, walletBalance } = useWallet();

  if (!connected) {
    return <Navigate to="/web3/landing" replace />;
  }

  if (walletBalance < MIN_CTGOLD_REQUIREMENT) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Insufficient CTGOLD Holdings</h2>
          <p className="text-gray-400 mb-2">
            You need at least {MIN_CTGOLD_REQUIREMENT.toLocaleString()} CTGOLD tokens to access the member area.
          </p>
          <p className="text-gray-500 text-sm">
            Current balance: {walletBalance.toLocaleString()} CTGOLD
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
