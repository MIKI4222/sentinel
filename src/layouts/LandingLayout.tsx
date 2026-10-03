import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";

export function LandingLayout() {
  return (
    <div className="min-h-screen bg-sentinel-bg">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}