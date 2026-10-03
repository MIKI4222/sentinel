import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { ContractStateProvider } from "./context/ContractStateContext";
import { TransactionProvider } from "./context/TransactionContext";
import { AppLayout } from "./layouts/AppLayout";
import { LandingLayout } from "./layouts/LandingLayout";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MonitorPage } from "./pages/MonitorPage";
import { ProtectedActionPage } from "./pages/ProtectedActionPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { ActivityPage } from "./pages/ActivityPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { DocsPage } from "./pages/DocsPage";
import { AboutPage } from "./pages/AboutPage";

function App() {
  return (
    <WalletProvider>
      <ContractStateProvider>
        <TransactionProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<LandingLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/architecture" element={<ArchitecturePage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/monitor" element={<MonitorPage />} />
                <Route path="/protected-action" element={<ProtectedActionPage />} />
                <Route path="/recovery" element={<RecoveryPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TransactionProvider>
      </ContractStateProvider>
    </WalletProvider>
  );
}

export default App;
