import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import { ContractStateProvider } from './context/ContractStateContext';
import { TransactionProvider } from './context/TransactionContext';
import { AppLayout } from './layouts/AppLayout';
import { TransactionModal } from './components/ui/TransactionModal';
const Landing = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Dashboard = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const Monitor = lazy(() => import('./pages/MonitorPage').then(m => ({ default: m.MonitorPage })));
const ProtectedAction = lazy(() => import('./pages/ProtectedActionPage').then(m => ({ default: m.ProtectedActionPage })));
const Recovery = lazy(() => import('./pages/RecoveryPage').then(m => ({ default: m.RecoveryPage })));
const Activity = lazy(() => import('./pages/ActivityPage').then(m => ({ default: m.ActivityPage })));
const Settings = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const HowItWorks = lazy(() => import('./pages/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const Architecture = lazy(() => import('./pages/ArchitecturePage').then(m => ({ default: m.ArchitecturePage })));
const Docs = lazy(() => import('./pages/DocsPage').then(m => ({ default: m.DocsPage })));
const About = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
export default function App() {
  return <WalletProvider><ContractStateProvider><TransactionProvider><BrowserRouter><Suspense fallback={<p className="p-8" role="status">Loading page…</p>}><Routes>
    <Route element={<AppLayout />}><Route path="/" element={<Landing />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/monitor" element={<Monitor />} /><Route path="/protected-action" element={<ProtectedAction />} /><Route path="/recovery" element={<Recovery />} /><Route path="/activity" element={<Activity />} /><Route path="/settings" element={<Settings />} /><Route path="/how-it-works" element={<HowItWorks />} /><Route path="/architecture" element={<Architecture />} /><Route path="/docs" element={<Docs />} /><Route path="/about" element={<About />} /></Route><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense><TransactionModal /></BrowserRouter></TransactionProvider></ContractStateProvider></WalletProvider>;
}
