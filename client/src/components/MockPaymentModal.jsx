import React, { useState } from "react";
import { X, CreditCard, QrCode, ShieldCheck, ArrowRight } from "lucide-react";
import scannerImg from "../assets/scanner.jpeg";
import { assets } from "../assets/assets"; // 🟢 Added to get the logo for the truck

const MockPaymentModal = ({ amount, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("UPI"); // 'UPI' or 'CARD'
  const [step, setStep] = useState("INPUT"); // 'INPUT' | 'PROCESSING' | 'SUCCESS'

  const handlePay = () => {
    setStep("PROCESSING");

    // Simulate Gateway Delay (2.5 seconds)
    setTimeout(() => {
      setStep("SUCCESS");
      // 🟢 Increased wait time to 3.5s so the user can enjoy the truck animation!
      setTimeout(() => {
        const mockTxnId = "TXN_" + Math.floor(Math.random() * 1000000000);
        onSuccess({ transactionId: mockTxnId });
      }, 3500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-outfit">
      {/* Main Card */}
      <div className="bg-[#121212] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 bg-gray-800/50 p-2 rounded-full transition-all"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span className="font-bold text-gray-400 text-xs tracking-widest uppercase">
              Secure Gateway
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl text-gray-400 font-light">FCFA</span>
            <span className="text-4xl font-bold text-white tracking-tight">
              {amount}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1">Paying to Mandvi Cart</p>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[300px] flex flex-col justify-center">
          {step === "INPUT" && (
            <>
              {/* Tabs */}
              <div className="flex bg-black p-1 rounded-xl border border-gray-800 mb-6">
                <button
                  onClick={() => setActiveTab("UPI")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "UPI" ? "bg-gray-800 text-white" : "text-gray-500"}`}
                >
                  <QrCode size={16} /> UPI
                </button>
                <button
                  onClick={() => setActiveTab("CARD")}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "CARD" ? "bg-gray-800 text-white" : "text-gray-500"}`}
                >
                  <CreditCard size={16} /> Card
                </button>
              </div>

              {/* UPI Content */}
              {activeTab === "UPI" && (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border-4 border-emerald-500/20 relative overflow-hidden">
                    <img
                      src={scannerImg}
                      alt="QR"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                    {/* Laser Animation */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500/80 shadow-[0_0_15px_#ef4444] animate-scanLine opacity-80"></div>
                  </div>
                  <p className="text-gray-400 text-xs mt-4">
                    Scan using any UPI App
                  </p>
                </div>
              )}

              {/* Card Content */}
              {activeTab === "CARD" && (
                <div className="space-y-4 py-4">
                  <div className="p-5 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl text-white shadow-lg">
                    <p className="font-mono text-xl tracking-widest mb-4">
                      4242 4242 4242 4242
                    </p>
                    <div className="flex justify-between text-[10px] uppercase opacity-70">
                      <span>Card Holder</span>
                      <span>Expires</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                      <span>DEMO USER</span>
                      <span>12/28</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      disabled
                      value="123"
                      className="bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-center"
                    />
                    <input
                      disabled
                      value="12/28"
                      className="bg-gray-900 border border-gray-700 text-white p-3 rounded-lg text-center"
                    />
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePay}
                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>Pay Now</span> <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* Processing State */}
          {step === "PROCESSING" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-gray-800 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
              <h3 className="text-white font-bold text-lg">
                Processing Payment...
              </h3>
              <p className="text-gray-500 text-xs mt-2">
                Do not close this window
              </p>
            </div>
          )}

          {/* 🟢 SUCCESS STATE (Animated Truck) */}
          {step === "SUCCESS" && (
            <div className="flex flex-col items-center justify-center py-4 w-full">
              <div className="truck-loader-container mb-8">
                <div className="truckWrapper">
                  <div className="truckBody relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 198 93"
                      className="trucksvg w-full h-auto block"
                    >
                      {/* 🟢 Changed fill to #f26691 (Rose Pink) */}
                      <path
                        strokeWidth="3"
                        stroke="#6FD3C1"
                        fill="#f26691"
                        d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                      ></path>
                      <path
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#7D7C7C"
                        d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                      ></path>
                      <path
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#282828"
                        d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                      ></path>
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#FFFCAB"
                        rx="1"
                        height="7"
                        width="5"
                        y="63"
                        x="187"
                      ></rect>
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#282828"
                        rx="1"
                        height="11"
                        width="4"
                        y="81"
                        x="193"
                      ></rect>
                      <rect
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#DFDFDF"
                        rx="2.5"
                        height="90"
                        width="121"
                        y="1.5"
                        x="6.5"
                      ></rect>
                      <rect
                        strokeWidth="2"
                        stroke="#282828"
                        fill="#DFDFDF"
                        rx="2"
                        height="4"
                        width="6"
                        y="84"
                        x="1"
                      ></rect>
                    </svg>

                    {/* 🟢 Mandvi Cart Logo mapped onto the truck side */}
                    <div className="absolute top-[8%] left-[7%] w-[50%] h-[75%] flex items-center justify-center p-2 mix-blend-multiply opacity-80">
                      <img
                        src={assets.logo}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain filter grayscale-[50%]"
                      />
                    </div>
                  </div>

                  <div className="truckTires">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 30 30"
                      className="tiresvg"
                    >
                      <circle
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#282828"
                        r="13.5"
                        cy="15"
                        cx="15"
                      ></circle>
                      <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 30 30"
                      className="tiresvg"
                    >
                      <circle
                        strokeWidth="3"
                        stroke="#282828"
                        fill="#282828"
                        r="13.5"
                        cy="15"
                        cx="15"
                      ></circle>
                      <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                    </svg>
                  </div>
                  <div className="road"></div>

                  <svg
                    xmlSpace="preserve"
                    viewBox="0 0 453.459 453.459"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    xmlns="http://www.w3.org/2000/svg"
                    id="Capa_1"
                    version="1.1"
                    fill="#000000"
                    className="lampPost hidden sm:block"
                  >
                    <path
                      fill="#4b5563"
                      d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993 c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514 c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16 c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914 h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75 v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795 V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017 h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
                    ></path>
                  </svg>
                </div>
              </div>

              <h3 className="text-emerald-400 font-bold text-2xl mb-1">
                Payment Successful!
              </h3>
              <p className="text-gray-400 text-sm">
                Packing your order for dispatch...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0a0a0a] p-3 text-center border-t border-gray-800">
          <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
            <ShieldCheck size={10} /> 256-bit Encrypted Transaction
          </p>
        </div>

        {/* 🟢 CSS FOR ANIMATIONS & TRUCK */}
        <style>{`
            @keyframes scanLine {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
            .animate-scanLine { animation: scanLine 2s linear infinite; }

            /* Truck CSS Scoped to Container */
            .truck-loader-container { width: 100%; display: flex; align-items: center; justify-content: center; }
            .truckWrapper { width: 200px; height: 100px; display: flex; flex-direction: column; position: relative; align-items: center; justify-content: flex-end; overflow-x: hidden; }
            .truckBody { width: 130px; height: fit-content; margin-bottom: 6px; animation: motion 1s linear infinite; }
            
            @keyframes motion {
                0% { transform: translateY(0px); }
                50% { transform: translateY(3px); }
                100% { transform: translateY(0px); }
            }
            
            .truckTires { width: 130px; height: fit-content; display: flex; align-items: center; justify-content: space-between; padding: 0px 10px 0px 15px; position: absolute; bottom: 0; }
            .truckTires svg { width: 24px; }
            
            .road { width: 100%; height: 1.5px; background-color: #4b5563; position: relative; bottom: 0; align-self: flex-end; border-radius: 3px; }
            .road::before { content: ""; position: absolute; width: 20px; height: 100%; background-color: #4b5563; right: -50%; border-radius: 3px; animation: roadAnimation 1.4s linear infinite; border-left: 10px solid #1f2937; }
            .road::after { content: ""; position: absolute; width: 10px; height: 100%; background-color: #4b5563; right: -65%; border-radius: 3px; animation: roadAnimation 1.4s linear infinite; border-left: 4px solid #1f2937; }
            
            .lampPost { position: absolute; bottom: 0; right: -90%; height: 90px; animation: roadAnimation 1.4s linear infinite; }
            
            @keyframes roadAnimation {
                0% { transform: translateX(0px); }
                100% { transform: translateX(-350px); }
            }
        `}</style>
      </div>
    </div>
  );
};

export default MockPaymentModal;
