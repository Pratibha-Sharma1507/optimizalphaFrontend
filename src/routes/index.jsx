import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login';
import SignupPage from '../pages/Signup';
import AuthCallback from '../pages/AuthCallback';
import DashboardLayout from '../components/DashboardLayout';
import EquityPanel from '../components/EquityPanel';
import FixedIncomePanel  from '../components/FixedIncome';
import CashPanel from '../components/CashPanel';
import MutualFunds from '../components/MutualFund';
import Dashboard from '../pages/Home';
import Overview from '../pages/Overview';
import ProtectedRoute from '../components/ProtectedRoute';
import Uploader from '../components/Uploader';
import  Roles from '../components/Roles';
// importUsersfrom '../components/Users';
import Users from '../components/Users';
import Alternative from '../components/Alternative';

export const AppRoutes = ({ theme, setTheme }) => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Dashboard routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout theme={theme} setTheme={setTheme} />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="overview" element={<Overview />} />
          <Route path="equity" element={<EquityPanel />} />
          <Route path="fixed-income" element={<FixedIncomePanel />} />
          <Route path="cash" element={<CashPanel />} />
          <Route path="mutual-funds" element={<MutualFunds />} />
           <Route path="uploader" element={<Uploader />} />
            <Route path="alternatives" element={<Alternative />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={<h1 className="text-center text-black dark:text-white mt-10">404 - Page Not Found</h1>}
      />
    </Routes>
  );
};
