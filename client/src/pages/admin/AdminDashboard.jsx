import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  TrendingUp,
  Truck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Key,
  Navigation,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Landmark,
  Bell,
  MessageSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { axios, currency } = useAppContext();
  const [activeTab, setActiveTab] = useState("financials");

  const [statsData, setStatsData] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 NOTIFICATION STATE
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchData = async () => {
    try {
      const statsRes = await axios.get("/api/admin/stats");
      if (statsRes.data.success) setStatsData(statsRes.data);

      const ordersRes = await axios.get("/api/order/all-list");
      if (ordersRes.data.success) {
        const active = ordersRes.data.orders.filter(
          (o) => !["Delivered", "Cancelled"].includes(o.status),
        );
        setLiveOrders(active);
      }

      // 🟢 NEW: Fetch Admin/System Notifications
      const notifRes = await axios.get("/api/user/notifications");
      if (notifRes.data.success) setNotifications(notifRes.data.notifications);
    } catch (error) {
      console.error("Dashboard Error:", error);
      toast.error("Failed to sync enterprise data");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NEW: Mark as read and open the particular message
  const handleOpenMessage = async (note) => {
    setSelectedMessage(note); // Open the modal
    setShowNotifications(false); // Close dropdown

    if (!note.isRead) {
      try {
        await axios.post("/api/user/notifications/read", { id: note._id });
        // Update UI optimistically
        setNotifications((prev) =>
          prev.map((n) => (n._id === note._id ? { ...n, isRead: true } : n)),
        );
      } catch (e) {
        console.log("Failed to mark read");
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [axios]);

  if (loading || !statsData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium tracking-widest uppercase text-[10px]">
          Syncing Ledger...
        </p>
      </div>
    );
  }

  // --- Financial Data Mapping (With safe fallbacks) ---
  const platformProfit =
    statsData.stats?.earningsSplit?.platform ||
    statsData.stats?.platformEarnings ||
    0;
  const totalGross =
    statsData.stats?.financials?.revenue || statsData.stats?.revenue || 0;
  const totalOrders =
    statsData.stats?.financials?.orders || statsData.stats?.orders || 0;

  const pendingPayouts = statsData.stats?.payoutBreakdown?.pending || 0;
  const completedPayouts = statsData.stats?.payoutBreakdown?.paid || 0;

  const recentWithdrawals = statsData.stats?.recentWithdrawals || [];
  const topPartnerBalances = statsData.stats?.topPartnerBalances || [];
  const graphData =
    statsData.stats?.revenueOverTime || statsData.graphData || [];

  const COLORS = ["#0f172a", "#3b82f6", "#f26691", "#f59e0b", "#ef4444"];
  const pieData =
    statsData.statusStats?.map((item) => ({
      name: item._id,
      value: item.count,
    })) || [];

  // 🟢 NEW FINANCIAL GRAPH DATA
  const financialPieData = [
    { name: "Platform Net Profit", value: platformProfit },
    { name: "Paid to Partners", value: completedPayouts },
    { name: "Pending Liabilities", value: pendingPayouts },
  ].filter((item) => item.value > 0);

  const FIN_COLORS = ["#f26691", "#3b82f6", "#f59e0b"]; // Emerald, Blue, Amber

  // --- Minimalist Enterprise Components ---
  const MetricCard = ({ title, value, subtitle, icon: Icon, trend }) => (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-md border border-slate-100 text-slate-500 group-hover:text-indigo-600 transition-colors">
          <Icon size={18} strokeWidth={2} />
        </div>
        {trend && (
          <span
            className={`text-[11px] font-semibold px-2 py-1 rounded flex items-center gap-1 ${trend > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            {trend > 0 ? (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            )}{" "}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
          {title}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 font-outfit max-w-[1400px] mx-auto">
      {/* 🟢 HEADER & TABS (Enterprise Look) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-slate-200 sticky top-4 z-40">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building size={20} className="text-indigo-600" /> Executive
            Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time system telemetry and financial ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-md w-full md:w-auto border border-slate-200">
            {["financials", "dispatch", "analytics"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none capitalize px-6 py-2 rounded text-[13px] font-semibold transition-all duration-200 ${activeTab === tab ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 🟢 SYSTEM INBOX / NOTIFICATION BELL */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <Bell
                size={18}
                className={
                  unreadCount > 0 ? "animate-pulse text-indigo-600" : ""
                }
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-xs">
                        System Inbox
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1.5">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs font-medium">
                          No system messages.
                        </div>
                      ) : (
                        notifications.map((note, i) => (
                          <div
                            key={i}
                            onClick={() => handleOpenMessage(note)}
                            className={`p-3 rounded-md mb-1 cursor-pointer transition-all border border-transparent ${note.isRead ? "hover:bg-slate-50" : "bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100/50"}`}
                          >
                            <h4
                              className={`text-xs ${note.isRead ? "font-semibold text-slate-700" : "font-bold text-indigo-900"}`}
                            >
                              {note.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {note.message}
                            </p>
                            {!note.isRead && (
                              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-1.5">
                                Click to read
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* 🟢 TAB 1: FINANCIAL LEDGER */}
        {activeTab === "financials" && (
          <motion.div
            key="financials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <MetricCard
                title="Gross Volume (GMV)"
                value={`${currency}${totalGross.toLocaleString()}`}
                icon={CreditCard}
                trend={12.5}
              />
              <MetricCard
                title="Net Platform Profit"
                value={`${currency}${platformProfit.toLocaleString()}`}
                icon={Landmark}
                trend={8.2}
              />
            </div>

            {/* 🟢 NEW FINANCIAL GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financial Distribution Donut */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center relative">
                <h3 className="text-sm font-semibold text-slate-800 w-full text-left mb-4 border-b border-slate-100 pb-3">
                  Gross Volume Distribution
                </h3>
                <div className="w-full h-[250px] relative mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {financialPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={FIN_COLORS[index % FIN_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val) =>
                          `${currency}${val.toLocaleString()}`
                        }
                        contentStyle={{
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#64748b",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                    <span className="block text-2xl font-bold text-slate-900">
                      {currency}
                      {(
                        platformProfit +
                        completedPayouts +
                        pendingPayouts
                      ).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
                      Accounted
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue Area Chart */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-800">
                    7-Day Revenue Momentum
                  </h3>
                </div>
                <div className="p-6 w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={graphData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRevFin"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f26691"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f26691"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                        tickFormatter={(val) => `FCFA${val}`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: "4px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                          fontSize: "12px",
                        }}
                        itemStyle={{ fontWeight: 600, color: "#f26691" }}
                        formatter={(val) => [`FCFA${val}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        name="Gross Revenue"
                        dataKey="revenue"
                        stroke="#f26691"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevFin)"
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🟢 TAB 2: LIVE DISPATCH */}
        {activeTab === "dispatch" && (
          <motion.div
            key="dispatch"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-2.5 rounded text-blue-600 border border-blue-100">
                  <Truck size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    On The Road
                  </p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">
                    {liveOrders.length} Active
                  </p>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-sm flex items-center gap-4">
                <div className="bg-amber-50 p-2.5 rounded text-amber-600 border border-amber-100">
                  <AlertCircle size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                    Unassigned
                  </p>
                  <p className="text-xl font-bold text-slate-800 mt-0.5">
                    {liveOrders.filter((o) => !o.riderId).length} Waiting
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 text-white border border-slate-800 p-5 rounded-lg shadow-sm flex items-center gap-4">
                <div className="bg-slate-800 p-2.5 rounded border border-slate-700 text-emerald-400">
                  <MapPin size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Fleet Status
                  </p>
                  <p className="text-xl font-bold text-white mt-0.5">
                    Live Tracking Active
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Navigation size={16} className="text-blue-600" /> Dispatch
                  Board
                </h3>
              </div>

              {liveOrders.length === 0 ? (
                <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                  <CheckCircle
                    size={40}
                    className="mb-4 text-slate-300"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-semibold text-slate-700">
                    All Clear
                  </p>
                  <p className="text-xs mt-1">
                    No active orders on the road right now.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {liveOrders.map((order) => (
                    <div
                      key={order._id}
                      className="p-5 hover:bg-slate-50 transition-colors flex flex-col lg:flex-row gap-6 items-start lg:items-center"
                    >
                      <div className="w-full lg:w-1/4">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase border ${order.status === "Out for Delivery" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                          >
                            {order.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            #{order._id.slice(-6)}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {order.address?.firstName} {order.address?.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin size={12} /> {order.address?.city}
                        </p>
                      </div>

                      <div className="flex-1 w-full bg-white border border-slate-200 rounded p-4 flex items-center gap-4">
                        <div className="flex-1 text-center">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                            Pickup (Seller)
                          </p>
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {order.sellerId?.slice(-6) || "Hub"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center px-4 w-1/3">
                          <div className="w-full h-1 bg-slate-100 rounded-full mb-2 relative overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full rounded-full transition-all ${order.status === "Out for Delivery" ? "w-full bg-blue-500" : "w-1/2 bg-amber-400 animate-pulse"}`}
                            ></div>
                          </div>
                          {order.riderId ? (
                            <p className="text-[10px] font-semibold text-blue-700">
                              {order.riderId.name}
                            </p>
                          ) : (
                            <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              Pending Assignment
                            </span>
                          )}
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                            Dropoff (User)
                          </p>
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {order.address?.street}
                          </p>
                        </div>
                      </div>

                      <div className="w-full lg:w-1/4 flex gap-2">
                        <div className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                            <Key size={10} className="inline mr-1" />
                            Pickup OTP
                          </p>
                          <p className="font-mono font-bold text-sm text-slate-800">
                            {order.pickupOtp || "N/A"}
                          </p>
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded text-center">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                            <Key size={10} className="inline mr-1" />
                            Drop OTP
                          </p>
                          <p className="font-mono font-bold text-sm text-slate-800">
                            {order.otp || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 🟢 TAB 3: PRODUCT ANALYTICS */}
        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Order Status Pie Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center relative">
              <h3 className="text-sm font-semibold text-slate-800 w-full text-left mb-4 border-b border-slate-100 pb-3">
                Historical Order Status
              </h3>
              <div className="w-full h-[250px] relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#64748b",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                  <span className="block text-2xl font-bold text-slate-900">
                    {totalOrders}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1 block">
                    Total
                  </span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Package size={16} className="text-indigo-600" /> Top
                  Performing Products
                </h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                {statsData.topProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {statsData.topProducts.map((prod, idx) => (
                      <div
                        key={prod._id}
                        className="flex items-center gap-4 p-3 rounded border border-slate-100 hover:border-slate-300 transition-colors"
                      >
                        <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                            {prod.name}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                            {prod.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-slate-900">
                            {currency}
                            {prod.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-10 font-medium">
                    No product data available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Revenue Graph */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800">
                  Revenue Trend
                </h3>
              </div>
              <div className="p-6 w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={graphData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#4f46e5"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4f46e5"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(val) => `FCFA${val}`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "4px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                        fontSize: "12px",
                      }}
                      itemStyle={{ fontWeight: 600, color: "#4f46e5" }}
                    />
                    <Area
                      type="monotone"
                      name="Gross Revenue"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 PARTICULAR MESSAGE VIEWER MODAL */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-600" /> System
                  Message
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedMessage.title}
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                    Received:{" "}
                    {new Date(
                      selectedMessage.date || selectedMessage.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm text-sm"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
