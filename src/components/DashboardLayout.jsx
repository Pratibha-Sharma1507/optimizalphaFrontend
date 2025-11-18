import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Topbar } from "./Topbar";

export default function DashboardLayout({ theme, setTheme }) {
  const [currency, setCurrency] = useState("INR");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950 text-black dark:text-white">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 
        bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 
        transform transition-transform duration-300 ease-in-out 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <Sidebar 
  theme={theme} 
  isSidebarOpen={isSidebarOpen} 
  setIsSidebarOpen={setIsSidebarOpen} 
/>

      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="sticky top-0 z-50">
          <Topbar
            theme={theme}
            setTheme={setTheme}
            currency={currency}
            setCurrency={setCurrency}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} //  pass handler
          />
        </header>

        <main className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth p-6">
          <Outlet context={{ currency }} />
        </main>
      </div>
    </div>
  );
}
