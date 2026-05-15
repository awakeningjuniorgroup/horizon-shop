import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  Bike,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Key,
  ShoppingBag,
  X,
  ChevronRight,
  Store,
  MapPin,
  AlertCircle,
  Receipt,
  Download,
  CreditCard,
  Banknote,
  Navigation,
  Radar,
} from "lucide-react";

import TrackingMap from "../components/TrackingMap";

// 🟢 NEW: Clean White/Green Tracking Card with Status Logic
const AnimatedTrackingCard = ({ order, onTrack }) => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  // Logic for steps
  const isPacking = order.status === "Packing";
  const isReady = order.status === "Ready for Pickup";
  const isOut = order.status === "Out for Delivery";

  // Progress bar width
  let progressWidth = "w-0";
  if (isReady) progressWidth = "w-1/2";
  if (isOut) progressWidth = "w-[85%]";

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-[2rem] p-6 max-w-md w-full shadow-[0_10px_40px_rgba(16,185,129,0.08)] group hover:-translate-y-1 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-emerald-800 font-black tracking-widest text-xs uppercase flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Mise à jour en temps réel
          </h4>
          <p className="text-slate-400 text-[10px] font-mono mt-1">
            {currentTime}
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
            {order.status}
          </span>
        </div>
      </div>

      {/* Stepper Visualization */}
      <div className="w-full bg-slate-50 rounded-[1.25rem] border border-slate-100 p-5 mb-6 relative">
        <div className="flex justify-between items-center relative z-10">
          {/* Node 1: Shop */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm z-10 bg-white
                                      ${isPacking || isReady || isOut ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-300"}`}
            >
              <Store size={18} />
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">
              {isPacking ? "At Shop" : "Packed"}
            </span>
          </div>

          {/* Progress Bar Background */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 rounded-full -z-0">
            {/* Progress Fill */}
            <div
              className={`h-full bg-emerald-500 rounded-full transition-all duration-1000 ${progressWidth}`}
            ></div>
          </div>

          {/* Node 2: Courier */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm z-10 bg-white relative
                                      ${isOut ? "border-emerald-500 text-emerald-600" : isReady ? "border-cyan-400 text-cyan-600 shadow-[0_0_15px_rgba(34,211,238,0.4)]" : "border-slate-200 text-slate-300"}`}
            >
              {isReady && (
                <div className="absolute inset-0 rounded-full animate-ping border border-cyan-400 opacity-50"></div>
              )}
              <Bike size={18} />
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">
              {isOut
                ? "At Delivery Boy"
                : isReady
                  ? "Not Out Yet"
                  : "Awaiting Boy"}
            </span>
          </div>

          {/* Node 3: Target */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm z-10">
              <MapPin size={18} className="text-slate-300" />
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase">
              Destination
            </span>
          </div>
        </div>
      </div>

      {/* Order Info */}
      <div>
        <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 border-l-2 border-emerald-500 pl-3">
          {isPacking &&
            "Vos articles sont en cours de tri et d'emballage chez horizon shopizon shopizon shopizon shop
          {isReady && "Votre commande est prête. Un livreur a été assigné!"}
          {isOut &&
            "un livreur est en route! L'heure d'arrivée est visible sur la carte en direct.."}
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={() => onTrack(order)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 text-sm relative z-20"
            >
              <Navigation size={18} /> Ouvrir le suivi en direct
            </button>
            <div className="bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-xl flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-0.5">
                OTP
              </span>
              <span className="text-emerald-700 font-black text-lg tracking-widest leading-none">
                {order.otp || "- -"}
              </span>
            </div>
          </div>
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("open-chat", {
                  detail: {
                    text: `Ma Commande #${order._id.slice(-8).toUpperCase()} est arrivée cassée, j'ai besoin d'un remboursement.`,
                  },
                }),
              )
            }
            className="text-xs text-slate-400 hover:text-red-500 font-medium text-center transition-colors mt-2"
          >
            Signaler un problème / Demander un remboursement
          </button>
        </div>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { currency, axios, user, navigate, setIsMapOpen, t } = useAppContext();

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleTrackLive = (order) => {
    setSelectedOrder(order);
    setIsMapOpen(true);
  };

  const closeMap = () => {
    setSelectedOrder(null);
    setIsMapOpen(false);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm(t.orderTracking.areYouSureCancel)) return;
    try {
      const { data } = await axios.post("/api/order/cancel", { orderId });
      if (data.success) {
        toast.success(data.message);
        fetchMyOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReportIssue = async (order) => {
    if (!window.confirm(t.orderTracking.reportIssue + "?")) return;

    const loadToast = toast.loading(t.support.openingSupportTicket);
    try {
      const autoMessage = ` j'ai un probleme avec la comande #${order._id.slice(-6).toUpperCase()}. The item is faulty/damaged and I would like to request a refund.`;
      const formData = new FormData();
      formData.append("text", autoMessage);

      const { data } = await axios.post("/api/chat/send", formData);

      if (data.success) {
        toast.success(t.support.supportTicketCreated, { id: loadToast });
        navigate("/contact");
      } else {
        toast.error(data.message, { id: loadToast });
      }
    } catch (error) {
      toast.error(t.support.failedConnectSupport, { id: loadToast });
    }
  };

  const handleDownloadBill = (order) => {
    const subtotal = order.items.reduce(
      (acc, item) =>
        acc + (item.price || item.product?.offerPrice || 0) * item.quantity,
      0,
    );
    const deliveryFee = order.amount - subtotal;
    const orderDate = new Date(order.date || Date.now()).toLocaleDateString(
      "fr-FR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );

    const printWindow = window.open("", "_blank");

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Order #${order._id.slice(-8).toUpperCase()}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
                
                body { 
                    font-family: 'Outfit', -apple-system, sans-serif; 
                    padding: 0; 
                    margin: 0; 
                    color: #1e293b; 
                    background-color: #f8fafc;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .invoice-container { 
                    max-width: 800px; 
                    margin: 40px auto; 
                    padding: 50px; 
                    background: #ffffff; 
                    border-radius: 8px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
                }
                
                /* Header / Logo */
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    border-bottom: 2px solid #f1f5f9; 
                    padding-bottom: 30px; 
                    margin-bottom: 40px; 
                }
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .brand-icon {
                    width: 54px;
                    height: 54px;
                    background-color: #ffffff;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(79,191,139,0.15);
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                }
                .brand-icon img { width: 100%; height: 100%; object-fit: contain; padding: 6px; }
                .brand-info h1 { 
                    margin: 0; 
                    font-size: 32px; 
                    font-weight: 800; 
                    color: #f26691; 
                    letter-spacing: -1px;
                }
                .brand-info p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;}
                
                .invoice-meta {text-align: right;}
                .invoice-meta h2 { margin: 0 0 8px 0; font-size: 36px; color: #0f172a; font-weight: 900; letter-spacing: -1.5px; text-transform: uppercase;}
                .invoice-meta p { margin: 4px 0; color: #475569; font-size: 15px; }
                .invoice-meta p strong { color: #1e293b; }
                .invoice-meta .status {
                    display: inline-block;
                    margin-top: 12px;
                    padding: 6px 16px;
                    border-radius: 30px;
                    font-size: 12px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .status.paid { background-color: #fdf2f7; color: #f26691; border: 1px solid #fbcfe8; }
                .status.pending { background-color: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }

                /* Addresses */
                .addresses { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 40px; 
                    gap: 40px;
                    background: #f8fafc;
                    padding: 24px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .address-block { flex: 1; }
                .address-block h3 { 
                    margin: 0 0 16px 0; 
                    font-size: 13px; 
                    color: #94a3b8; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5px; 
                    font-weight: 800;
                }
                .address-block p { 
                    margin: 6px 0; 
                    font-size: 15px; 
                    color: #475569;
                    line-height: 1.6;
                }
                .address-block strong { color: #0f172a; font-size: 18px; display: block; margin-bottom: 8px;}

                /* Table */
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { 
                    background: #f1f5f9; 
                    text-align: left; 
                    padding: 16px; 
                    font-size: 13px; 
                    color: #475569; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    font-weight: 800;
                }
                th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px;}
                th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px;}
                
                td { 
                    padding: 20px 16px; 
                    border-bottom: 1px solid #f1f5f9; 
                    font-size: 15px; 
                    color: #334155;
                    vertical-align: top;
                }
                .col-center { text-align: center; }
                .col-right { text-align: right; }
                .item-name { font-weight: 600; color: #0f172a; font-size: 16px;}
                .item-meta { font-size: 14px; color: #64748b; margin-top: 6px;}

                /* Totals */
                .totals-wrapper { display: flex; justify-content: flex-end; }
                .totals { width: 380px; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .totals-row { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding: 10px 0; 
                    font-size: 16px; 
                    color: #475569;
                    font-weight: 500;
                }
                .totals-row.border-top { border-top: 1px dashed #cbd5e1; margin-top: 10px; padding-top: 20px; }
                .totals-row.grand-total { 
                    font-size: 28px; 
                    font-weight: 900; 
                    color: #f26691; 
                    margin-top: 8px;
                    padding-top: 16px;
                }

                /* Footer */
                .footer { 
                    margin-top: 60px; 
                    text-align: center; 
                    color: #94a3b8; 
                    font-size: 14px; 
                    border-top: 2px dashed #f1f5f9; 
                    padding-top: 40px; 
                }
                .footer p { margin: 6px 0; }
                .footer .thanks { font-weight: 800; color: #f26691; font-size: 20px; margin-bottom: 16px; letter-spacing: -0.5px;}

                @media print {
                    body { background-color: #ffffff; }
                    .invoice-container { box-shadow: none; margin: 0; padding: 0; max-width: 100%; border: none; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <div class="brand">
                        <div class="brand-icon">
                            <img src="${window.location.origin}/favicon.png" alt="horizon shopizon shopizon shopizon shopizon shop Logo" />
                        </div>
                        <div class="brand-info">
                            <h1>horizon shop</h1>
                            <p>Multi-Vendor Grocery Store</p>
                        </div>
                    </div>
                    <div class="invoice-meta">
                        <h2>INVOICE</h2>
                        <p><strong>Order ID:</strong> #${order._id.toUpperCase()}</p>
                        <p><strong>Date:</strong> ${orderDate}</p>
                        <span class="status ${order.payment ? "paid" : "pending"}">
                            ${order.payment ? "Payment Completed" : "Payment Pending"}
                        </span>
                    </div>
                </div>
                
                <div class="addresses">
                    <div class="address-block">
                        <h3>Facture</h3>
                        <strong>${order.address?.firstName || "Customer"} ${order.address?.lastName || ""}</strong>
                        <p>${order.address?.street || "N/A"}</p>
                        <p>${order.address?.city || ""}, ${order.address?.state || ""} ${order.address?.zipcode || ""}</p>
                        <p>Phone: ${order.address?.phone || "N/A"}</p>
                    </div>
                    <div class="address-block" style="text-align: right;">
                        <h3> Detailsde pqye,ent</h3>
                        <strong>Method: ${(order.paymentMethod || "").toLowerCase() === "cod" ? "Cash on Delivery" : "Online Payment"}</strong>
                        <p>Status: ${order.payment ? "Paid in Full" : "Cash Required at Delivery"}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th class="col-center">Quantité</th>
                            <th class="col-right">Prix unitqire</th>
                            <th class="col-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items
                          .map((item) => {
                            const price =
                              item.price || item.product?.offerPrice || 0;
                            return `
                            <tr>
                                <td>
                                    <div class="item-name">${item.product?.name || "Item"}</div>
                                    <div class="item-meta">Size/Variant: ${item.size || "N/A"}</div>
                                </td>
                                <td class="col-center"><strong>${item.quantity}</strong></td>
                                <td class="col-right">${currency}${Number(price).toFixed(2)}</td>
                                <td class="col-right"><strong>${currency}${(Number(price) * item.quantity).toFixed(2)}</strong></td>
                            </tr>
                        `;
                          })
                          .join("")}
                    </tbody>
                </table>

                <div class="totals-wrapper">
                    <div class="totals">
                        <div class="totals-row">
                            <span>Sous Total</span>
                            <span>${currency}${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="totals-row border-top">
                            <span>Frais de livraison</span>
                            <span>${currency}${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div class="totals-row grand-total">
                            <span>Total Due</span>
                            <span>${currency}${order.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="thanks">Merci d'avoir fait vos achats chez Horizon buziness!</div>
                    <p>Si vous avez un probleme avec cette facture, contacter nous.</p>
                    <p>contact@kuakumarket.com | +237 694858557 </p>
                </div>
            </div>
            
            <script>
                // Auto-print immediately
                setTimeout(() => {
                    window.print();
                }, 800);
            </script>
        </body>
        </html>
        `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  const getStatusColor = (status) => {
    if (status === "Delivered")
      return "text-green-600 bg-green-50 border-green-100";
    if (status === "Cancelled") return "text-red-600 bg-red-50 border-red-100";
    if (status === "Out for Delivery")
      return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-orange-600 bg-orange-50 border-orange-100";
  };

  const getStatusIcon = (status) => {
    if (status === "Delivered") return <CheckCircle size={16} />;
    if (status === "Cancelled") return <XCircle size={16} />;
    if (status === "Out for Delivery") return <Bike size={16} />;
    return <Clock size={16} />;
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
      const interval = setInterval(fetchMyOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const groupedOrders = Object.values(
    myOrders.reduce((acc, order) => {
      const dateKey = order.date;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: order.date,
          totalAmount: 0,
          shipments: [],
        };
      }
      acc[dateKey].shipments.push(order);
      acc[dateKey].totalAmount += order.amount;
      return acc;
    }, {}),
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // 🟢 Extract Active Orders for the Hero Section
  const activeOrders = myOrders.filter((o) =>
    ["Packing", "Ready for Pickup", "Out for Delivery"].includes(o.status),
  );

  return (
    <>
      {/* Pure Tailwind styling used for Animated Card */}

      <div className="mt-20 pb-20 px-4 md:px-16 lg:px-32 bg-gray-50 min-h-screen font-outfit relative z-0">
        {/* MAP MODAL OVERLAY */}
        {selectedOrder && (
          <div className="fixed inset-0 z-[9999] bg-slate-950 w-full h-full flex flex-col animate-fade-in">
            <TrackingMap order={selectedOrder} onClose={closeMap} />
          </div>
        )}

        <div className="flex justify-between items-end mb-8 pt-8">
          <div>
            <h2 className="text-3xl font-black text-gray-800">Mes commandes</h2>
            <p className="text-gray-500 mt-1">
              Track, manage, and download invoices Suivre, gérer, et telécharger
              vos factures:
            </p>
          </div>
          <button
            onClick={fetchMyOrders}
            className="p-2 bg-white rounded-full shadow-sm hover:rotate-180 transition-transform duration-500 border border-gray-100"
          >
            <RefreshCw size={20} className="text-gray-600" />
          </button>
        </div>

        {/* 🟢 ACTIVE DELIVERIES SECTION */}
        {activeOrders.length > 0 && (
          <div className="mb-10 p-6 md:p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem] relative">
            <h3 className="text-emerald-800 font-black text-xl mb-6 text-center">
              Livraison active
            </h3>

            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              {activeOrders.map((order) => (
                <AnimatedTrackingCard
                  key={order._id}
                  order={order}
                  onTrack={handleTrackLive}
                />
              ))}
            </div>
          </div>
        )}

        {/* 🟢 ORDER HISTORY SECTION */}
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Aucune commande pour le moment
            </h3>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-8 py-3 bg-[#6FD3C1] text-white rounded-xl font-bold hover:bg-[#5ab8a6] transition-all flex items-center gap-2"
            >
              Commencer les achats <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <h3 className="text-xl font-bold text-gray-800 ml-2">
              Historique de commande
            </h3>
            {groupedOrders.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="bg-white rounded-[2.5rem] p-1 shadow-sm border border-gray-200"
              >
                <div className="px-8 py-5 flex justify-between items-center bg-gray-50/80 rounded-t-[2.5rem] border-b border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Commande placer
                    </p>
                    <p className="font-bold text-gray-800">
                      {new Date(group.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      TOTAL
                    </p>
                    <p className="text-2xl font-black text-gray-900">
                      {currency}
                      {group.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {group.shipments.map((order, i) => (
                    <div key={i} className="p-6 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                            <Store size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              SHIPMENT {i + 1}
                            </p>
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold mt-1 ${getStatusColor(order.status)}`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </div>
                        </div>
                        <p className="font-mono text-xs font-bold text-gray-400">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                      </div>

                      {/* Products List */}
                      <div className="space-y-4 mb-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center">
                              <img
                                src={item.product?.image?.[0]}
                                className="w-full h-full object-contain mix-blend-multiply"
                                alt=""
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm">
                                {item.product?.name || "Item"}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium">
                                Quantite: {item.quantity} • {item.size}
                              </p>
                            </div>
                            <p className="font-bold text-gray-800 text-sm">
                              {currency}
                              {item.price * item.quantity ||
                                item.product?.offerPrice * item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Order Summary Block */}
                      <div className="bg-gray-50 p-4 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border border-gray-100">
                        <div>
                          <p className="font-bold text-gray-800 mb-1">
                            Adresse de livraison:
                          </p>
                          <p className="text-gray-600">
                            {order.address?.firstName} {order.address?.lastName}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {order.address?.street}, {order.address?.city}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {order.address?.state} - {order.address?.zipcode}
                          </p>
                        </div>
                        <div className="md:text-right">
                          <p className="font-bold text-gray-800 mb-1">
                            Mode de payement :
                          </p>
                          <p className="text-gray-600 inline-flex items-center gap-1 md:justify-end w-full">
                            {(order.paymentMethod || "").toLowerCase() ===
                            "cod" ? (
                              <Banknote size={14} />
                            ) : (
                              <CreditCard size={14} />
                            )}
                            {(order.paymentMethod || "").toLowerCase() === "cod"
                              ? "Cash on Delivery"
                              : "Online Payment"}
                          </p>
                          <p className="text-xs mt-1 font-medium">
                            Status:{" "}
                            <span
                              className={
                                order.payment
                                  ? "text-green-600"
                                  : "text-orange-500"
                              }
                            >
                              {order.payment ? "Paid" : "Pending"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-dashed border-gray-200">
                        {/* OTP Display */}
                        {[
                          "Ready for Pickup",
                          "Out for Delivery",
                          "Packing",
                        ].includes(order.status) ? (
                          <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 w-full md:w-auto">
                            <Key size={16} className="text-yellow-700" />
                            <div>
                              <span className="text-[10px] font-bold text-yellow-700 uppercase mr-2">
                                OTP
                              </span>
                              <span className="text-lg font-black text-gray-900 tracking-widest">
                                {order.otp || "...."}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div></div>
                        )}

                        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                          {/* Live Track Button */}
                          {["Out for Delivery", "Ready for Pickup"].includes(
                            order.status,
                          ) && (
                            <button
                              onClick={() => handleTrackLive(order)}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-[#6FD3C1] text-white rounded-xl font-bold hover:bg-[#5ab8a6] transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 animate-pulse text-sm"
                            >
                              <MapPin size={16} /> Suivre en direct
                            </button>
                          )}

                          {/* Cancel Button */}
                          {![
                            "Out for Delivery",
                            "Delivered",
                            "Cancelled",
                          ].includes(order.status) && (
                            <button
                              onClick={() => cancelOrder(order._id)}
                              className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all text-sm"
                            >
                              Annuler
                            </button>
                          )}

                          {/* View Bill / Download Invoice */}
                          {order.status === "Delivered" && (
                            <>
                              <button
                                onClick={() => handleDownloadBill(order)}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                              >
                                <Download size={16} /> Telecharger la facture
                              </button>

                              <button
                                onClick={() => handleReportIssue(order)}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                              >
                                <AlertCircle size={16} /> Probleme
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyOrders;
