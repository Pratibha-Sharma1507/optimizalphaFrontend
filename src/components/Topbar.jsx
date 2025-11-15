import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import axios from "axios";

export function Topbar({ theme, setTheme, currency, setCurrency, onMenuClick }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Detect current asset type from URL (auto-detect)
  const getAssetTypeFromPath = () => {
    const path = window.location.pathname.toLowerCase();

    if (path.includes("equity")) return "equity";
    if (path.includes("fixedincome")) return "fixedincome";
    if (path.includes("cash")) return "cash";
    if (path.includes("alternative")) return "alternative";
    if (path.includes("account")) return "account"; //  fixed
    return "equity"; // default fallback
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowThemeMenu(false);
        setShowCurrencyMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  //  Updated handleCurrencyChange (auto asset/account based)
  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    setShowCurrencyMenu(false);
    setShowDropdown(false);

    const assetType = getAssetTypeFromPath(); // 🧠 detect current section
    try {
      const response = await axios.get(
        `https://optimizalphabackend.onrender.com/api/${assetType}?currency=${newCurrency}`
      );
      console.log(` ${assetType.toUpperCase()} Data in ${newCurrency}:`, response.data);
    } catch (error) {
      console.error(`Error fetching ${assetType} data:`, error.message);
    }
  };

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
  ];

  const currentCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-gray-900 dark:text-white shadow-sm">
      {/* Left: Hamburger (mobile) */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-lg"
        >
          ≡
        </button>
      </div>

      {/* Right: Preferences + Avatar */}
      <div className="flex items-center gap-3 sm:gap-4" ref={dropdownRef}>
        {/* ⚙ Preferences Button */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 
                     bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-xs sm:text-sm"
          >
            ⚙ Preferences
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-[#1b1b1b] border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-xl z-50">
              {/* Theme Section */}
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-neutral-400">
                    Theme
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setShowThemeMenu(!showThemeMenu)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-gray-800 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                    >
                      {theme === "dark"
                        ? "Dark"
                        : theme === "light"
                        ? "Light"
                        : "System"}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showThemeMenu && (
                      <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 rounded shadow-lg z-50">
                        {["light", "dark", "system"].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => handleThemeChange(mode)}
                            className="w-full text-left px-2 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                          >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Currency Section */}
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-neutral-400">
                    Currency
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-xs text-gray-800 dark:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                    >
                      {currentCurrency.code} {currentCurrency.symbol}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showCurrencyMenu && (
                      <div className="absolute right-0 mt-1 w-28 sm:w-32 bg-white dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 rounded shadow-lg max-h-48 overflow-y-auto z-50">
                        {currencies.map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => handleCurrencyChange(curr.code)}
                            className={`w-full text-left px-2 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700 transition ${
                              currency === curr.code
                                ? "text-purple-600 dark:text-purple-400 font-medium"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {curr.code} {curr.symbol}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 👤 Avatar */}
        <div className="relative">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center font-semibold text-white shadow-md cursor-pointer hover:shadow-lg transition text-sm sm:text-base">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
