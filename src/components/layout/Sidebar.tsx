import { NavLink } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { Shield, Menu } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { getExplorerAddressUrl } from '../../config';
import { Modal } from '../ui/Modal';
const links = [['/', 'Overview'], ['/dashboard', 'Dashboard'], ['/monitor', 'Monitor'], ['/protected-action', 'Guarded action'], ['/recovery', 'Recovery'], ['/activity', 'Activity'], ['/settings', 'Configuration'], ['/how-it-works', 'How it works'], ['/architecture', 'Architecture'], ['/docs', 'Docs'], ['/about', 'About']] as const;
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const wallet = useWallet();
  return <div className="flex flex-col gap-6"><NavLink to="/" onClick={onNavigate} className="flex gap-3 items-center text-xl font-bold"><Shield className="text-sentinel-accent" />Sentinel</NavLink>
    <nav aria-label="Main navigation" className="flex flex-col gap-1">{links.map(([path, label]) => <NavLink end key={path} to={path} onClick={onNavigate} className={({ isActive }) => `rounded-lg px-3 py-3 ${isActive ? 'bg-sentinel-accent/10 text-sentinel-accent' : 'text-sentinel-textMuted hover:text-sentinel-text'}`}>{label}</NavLink>)}</nav>
    <section className="space-y-3 border-t border-sentinel-border pt-4">
      {wallet.address ? <><p className="font-mono break-all text-sm">{wallet.address}</p><p className="text-sm break-all">Balance: {wallet.balance ?? 'unavailable'} GEN</p><a className="link" href={getExplorerAddressUrl(wallet.address)} target="_blank" rel="noreferrer">Wallet in explorer</a><button className="btn-secondary w-full" onClick={wallet.disconnect}>Disconnect locally</button></> : <button className="btn-primary w-full" disabled={wallet.isConnecting} onClick={() => void wallet.connect().catch(() => {})}>Connect wallet</button>}
      {wallet.isConnected && !wallet.isCorrectNetwork && <><p role="alert" className="text-sentinel-warning">Wrong network</p><button className="btn-secondary w-full" onClick={() => void wallet.switchNetwork().catch(() => {})}>Switch to Bradbury</button></>}
      {wallet.error && <p role="alert" className="text-sentinel-warning">{wallet.error}</p>}
    </section>
  </div>;
}
export function Sidebar() {
  const [open, setOpen] = useState(false); const close = useCallback(() => setOpen(false), []);
  return <><button className="lg:hidden fixed top-4 left-4 z-40 btn-secondary min-h-11" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></button>
    <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 overflow-auto bg-sentinel-card border-r border-sentinel-border p-5"><Navigation /></aside>
    <Modal isOpen={open} onClose={close} title="Navigation"><Navigation onNavigate={close} /></Modal>
  </>;
}
