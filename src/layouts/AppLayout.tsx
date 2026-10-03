import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
export function AppLayout() { return <div className="min-h-screen bg-sentinel-bg"><Sidebar /><main className="lg:ml-64 min-h-screen"><div className="max-w-6xl mx-auto p-5 pt-24 lg:p-8"><Outlet /></div></main></div>; }
