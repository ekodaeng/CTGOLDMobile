import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';

import { RequireAdminAuth, RequireMemberAuth, RequireSuperAdmin } from './guards/RouteGuards';
import { RequireWalletConnection, RequireCTGOLDBalance } from './guards/WalletGuard';

import PublicLayout from './layouts/PublicLayout';
import MemberLayout from './layouts/MemberLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import About from './pages/About';
import Trade from './pages/Trade';
import Laporan from './pages/Laporan';
import Whitepaper from './pages/Whitepaper';
import Roadmap from './pages/Roadmap';
import FAQ from './pages/FAQ';
import Tutorial from './pages/Tutorial';
import NotFound from './pages/NotFound';
import MemberInfoRedirect from './components/MemberInfoRedirect';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MemberEducation from './pages/MemberEducation';
import MemberBuyback from './pages/MemberBuyback';
import MemberBurn from './pages/MemberBurn';
import MemberTrading from './pages/MemberTrading';

import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminResetPassword from './pages/AdminResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManageAdmins from './pages/admin/ManageAdmins';
import AdminAnalytics from './pages/admin/AdminAnalytics';

import Web3Landing from './pages/Web3Landing';
import Web3Dashboard from './pages/Web3Dashboard';
import Web3VIP from './pages/Web3VIP';
import Web3Network from './pages/Web3Network';
import Web3Profile from './pages/Web3Profile';
import Web3Admin from './pages/Web3Admin';
import Web3Deposit from './pages/Web3Deposit';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/member-info" element={<MemberInfoRedirect />} />
            <Route path="/whitepaper" element={<Whitepaper />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/tutorial" element={<Tutorial />} />
          </Route>

          <Route path="/member" element={<MemberLayout />}>
            <Route index element={<Navigate to="/member/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            <Route element={<RequireMemberAuth />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="education" element={<MemberEducation />} />
              <Route path="buyback" element={<MemberBuyback />} />
              <Route path="burn" element={<MemberBurn />} />
              <Route path="trading" element={<MemberTrading />} />
            </Route>

            <Route path="*" element={<Navigate to="/member/login" replace />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/login" replace />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="setup" element={<AdminSetup />} />
            <Route path="forgot-password" element={<AdminForgotPassword />} />
            <Route path="reset-password" element={<AdminResetPassword />} />

            <Route element={<RequireAdminAuth />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route element={<RequireSuperAdmin />}>
              <Route path="admins" element={<ManageAdmins />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Route>

          <Route path="/web3/landing" element={
            <WalletProvider>
              <Web3Landing />
            </WalletProvider>
          } />

          <Route element={
            <WalletProvider>
              <RequireWalletConnection />
            </WalletProvider>
          }>
            <Route element={<RequireCTGOLDBalance />}>
              <Route path="/web3" element={<Web3Dashboard />} />
              <Route path="/web3/deposit" element={<Web3Deposit />} />
              <Route path="/web3/vip" element={<Web3VIP />} />
              <Route path="/web3/network" element={<Web3Network />} />
              <Route path="/web3/profile" element={<Web3Profile />} />
              <Route path="/web3/admin" element={<Web3Admin />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
