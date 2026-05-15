import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IndianRupee,
  Clock,
  CheckCircle,
  TrendingUp,
  Wallet,
  ArrowRight,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SellerDashboard = () => {
  const { currency, axios, user } = useAppContext();

  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBalance: 0,
    availableBalance: 0,
    totalOrders: 0,
  });

  const [graphData, setGraphData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]); // 🟢 NEW
  const [loadingPayout, setLoadingPayout] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch Orders and Payouts Concurrently!
        const [orderRes, payoutRes] = await Promise.all([
          axios.get("/api/order/seller"),
          axios.get("/api/payout/user"),
        ]);

        if (orderRes.data.success) {
          let earnings = 0;
          let clearing24h = 0;
          const orders = orderRes.data.orders;
          const chartMap = {};

          setRecentOrders(orders.slice(0, 10)); // Save the last 10 for the UI table

          orders.forEach((order) => {
            if (order.status === "Delivered") {
              // 🟢 SENIOR FIX: If sellerEarnings is missing, fallback to (Amount - 5% Platform Fee)
              const amount = order.sellerEarnings || order.amount * 0.95 || 0;
              earnings += amount;

              // 🕒 24 HOUR LOCK LOGIC
              const orderTime = new Date(order.date).getTime();
              const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

              if (orderTime > twentyFourHoursAgo) {
                clearing24h += amount;
              }

              // Graph Data Formatting
              const date = new Date(order.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              chartMap[date] = (chartMap[date] || 0) + amount;
            }
          });

          // 🟢 FRONTEND DERIVED BALANCE MATH
          let livePending = 0;
          let liveWithdrawn = 0;

          if (payoutRes.data.success) {
            payoutRes.data.payouts.forEach((p) => {
              if (p.status === "pending") livePending += p.amount;
              if (p.status === "paid") liveWithdrawn += p.amount;
            });
          }

          const actualAvailable =
            earnings - clearing24h - livePending - liveWithdrawn;

          setStats({
            totalEarnings: earnings,
            pendingBalance: clearing24h + livePending,
            availableBalance: actualAvailable > 0 ? actualAvailable : 0,
            totalOrders: orders.length,
          });

          const chartArray = Object.keys(chartMap).map((date) => ({
            date,
            amount: chartMap[date],
          }));
          setGraphData(chartArray);
        }

        if (payoutRes.data.success) {
          setPayoutsList(payoutRes.data.payouts.slice(0, 5)); // Show last 5 payouts
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [axios, user]);

  const requestWithdrawal = async () => {
    if (stats.availableBalance <= 0)
      return toast.error("No funds available to withdraw");

    setLoadingPayout(true);
    const loadToast = toast.loading("Processing request...");

    try {
      const { data } = await axios.post("/api/payout/request", {
        amount: stats.availableBalance,
      });
      if (data.success) {
        toast.success("Withdrawal Request Sent!", { id: loadToast });
        setStats((prev) => ({
          ...prev,
          availableBalance: 0,
          pendingBalance: prev.pendingBalance + prev.availableBalance,
        }));
        // Instantly inject the new request into the visible history table
        setPayoutsList((prev) => [
          {
            amount: stats.availableBalance,
            status: "pending",
            requestDate: new Date().toISOString(),
            _id: "temp-" + Date.now(),
          },
          ...prev,
        ]);
      } else {
        toast.error(data.message, { id: loadToast });
      }
    } catch (error) {
      toast.error("Request failed", { id: loadToast });
    } finally {
      setLoadingPayout(false);
    }
  };

  // 🟢 REPORT GENERATOR LOGIC
  const downloadReport = () => {
    if (recentOrders.length === 0) return toast.error("No data to download");

    const headers = ["Date", "Order ID", "Items", "Amount", "Status"];
    const rows = recentOrders.map((o) => [
      new Date(o.date).toLocaleDateString(),
      o._id,
      o.items.length,
      o.amount,
      o.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "seller_financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report downloaded successfully!");
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="flex flex-col gap-8 pb-10 font-outfit max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Financial Dashboard
        </h1>
        <p className="text-gray-500 font-medium mt-1">
          Real-time overview of your store's performance
        </p>
      </motion.div>

      {/* 💰 WALLET SECTION */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          variants={item}
          className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 relative z-10">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1">
              Lifetime Earnings
            </p>
            {isDataLoading ? (
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-1 tracking-tight">
                <IndianRupee
                  size={22}
                  strokeWidth={3}
                  className="text-gray-400"
                />{" "}
                {Math.round(stats.totalEarnings).toLocaleString()}
              </h3>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out"></div>
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 relative z-10">
            <Clock size={28} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <p className="text-orange-500/80 text-[11px] font-bold uppercase tracking-widest mb-1">
              Pending Funds
            </p>
            {isDataLoading ? (
              <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-1 tracking-tight">
                <IndianRupee
                  size={22}
                  strokeWidth={3}
                  className="text-gray-400"
                />{" "}
                {Math.round(stats.pendingBalance).toLocaleString()}
              </h3>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-gradient-to-br from-green-600 to-emerald-700 p-6 rounded-[2rem] shadow-lg shadow-green-200 flex flex-col justify-center relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-green-100 text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Wallet size={14} /> Available to Withdraw
              </p>
              {isDataLoading ? (
                <div className="h-10 w-28 bg-white/20 rounded animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-4xl font-black flex items-center gap-1 tracking-tighter">
                  <IndianRupee
                    size={26}
                    strokeWidth={3}
                    className="opacity-80"
                  />{" "}
                  {Math.round(stats.availableBalance).toLocaleString()}
                </h3>
              )}
            </div>
          </div>
          <button
            onClick={requestWithdrawal}
            disabled={
              stats.availableBalance <= 0 || loadingPayout || isDataLoading
            }
            className={`mt-6 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${stats.availableBalance > 0 && !loadingPayout ? "bg-white text-green-700 hover:bg-gray-50 active:scale-95 shadow-md" : "bg-white/20 text-white/50 cursor-not-allowed"}`}
          >
            {loadingPayout ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Wallet size={18} /> Withdraw Funds <ArrowRight size={16} />
              </>
            )}
          </button>
        </motion.div>
      </motion.div>

      {/* 📈 GRAPH SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-[450px] relative"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Revenue Analytics
          </h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Last 30 Days
          </span>
        </div>
        {isDataLoading ? (
          <div className="w-full h-64 bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-300" size={32} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={graphData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => `FCFA${value}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                  padding: "12px 16px",
                  fontWeight: "bold",
                }}
                itemStyle={{ color: "#1e293b" }}
                formatter={(value) => [`FCFA${value}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3B82F6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorEarn)"
                activeDot={{
                  r: 6,
                  fill: "#3B82F6",
                  stroke: "#fff",
                  strokeWidth: 3,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* 🟢 NEW: TRANSACTION LEDGER & REPORT GENERATOR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FileText size={20} className="text-indigo-500" /> Recent
            Transactions
          </h3>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Download size={16} /> Download Report
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-2xl">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
              {isDataLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Loading data...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {order._id.slice(-8)}
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold">
                      {order.items?.length || 1}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {currency}
                      {order.amount}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-orange-50 text-orange-600 border border-orange-200"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 🟢 NEW: WITHDRAWAL HISTORY TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Wallet size={20} className="text-emerald-500" /> Withdrawal History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-black tracking-wider">
              <tr>
                <th className="p-4 rounded-tl-2xl">Ref ID</th>
                <th className="p-4">Requested On</th>
                <th className="p-4">Amount</th>
                <th className="p-4 rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-700">
              {isDataLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">
                    Loading payouts...
                  </td>
                </tr>
              ) : payoutsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-400">
                    No previous withdrawals found.
                  </td>
                </tr>
              ) : (
                payoutsList.map((payout, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4 text-xs font-mono text-slate-500">
                      {payout._id.slice(-8)}
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(payout.requestDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {currency}
                      {payout.amount}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${payout.status === "paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : payout.status === "rejected" ? "bg-red-50 text-red-600 border border-red-200" : "bg-orange-50 text-orange-600 border border-orange-200"}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default SellerDashboard;
