import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Shield,
  RotateCcw,
  Settings,
  GitBranch,
  BookOpen,
  Info,
  Monitor,
  Zap,
  Copy,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useGenLayer } from "../../hooks/useGenLayer";
import { useState } from "react";

const navigation = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/monitor", label: "Monitor", icon: Monitor },
  { path: "/protected-action", label: "Protected Action", icon: Shield },
  { path: "/recovery", label: "Recovery", icon: RotateCcw },
  { path: "/activity", label: "Activity", icon: Activity },
  { path: "/settings", label: "Settings", icon: Settings },
];

const docsNavigation = [
  { path: "/how-it-works", label: "How It Works", icon: Zap },
  { path: "/architecture", label: "Architecture", icon: GitBranch },
  { path: "/docs", label: "Documentation", icon: BookOpen },
  { path: "/about", label: "About", icon: Info },
];

export function Sidebar() {
  const { wallet, connectWallet, disconnectWallet, switchNetwork } = useGenLayer();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sentinel-card border border-sentinel-border text-sentinel-text hover:bg-sentinel-border transition-colors"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isMobileOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-sentinel-card border-r border-sentinel-border flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-sentinel-border flex items-center justify-between">
            <NavLink to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sentinel-accent/15">
                <Shield className="h-6 w-6 text-sentinel-accent" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sentinel-text">Sentinel</h1>
                <p className="text-xs text-sentinel-textMuted">Decentralized Protection</p>
              </div>
            </NavLink>
            {isMobileOpen && (
              <button
                onClick={closeMobileMenu}
                className="lg:hidden p-1 rounded-lg text-sentinel-textMuted hover:text-sentinel-text hover:bg-sentinel-border transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
            <h3 className="px-3 py-2 text-xs font-semibold text-sentinel-textMuted uppercase tracking-wider">
              Application
            </h3>
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sentinel-accent/10 text-sentinel-accent border border-sentinel-accent/20"
                      : "text-sentinel-textMuted hover:text-sentinel-text hover:bg-sentinel-border"
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-sentinel-border">
              <h3 className="px-3 py-2 text-xs font-semibold text-sentinel-textMuted uppercase tracking-wider">
                Documentation
              </h3>
              {docsNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-sentinel-accent/10 text-sentinel-accent border border-sentinel-accent/20"
                        : "text-sentinel-textMuted hover:text-sentinel-text hover:bg-sentinel-border"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-sentinel-border">
          <div className="space-y-3">
            {wallet.isConnected ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-sentinel-bg rounded-lg border border-sentinel-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sentinel-accent/15">
                    <Activity className="h-4 w-4 text-sentinel-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-sentinel-textMuted">Connected</p>
                    <p className="text-sm font-mono text-sentinel-text truncate">{wallet.address}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(wallet.address || "")}
                    className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                    aria-label="Copy address"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={disconnectWallet}
                    className="flex-1 btn-ghost text-xs py-2 flex items-center justify-center gap-1.5 text-sentinel-danger hover:text-sentinel-danger"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Disconnect
                  </button>
                </div>
                {wallet.chainId && (
                  <a
                    href={`https://explorer-bradbury.genlayer.com/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs text-sentinel-textMuted hover:text-sentinel-accent transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Explorer
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="w-full btn-primary justify-center"
                disabled={wallet.isConnecting}
              >
                {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            {wallet.isConnected && wallet.chainId && wallet.chainId !== 4221 && (
              <button
                onClick={switchNetwork}
                className="w-full btn-secondary justify-center"
              >
                Switch to Bradbury
              </button>
            )}

            {wallet.error && (
              <p className="text-xs text-sentinel-danger text-center" role="alert">
                {wallet.error}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}