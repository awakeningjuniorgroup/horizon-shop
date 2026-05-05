import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import {
  Bell,
  Search,
  ShoppingCart,
  Menu,
  CheckCircle,
  X,
  Home,
  ShoppingBag,
  Phone,
  LayoutDashboard,
  Package,
  Info,
  BellOff,
  Activity,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SignedIn,
  SignedOut,
  UserButton,
  useClerk,
  useUser,
} from "@clerk/clerk-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 🟢 SEARCH STATES
  const [localSearch, setLocalSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // 🟢 FUTURISTIC HOVER STATES
  const [showCartHover, setShowCartHover] = useState(false);
  const [showOrderHover, setShowOrderHover] = useState(false);
  const [liveOrder, setLiveOrder] = useState(null);
  const hoverTimeout = useRef(null);

  const {
    user,
    role,
    getCartCount,
    token,
    axios,
    backendUrl,
    products,
    currency,
    t,
  } = useAppContext();

  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const { user: clerkUser } = useUser();
  const location = useLocation();

  // 🟢 ROLES & SURFING LOGIC
  const staffRoles = ["admin", "superadmin", "seller", "rider"];
  const isStaff = user && staffRoles.includes(role);
  const allowSurfing = !user || ["user", "superadmin"].includes(role);
  const isCustomer = user && role === "user";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  // 🟢 FETCH NOTIFICATIONS & LIVE ORDERS
  useEffect(() => {
    if (token) {
      axios
        .get(backendUrl + "/api/user/notifications")
        .then((res) => {
          if (res.data.success) setNotifications(res.data.notifications);
        })
        .catch(() => {});

      if (isCustomer) {
        axios
          .get(backendUrl + "/api/order/user")
          .then((res) => {
            if (res.data.success && res.data.orders.length > 0) {
              const latest = res.data.orders[0];
              if (!["Delivered", "Cancelled"].includes(latest.status)) {
                setLiveOrder(latest);
              } else {
                setLiveOrder(null);
              }
            }
          })
          .catch(() => {});
      }
    }
  }, [token, backendUrl, axios, isCustomer, location]);

  // 🟢 LIVE SEARCH LOGIC
  useEffect(() => {
    if (localSearch.trim().length > 0) {
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(localSearch.toLowerCase()) ||
          product.category?.toLowerCase().includes(localSearch.toLowerCase()),
      );
      setSearchResults(results.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  }, [localSearch, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target))
        setIsSearchFocused(false);
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotif(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSelect = (productId) => {
    setLocalSearch("");
    setIsSearchFocused(false);
    setOpen(false); // Close mobile menu if open
    navigate(`/product/${productId}`);
  };

  const handleDashboardRedirect = () => {
    if (!user) return;
    switch (role) {
      case "superadmin":
        navigate("/superadmin/dashboard");
        break;
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "seller":
        navigate("/seller/dashboard");
        break;
      case "rider":
        navigate("/rider/dashboard");
        break;
      default:
        navigate("/home");
    }
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      toast.error(t.authMessages.pleaseLoginToContinue, { icon: "🔒" });
      openSignIn();
    } else {
      if (e.currentTarget.tagName !== "A") {
        setOpen(false);
        navigate("/cart");
      } else {
        setOpen(false);
      }
    }
  };

  // ==========================================
  // 🟢 MUTUAL EXCLUSION LOGIC (Only 1 popup at a time)
  // ==========================================
  const handleMouseEnter = (popupName) => {
    clearTimeout(hoverTimeout.current);

    if (popupName === "order") {
      setShowOrderHover(true);
      setShowCartHover(false);
      setShowNotif(false);
      setIsSearchFocused(false);
    } else if (popupName === "cart") {
      setShowCartHover(true);
      setShowOrderHover(false);
      setShowNotif(false);
      setIsSearchFocused(false);
    }
  };

  const handleMouseLeave = (popupName) => {
    hoverTimeout.current = setTimeout(() => {
      if (popupName === "order") setShowOrderHover(false);
      if (popupName === "cart") setShowCartHover(false);
    }, 200);
  };

  const toggleNotif = (e) => {
    e.stopPropagation();
    setShowNotif(!showNotif);
    setShowOrderHover(false);
    setShowCartHover(false);
    setIsSearchFocused(false);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowOrderHover(false);
    setShowCartHover(false);
    setShowNotif(false);
  };

  return (
    <>
      <nav
        className={`flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-24 py-3 transition-all duration-300 fixed w-full z-[999] top-0 font-outfit
            ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_-10px_rgba(0,0,0,0.1)] border-b border-white/50" : "bg-white border-b border-slate-100"}`}
      >
        {/* 🟢 LOGO */}
        <div
          onClick={() =>
            allowSurfing ? navigate("/home") : handleDashboardRedirect()
          }
          className="flex items-center gap-1 cursor-pointer shrink-0"
        >
          <img
            className="h-8 md:h-10 w-auto object-contain transition-transform duration-300 active:scale-95"
            src={assets.logo}
            alt="Horizon Business"
          />
        </div>

        {/* 🟢 DESKTOP NAVIGATION */}
        {allowSurfing && (
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 font-bold text-[#4A76AC] text-[14px] xl:text-[15px] flex-1 px-4 xl:px-8">
            <NavLink
              to="/home"
              className={
                ({ isActive }) =>
                  isActive
                    ? "text-[#4A76AC] border-b-2 border-[#4A76AC]" // Style si actif (optionnel : ajoute une ligne en dessous)
                    : "hover:text-[#3d618c] transition-colors" // Bleu un peu plus foncé au survol
              }
            >
              {t.nav.home}
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive
                  ? "text-[#4A76AC] border-b-2 border-[#4A76AC]"
                  : "hover:text-[#3d618c] transition-colors"
              }
            >
              {t.shop.shop}
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive
                  ? "text-[#4A76AC] border-b-2 border-[#4A76AC]"
                  : "hover:text-[#3d618c] transition-colors"
              }
            >
              {t.contact.contactUs}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive
                  ? "text-[#4A76AC] border-b-2 border-[#4A76AC]"
                  : "hover:text-[#3d618c] transition-colors"
              }
            >
              {t.nav.about}
            </NavLink>
          </div>
        )}

        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* 🟢 DESKTOP SEARCH BAR */}
          {allowSurfing && (
            <div ref={searchRef} className="hidden md:block relative z-50">
              <div
                className={`flex items-center text-sm gap-2.5 px-4 py-2.5 rounded-2xl w-56 lg:w-72 xl:w-80 transition-all duration-200 border
                            ${isSearchFocused ? "bg-white border-[#3d618c] shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" : "bg-slate-100 border-transparent hover:bg-slate-200/60"}`}
              >
                <Search
                  className={`w-4 h-4 transition-colors ${isSearchFocused ? "text-[#3d618c]" : "text-slate-400"}`}
                />
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="w-full bg-transparent outline-none text-slate-800 font-medium placeholder:font-medium placeholder:text-slate-400"
                  type="text"
                  placeholder={t.nav.search + "..."}
                />
                {localSearch && (
                  <button
                    onClick={() => setLocalSearch("")}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* DESKTOP SEARCH SUGGESTIONS */}
              {isSearchFocused && localSearch.length > 0 && (
                <div className="absolute top-[110%] left-0 w-full bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] border border-slate-100 rounded-2xl overflow-hidden animate-fade-in-up">
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Top Results
                      </div>
                      {searchResults.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSearchSelect(item._id)}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b last:border-b-0 border-slate-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 p-1">
                            <img
                              src={item.image[0]}
                              alt={item.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-emerald-600 font-black">
                              {currency}
                              {item.offerPrice}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-2">
                      <Search size={24} className="text-slate-300" />{" "}
                      {t.navbar.noProductsFound}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            {/* 🟢 NOTIFICATIONS */}
            <SignedIn>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors relative group active:scale-95"
                >
                  <Bell className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotif && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      // 🟢 FIX: Mobile responsive bounding box so it doesn't bleed off screen
                      className="absolute right-[-60px] sm:right-0 mt-3 w-[85vw] max-w-[320px] sm:w-80 bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] border border-slate-100 rounded-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-black text-slate-800 text-sm tracking-wide">
                          {t.navbar.notifications}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            {unreadCount} {t.navbar.newNotifications}
                          </span>
                        )}
                      </div>
                      <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2">
                        {notifications.length > 0 ? (
                          notifications.map((notif, idx) => (
                            <div
                              key={idx}
                              className="p-3 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3 items-start cursor-pointer rounded-xl"
                            >
                              <div className="mt-0.5 bg-emerald-100 p-1 rounded-full">
                                <CheckCircle
                                  size={14}
                                  className="text-emerald-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center text-slate-400 text-sm font-medium">
                            <BellOff
                              size={24}
                              className="mx-auto mb-2 opacity-50"
                            />{" "}
                            {t.notifications.allCaughtUp}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SignedIn>

            {/* 🟢 FUTURISTIC ORDERS HOVER */}
            {isCustomer && (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => handleMouseEnter("order")}
                onMouseLeave={() => handleMouseLeave("order")}
              >
                <div
                  onClick={() => navigate("/my-orders")}
                  className="relative flex w-10 h-10 items-center justify-center bg-slate-100 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer group active:scale-95"
                >
                  <Package
                    className={`w-4 h-4 transition-colors ${liveOrder ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"}`}
                  />
                  {liveOrder && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  )}
                </div>

                <AnimatePresence>
                  {showOrderHover && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="absolute top-[120%] right-0 w-72 bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 rounded-[2rem] p-5 z-50 origin-top-right"
                    >
                      {liveOrder ? (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                              {t.navbar.liveTracker}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                            Order #{liveOrder._id.slice(-6).toUpperCase()}
                          </h4>
                          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg w-fit mb-4 border border-indigo-100">
                            <Activity size={14} className="animate-pulse" />
                            <span className="text-xs font-bold">
                              {liveOrder.status}
                            </span>
                          </div>
                          <button
                            onClick={() => navigate("/my-orders")}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors flex justify-center items-center gap-2"
                          >
                            {t.navbar.trackOnMap} <ChevronRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Package
                            size={32}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="font-bold text-slate-800 text-sm">
                            {t.navbar.orderHistory}
                          </p>
                          <p className="text-xs text-slate-500 mb-4 mt-1">
                            {t.navbar.checkPastDeliveries}
                          </p>
                          <button
                            onClick={() => navigate("/my-orders")}
                            className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                          >
                            {t.notifications.viewAllOrders}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 🟢 FUTURISTIC CART HOVER */}
            {allowSurfing && !isStaff && (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => handleMouseEnter("cart")}
                onMouseLeave={() => handleMouseLeave("cart")}
              >
                <div
                  onClick={handleCartClick}
                  className="relative flex w-10 h-10 items-center justify-center bg-slate-100 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer group active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-600 group-hover:text-[#3d618c] transition-colors" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-[#3d618c] w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm transition-transform group-hover:scale-110">
                      {getCartCount()}
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {showCartHover && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="absolute top-[120%] right-0 w-64 bg-white/95 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 rounded-[2rem] p-5 z-50 origin-top-right"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-black text-slate-800">Votre panier</h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {getCartCount()} Items
                        </span>
                      </div>
                      {getCartCount() > 0 ? (
                        <>
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 mb-4 text-center">
                            <p className="text-xs text-[#4A76AC] font-bold uppercase tracking-widest">
                              Prêt à payer
                            </p>
                          </div>
                          <button
                            onClick={handleCartClick}
                            className="w-full py-3 bg-gradient-to-r from-[#4A76AC] to-[#4A76AC] text-white rounded-xl text-sm font-bold shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                            {t.cartActions.proceedToCart}
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <ShoppingCart
                            size={32}
                            className="mx-auto text-slate-300 mb-3"
                          />
                          <p className="text-sm font-bold text-slate-500">
                            {t.cartActions.cartIsEmpty}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 🟢 DASHBOARD BUTTON (Staff) */}
            {isStaff && (
              <button
                onClick={handleDashboardRedirect}
                className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95"
              >
                <LayoutDashboard size={16} /> {t.dashboard.dashboard}
              </button>
            )}

            {/* 🟢 USER / AUTH */}
            <SignedOut>
              <button
                onClick={() => openSignIn()}
                className="hidden sm:block cursor-pointer px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Login
              </button>
            </SignedOut>

            <SignedIn>
              <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center hover:border-slate-300 transition-colors bg-white p-0.5 active:scale-95">
                <UserButton
                  appearance={{ elements: { avatarBox: "w-full h-full" } }}
                />
              </div>
            </SignedIn>

            {/* 🟢 MOBILE MENU TOGGLE */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-100 rounded-full active:scale-95 relative"
            >
              <Menu size={20} />
              {getCartCount() > 0 && allowSurfing && !isStaff && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 🟢 MOBILE SLIDE-OUT MENU */}
      <div
        className={`fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      ></div>
      <div
        className={`fixed top-0 right-0 bottom-0 z-[1001] bg-white transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-2xl overflow-hidden flex flex-col w-[85vw] sm:w-[350px] md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <img
            className="h-7 w-auto mix-blend-multiply"
            src={assets.logo}
            alt="Kuaku Market"
          />
          <button
            onClick={() => setOpen(false)}
            className="bg-white p-2 rounded-full hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2 bg-white">
          <SignedIn>
            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6 shrink-0">
              <UserButton
                appearance={{ elements: { avatarBox: "w-12 h-12" } }}
              />
              <div className="overflow-hidden">
                <p className="text-sm font-black text-slate-900 truncate tracking-wide">
                  {clerkUser?.fullName || "User"}
                </p>
                <p className="text-xs font-medium text-slate-500 truncate">
                  {clerkUser?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </SignedIn>

          {/* 🟢 NEW: MOBILE SEARCH BAR */}
          {allowSurfing && (
            <div className="relative mb-6 shrink-0">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-100 rounded-xl border border-transparent focus-within:border-emerald-500 focus-within:bg-white transition-colors">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
                  placeholder={t.authMessages.searchProducts + "..."}
                />
                {localSearch && (
                  <button onClick={() => setLocalSearch("")}>
                    <X size={14} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* MOBILE SEARCH RESULTS */}
              {localSearch.length > 0 && searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleSearchSelect(item._id)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 border-b last:border-b-0 border-slate-50 cursor-pointer"
                    >
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="w-8 h-8 object-contain rounded bg-slate-100 p-0.5"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-black text-emerald-600">
                          {currency}
                          {item.offerPrice}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {allowSurfing && (
            <div className="space-y-1.5 shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                Navigation
              </p>
              <NavLink
                onClick={() => setOpen(false)}
                to="/home"
                className={({ isActive }) =>
                  `py-3.5 px-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Home
                      size={18}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />{" "}
                    {t.nav.home}
                  </>
                )}
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/products"
                className={({ isActive }) =>
                  `py-3.5 px-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <ShoppingBag
                      size={18}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />{" "}
                    {t.shop.shopCollection}
                  </>
                )}
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/about"
                className={({ isActive }) =>
                  `py-3.5 px-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Home
                      size={18}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />{" "}
                    About us
                  </>
                )}
              </NavLink>

              {/* 🟢 MOBILE CART LINK (Needed since hover is hidden on mobile) */}
              {!isStaff && (
                <NavLink
                  onClick={handleCartClick}
                  to="/cart"
                  className={({ isActive }) =>
                    `py-3.5 px-4 rounded-xl font-bold flex items-center justify-between transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <ShoppingCart
                          size={18}
                          className={
                            isActive ? "text-emerald-500" : "text-slate-400"
                          }
                        />{" "}
                        Cart
                      </div>
                      {getCartCount() > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                          {getCartCount()}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}

              {isCustomer && (
                <NavLink
                  onClick={() => setOpen(false)}
                  to="/my-orders"
                  className={({ isActive }) =>
                    `py-3.5 px-4 rounded-xl font-bold flex items-center justify-between transition-colors ${isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-600"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Package
                          size={18}
                          className={
                            isActive ? "text-indigo-500" : "text-slate-400"
                          }
                        />{" "}
                        Mes commandes
                      </div>
                      {liveOrder && (
                        <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                          <Activity size={10} /> Live
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )}

              <div className="h-px bg-slate-100 my-4 mx-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                Support
              </p>
              <NavLink
                onClick={() => setOpen(false)}
                to="/contact"
                className={({ isActive }) =>
                  `py-3.5 px-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Phone
                      size={18}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />{" "}
                    {t.contact.contactUs}
                  </>
                )}
              </NavLink>
              <NavLink
                onClick={() => setOpen(false)}
                to="/about"
                className={({ isActive }) =>
                  `py-3.5 px-4 rounded-xl font-bold flex items-center gap-3 transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Info
                      size={18}
                      className={
                        isActive ? "text-emerald-500" : "text-slate-400"
                      }
                    />{" "}
                    {t.nav.about}
                  </>
                )}
              </NavLink>
            </div>
          )}

          {isStaff && (
            <div className="mt-6 border-t border-slate-100 pt-6 shrink-0">
              <button
                onClick={() => {
                  setOpen(false);
                  handleDashboardRedirect();
                }}
                className="w-full py-4 px-5 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] active:scale-95 transition-transform"
              >
                <LayoutDashboard size={18} /> {t.authMessages.accessDashboard}
              </button>
            </div>
          )}

          <SignedOut>
            <div className="mt-auto border-t border-slate-100 pt-6 shrink-0">
              <button
                onClick={() => {
                  openSignIn();
                  setOpen(false);
                }}
                className="w-full py-4 px-5 rounded-xl bg-slate-900 text-white font-bold text-center shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
              >
                {t.navbar.loginOrRegister}
              </button>
            </div>
          </SignedOut>
        </div>
      </div>
    </>
  );
};

export default Navbar;
