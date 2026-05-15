import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
  ArrowLeft,
  Users,
  IndianRupee,
  Layout,
  MessageSquare,
  Bell,
  Menu,
  X,
  UserPlus,
  Search,
} from "lucide-react";

const SuperLayout = () => {
  const { axios, navigate, setUser, setRole, logout } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu automatically when a route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // 🟢 Merged Links (Combining your Layout & Sidebar needs)
  const links = [
    { name: "Overview", path: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "Manage Admins", path: "/superadmin/admins", icon: ShieldCheck },
    { name: "All users", path: "/superadmin/users", icon: Users },
    { name: "Payout Requests", path: "/superadmin/payouts", icon: IndianRupee },
    { name: "Content Manager", path: "/superadmin/content", icon: Layout },
    { name: "Chat Monitor", path: "/superadmin/chat", icon: MessageSquare },
    { name: "Activity Logs", path: "/superadmin/logs", icon: Activity },
    { name: "System Settings", path: "/superadmin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 🟢 MOBILE OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🟢 SIDEBAR (Desktop Fixed + Mobile Slide-out) */}
      <div
        className={`fixed md:relative top-0 left-0 w-[280px] h-full bg-slate-950 border-r border-slate-800/60 flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800/60 flex flex-col gap-2 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold tracking-widest text-[10px] uppercase">
              <ShieldCheck size={14} /> Super Console
            </div>
            {/* Mobile Close Button inside sidebar */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md mt-1">
            horizon shop <span className="text-purple-500">OS</span>
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({
                isActive,
              }) => `group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm relative overflow-hidden
                            ${isActive ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-[0_4px_20px_-5px_rgba(147,51,234,0.5)] border border-purple-500/30" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-white shadow-[0_0_10px_white]"></div>
                  )}
                  <item.icon
                    size={18}
                    className={`transition-transform duration-300 ${isActive ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-purple-400"}`}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-800/60 space-y-2 bg-slate-950/50 shrink-0">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors text-sm font-bold group"
          >
            <span className="flex items-center gap-2">
              <Layout
                size={16}
                className="text-slate-500 group-hover:text-indigo-400 transition-colors"
              />{" "}
              Admin View
            </span>
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-sm font-bold border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} /> Logout System
          </button>
        </div>
      </div>

      {/* 🟢 MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/5 via-purple-900/5 to-slate-50 pointer-events-none z-0"></div>

        {/* Topbar (Mobile Hamburger & Desktop Breadcrumbs) */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-black text-slate-800 hidden md:block">
              Super Console
            </h1>
          </div>

          {/* Utilities removed by request */}
        </header>

        {/* Scrollable Outlet Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SuperLayout;
