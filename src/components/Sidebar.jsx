import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  Brain,
  ShieldCheck,
  Bell,
  FileText,
  FolderLock,
  Map,
  Briefcase,
  ShoppingCart,
  HelpCircle,
  Settings,
  LogOut,
  Search,
  MessageCircleQuestion,
  UploadCloud,
  User,
} from "lucide-react";
import logo from "../assests/optimiz-logo.png";
import { authService } from "../services/authService";

export default function Sidebar({ theme, isSidebarOpen, setIsSidebarOpen }) {
  const sidebarRef = useRef(null);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();  
const [dashboardOpen, setDashboardOpen] = useState(false);


const [dropdownOpen, setDropdownOpen] = useState(false);
;


const [selectedPan, setSelectedPan] = useState(localStorage.getItem("selectedPan") || "All");
const [panList, setPanList] = useState([]);
const [searchTerm, setSearchTerm] = useState("");

const filteredPanList = panList.filter(item =>
  item.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
);



  const handleLogout = async () => {
    await authService.logout();
  };

  //  Close sidebar on outside click (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 1024
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsSidebarOpen]);

useEffect(() => {
  const fetchPanList = async () => {
    try {
      const panId = localStorage.getItem("pan");

      if (!panId) {
        console.warn(" No account id found in localStorage");
        return;
      }

      const res = await axios.get(`https://optimizalphabackend.onrender.com/api/pan-list/${panId}`, {
        withCredentials: true,
      });

      setPanList(res.data);

      // Auto select first PAN only if none selected
      if (!localStorage.getItem("selectedPan") && res.data.length > 0) {
        setSelectedPan(res.data[0].account_name);
        localStorage.setItem("selectedPan", res.data[0].account_name);
      }
    } catch (error) {
      console.log(" Error fetching PAN list:", error);
    }
  };

  fetchPanList();

  // Optional: listen if another component changes PAN
  const syncPan = () => setSelectedPan(localStorage.getItem("selectedPan"));
  window.addEventListener("pan-update", syncPan);

  return () => window.removeEventListener("pan-update", syncPan);

}, []);




  // Sidebar items
  const baseItems = [
    { label: "Home", path: "/dashboard", icon: Home },
    {
      label: "Dashboard",
      path: "/dash",
      icon: LayoutDashboard,
      subItems: [
        { label: "Overview", path: "/overview" },
        { label: "Cash & Cash Equivalents", path: "/cash" },
        { label: "Equity", path: "/equity" },
        { label: "Fixed Income", path: "/fixed-income" },
        { label: "Alternatives", path: "/alternatives" },
        { label: "Mutual Funds", path: "/mutual-funds" },
        { label: "Holdings", path: "/holdings" },
        { label: "Transactions", path: "/transactions" },
      ],
    },
    { label: "Intelligence Centre", path: "/intelligence", icon: Brain },
    { label: "Admin", path: "/admin", icon: ShieldCheck },
    { label: "Notification Centre", path: "/notifications", icon: Bell, badge: "10" },
    { label: "IPS", path: "/ips", icon: FileText },
    { label: "Vault", path: "/vault", icon: FolderLock },
    { label: "Portfolio Map", path: "/portfolio-map", icon: Map },
    { label: "Private Wealth", path: "/private-wealth", icon: Briefcase },
    { label: "Orders", path: "/orders", icon: ShoppingCart, chip: "Upcoming" },
    { label: "Help Center", path: "/help", icon: HelpCircle, chip: "Upcoming" },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const adminItems =
    role !== "user"
      ? [
          { label: "Roles", path: "/roles", icon: ShieldCheck },
          { label: "Uploader", path: "/uploader", icon: UploadCloud },
          { label: "Users", path: "/users", icon: User },
        ]
      : [];

  const items = [...baseItems.slice(0, 2), ...adminItems, ...baseItems.slice(2)];

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 h-screen bg-white dark:bg-neutral-950 
        text-gray-800 dark:text-neutral-300 border-r border-gray-200 dark:border-neutral-800 
        shadow-lg transform transition-transform duration-300 ease-in-out 
        flex flex-col overflow-hidden
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="px-4 h-16 flex items-center gap-3 border-b border-gray-200 dark:border-neutral-800 shrink-0">
          <img src={logo} alt="Company Logo" className="h-8 w-8 rounded-full bg-white p-1" />
          <span className="font-semibold text-base text-gray-900 dark:text-neutral-200">
            OptimizAlpha
          </span>
        </div>
<div className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
  <div className="relative">

    {/* Trigger Box */}
    <button
      onClick={() => setDropdownOpen(prev => !prev)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
      bg-gray-100 dark:bg-neutral-900 text-sm transition-all duration-200
      border
      ${dropdownOpen
        ? "border-gray-600 dark:border-neutral-400 bg-gray-200 dark:bg-neutral-800"
        : "border-gray-300 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-800"
      }`}
    >
      <span className={`truncate ${selectedPan ? "text-gray-800 dark:text-neutral-200" : "text-gray-500 dark:text-neutral-500"}`}>
        {selectedPan === "All" || !selectedPan ? "All Members" : selectedPan}
      </span>

      <svg
        className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* Dropdown (NO SEARCH NOW) */}
    {dropdownOpen && (
      <div className="absolute w-full mt-1 bg-white dark:bg-neutral-900 border 
      border-gray-300 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden 
      z-50 animate-dropdown">

        {/* Default: ALL Members */}
        <button
  className={`w-full text-left px-3 py-2 text-sm transition 
    hover:bg-gray-200 dark:hover:bg-neutral-800 ${
      selectedPan === "All"
        ? "bg-gray-200 dark:bg-neutral-700 font-medium"
        : "text-gray-700 dark:text-neutral-300"
    }`}
  onClick={() => {
    setSelectedPan("All");
    localStorage.setItem("selectedPan", "All");
    setDropdownOpen(false);
    window.dispatchEvent(new Event("pan-update"));
  }}
>
  All Members
</button>


        {/* Options */}
       {filteredPanList.map((pan) => (
  <button
    key={pan.account_name}
    className={`w-full text-left px-3 py-2 text-sm transition 
      hover:bg-gray-200 dark:hover:bg-neutral-800 ${
        selectedPan === pan.account_name
          ? "bg-gray-200 dark:bg-neutral-700 font-medium"
          : "text-gray-700 dark:text-neutral-300"
      }`}
    onClick={() => {
      setSelectedPan(pan.account_name);
      localStorage.setItem("selectedPan", pan.account_name);
      setDropdownOpen(false);
      window.dispatchEvent(new Event("pan-update"));
    }}
  >
    {pan.account_name}
  </button>
))}

      </div>
    )}
  </div>
</div>

<style>
  {`
    .animate-dropdown {
      animation: fadeSlide 0.18s ease-in-out;
    }
    @keyframes fadeSlide {
      0% { opacity: 0; transform: translateY(-6px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `}
</style>



        {/* Search + Ask Section */}
        <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-neutral-800 shrink-0">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-2 top-2.5 text-gray-500 dark:text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-7 pr-2 py-1 text-sm rounded-md bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-neutral-300 placeholder-gray-500 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-700"
            />
          </div>
          <button
            onClick={() => alert("Ask feature coming soon!")}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-neutral-300 hover:bg-gray-300 dark:hover:bg-neutral-700 transition-all"
          >
            <MessageCircleQuestion size={13} />
            <span>Ask</span>
          </button>
        </div>

        {/* Scrollable Nav Section */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-hide min-h-0">
          {items.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.subItems) {
              return (
                <div key={item.label} className="mt-1">
                  <button
                    onClick={() => setDashboardOpen(!dashboardOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all ${
                      isActive
                        ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium"
                        : "hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white text-gray-800 dark:text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {React.createElement(item.icon, { size: 16 })}
                      <span>{item.label}</span>
                    </div>
                    {dashboardOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {dashboardOpen && (
                    <div className="ml-5 mt-1 border-l border-gray-300 dark:border-neutral-800 pl-3 space-y-1">
                      {item.subItems.map((sub) => {
                        const subActive = location.pathname === sub.path;
                        return (
                          <button
                            key={sub.label}
                            onClick={() => {
                              navigate(sub.path);
                              if (window.innerWidth < 1024) setIsSidebarOpen(false); // ✅ added for mobile auto-close
                            }}
                            className={`block w-full text-left py-1.5 px-2 rounded-md text-sm transition-all ${
                              subActive
                                ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium"
                                : "hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white text-gray-700 dark:text-neutral-400"
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                  isActive
                    ? "bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white text-gray-800 dark:text-neutral-300"
                }`}
              >
                {React.createElement(item.icon, { size: 16 })}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] rounded px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-white border border-gray-300 dark:border-neutral-700">
                    {item.badge}
                  </span>
                )}
                {item.chip && (
                  <span className="ml-auto text-[10px] rounded-full px-2 py-0.5 bg-gray-200 dark:bg-neutral-800 text-gray-800 dark:text-white border border-gray-300 dark:border-neutral-700">
                    {item.chip}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-2 py-2 border-t border-gray-200 dark:border-neutral-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-900"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </aside>
    </>
  );
}
