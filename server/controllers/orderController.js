import orderModel from "../models/orderModel.js";
import userModel from "../models/User.js";
import SystemSetting from "../models/SystemSetting.js"; 
import Product from "../models/Product.js";

// 🔹 HELPER: Generate 4-Digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// 🔹 HELPER: Get Seller ID from items
const getMainSellerId = (items) => {
    if (items && items.length > 0) {
        const item = items[0];
        if (item.product && item.product.sellerId) return item.product.sellerId;
        if (item.sellerId) return item.sellerId;
    }
    return "admin"; 
};

// 🔹 HELPER: Convert Address Object to Lat/Lng
const geocodeAddress = async (addrObj) => {
    try {
        if (!addrObj || !addrObj.city) return null;
        
        // 🟢 FIX FOR CHECKOUT LATENCY: Skip geocoding if already provided!
        if (addrObj.lat && addrObj.lng) {
            return { lat: parseFloat(addrObj.lat), lng: parseFloat(addrObj.lng) };
        }

        const street = addrObj.street || addrObj.line1;
        const zip = addrObj.zipcode || addrObj.zip;
        const query = `${street}, ${addrObj.city}, ${addrObj.state}, ${zip}`;
        
        // Abort timeout for slow OSM
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch (error) {
        console.warn("Geocoding failed/timed out, using mock coordinates.");
    }
    return null;
};

// ==========================================
// 1. PLACE ORDER (AIRTIGHT FINANCIAL LEDGER)
// ==========================================
const placeOrderMain = async (req, res, paymentMethod, paymentStatus) => {
    try {
        const userId = req.userId;
        const { items, address, amount: frontendAmount } = req.body;

        if (!items || items.length === 0) {
            return res.json({ success: false, message: "Cart is empty" });
        }

        // 🟢 1. SERVER-SIDE PRICE CALCULATION (SECURITY FIX)
        let actualItemTotal = 0;
        
        for (const item of items) {
            const dbProduct = await Product.findById(item.product._id);
            if (!dbProduct) return res.json({ success: false, message: `Product ${item.product.name} no longer exists.` });

            let itemPrice = dbProduct.offerPrice || dbProduct.price;

            // Check if there's a specific size/variant selected
            if (item.size && dbProduct.variants && dbProduct.variants.length > 0) {
                const variant = dbProduct.variants.find(v => v.weight === item.size);
                if (variant) itemPrice = variant.offerPrice || variant.price;
            }

            actualItemTotal += (itemPrice * item.quantity);
        }

        // Fetch System Settings
        let settings = await SystemSetting.findOne();
        if(!settings) settings = { platformFeePercent: 5, deliveryFee: 40, freeDeliveryThreshold: 400 };

        // 🟢 2. FINANCIAL SPLIT LOGIC
        let deliveryCollected = 0;

        // Calculate Delivery Fee based on actualItemTotal
        if (actualItemTotal < settings.freeDeliveryThreshold) {
            deliveryCollected = settings.deliveryFee; // Apply flat delivery fee
        }

        const totalPaidByUser = actualItemTotal + deliveryCollected;

        // Optional: Cross-check frontend total with backend total
        if (frontendAmount && Math.abs(Number(frontendAmount) - totalPaidByUser) > 2) {
             return res.json({ success: false, message: "Cart prices have updated. Please refresh your cart." });
        }

        // Calculate cuts
        const platformGrossCommission = Math.round(actualItemTotal * (settings.platformFeePercent / 100));
        const sellerEarnings = actualItemTotal - platformGrossCommission;

        let riderEarnings = settings.deliveryFee; // Rider ALWAYS gets the base delivery fee
        let platformNetProfit = platformGrossCommission; 

        // 🟢 PREVENT NEGATIVE PROFIT BUG: 
        // If the customer got "Free Delivery", the Admin pays the rider out of their commission.
        // We use Math.max to ensure the platform profit doesn't drop below FCFA0 on tiny orders.
        if (deliveryCollected === 0) {
            platformNetProfit = Math.max(0, platformGrossCommission - riderEarnings);
        }

        const detectedSellerId = getMainSellerId(items);

        // Generate GPS Coordinates
        const seller = await userModel.findById(detectedSellerId);
        let pickupCoords = await geocodeAddress(seller?.address);
        let dropoffCoords = await geocodeAddress(address);

        if (!pickupCoords) pickupCoords = { lat: 21.2580, lng: 73.3060 }; 
        if (!dropoffCoords) dropoffCoords = { lat: 21.2556, lng: 73.3047 }; 

        // 🟢 3. FREEZE THE LEDGER
        const orderData = {
            userId,
            sellerId: detectedSellerId, 
            items,
            address,
            amount: totalPaidByUser,         // What customer pays
            paymentMethod,
            payment: paymentStatus,
            date: Date.now(),
            
            // FREEZING FINANCIALS FOREVER:
            platformFee: platformNetProfit,       // What Admin keeps
            deliveryFee: deliveryCollected,       // What customer paid for delivery
            riderEarnings: riderEarnings,         // What rider takes home
            sellerEarnings: sellerEarnings,       // What seller takes home
            adminCommission: platformGrossCommission, // Gross cut from seller
            
            status: 'Order Placed',
            pickupCoordinates: pickupCoords,    
            dropoffCoordinates: dropoffCoords,  
            pickupOtp: generateOTP(), 
            otp: generateOTP()        
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();
        
        await userModel.findByIdAndUpdate(userId, { cartItems: {} });

        return res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const placeOrder = async (req, res) => placeOrderMain(req, res, "COD", false);
const placeOrderMock = async (req, res) => placeOrderMain(req, res, "Online (Mock)", true);

// ==========================================
// 2. ORDER FETCHING & MANAGEMENT
// ==========================================
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({})
            .populate('riderId', 'name phone profileImage vehicleNumber')
            .sort({ date: -1 });
        res.json({ success: true, orders })
    } catch (error) { res.json({ success: false, message: error.message }) }
}

const userOrders = async (req, res) => {
    try {
        const userId = req.userId; 
        const orders = await orderModel.find({ userId })
            .populate('riderId', 'name phone profileImage vehicleNumber')
            .sort({ date: -1 });
        res.json({ success: true, orders })
    } catch (error) { res.json({ success: false, message: error.message }) }
}

const sellerOrders = async (req, res) => {
    try {
        const sellerId = req.userId; 
        const orders = await orderModel.find({ sellerId })
            .populate('riderId', 'name phone profileImage vehicleNumber')
            .sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const updateStatus = async (req, res) => {
    try {
        const { orderId, status, pickupOtp } = req.body;
        
        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        let updateData = { status };
        
        if (status === 'Out for Delivery') {
            if (order.pickupOtp !== pickupOtp?.toString()) {
                return res.json({ success: false, message: "Invalid Pickup OTP. Please ask the Seller." });
            }
            updateData.pickedUpAt = Date.now();
        }

        await orderModel.findByIdAndUpdate(orderId, updateData);
        res.json({ success: true, message: "Status Updated Successfully" })
    } catch (error) { res.json({ success: false, message: error.message }) }
}

// ==========================================
// 3. RIDER LOGISTICS & PAYOUT LOGIC
// ==========================================
const getAvailableJobs = async (req, res) => {
    try {
        const riderId = req.userId;
        const orders = await orderModel.find({ 
            status: 'Ready for Pickup', 
            riderId: null,
            droppedByRiders: { $ne: riderId } 
        }).sort({ date: 1 });
        
        res.json({ success: true, orders });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const acceptJob = async (req, res) => {
    try {
        const { orderId } = req.body;
        const riderId = req.userId; 
        const order = await orderModel.findById(orderId);
        
        if(!order) return res.json({ success: false, message: "Order not found" });
        if(order.riderId) return res.json({ success: false, message: "Job already taken" });
        
        await orderModel.findByIdAndUpdate(orderId, { 
            riderId, 
            status: 'Ready for Pickup',
            acceptedAt: Date.now() 
        });
        
        res.json({ success: true, message: "Job Accepted!" });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

// 🟢 THE ULTIMATE FIX: Safely pay partners exactly when delivery completes
const completeDelivery = async (req, res) => {
    try {
        const { orderId, otp } = req.body; 
        const order = await orderModel.findById(orderId);
        
        if (!order) return res.json({ success: false, message: "Order not found" });
        if (order.otp !== otp.toString()) return res.json({ success: false, message: "Incorrect Delivery OTP!" });

        // 1. Move the money into their actual wallets ONLY if not already delivered!
        // This prevents double-paying if a network glitch causes two requests.
        if (order.status !== 'Delivered') {
            
            // Pay the Seller
            if (order.sellerId && order.sellerEarnings > 0) {
                await userModel.findByIdAndUpdate(order.sellerId, {
                    $inc: { availableBalance: order.sellerEarnings }
                });
            }

            // Pay the Rider
            if (order.riderId && order.riderEarnings > 0) {
                await userModel.findByIdAndUpdate(order.riderId, {
                    $inc: { availableBalance: order.riderEarnings }
                });
            }
        }

        // 2. Mark as officially delivered
        order.status = 'Delivered';
        order.payment = true; // Marks COD as officially paid
        order.deliveredAt = Date.now();
        await order.save();

        res.json({ success: true, message: "Order Delivered & Partners Paid Successfully!" });
    } catch (error) { 
        res.json({ success: false, message: error.message }); 
    }
}

const getRiderOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ riderId: req.userId }).sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status: 'Cancelled' });
        res.json({ success: true, message: "Order Cancelled" });
    } catch (error) { res.json({ success: false, message: error.message }); }
}

const dropJob = async (req, res) => {
    try {
        const { orderId } = req.body;
        const riderId = req.userId;

        const order = await orderModel.findById(orderId);
        if (!order) return res.json({ success: false, message: "Order not found" });

        order.riderId = null;
        order.status = 'Ready for Pickup';
        order.acceptedAt = undefined;

        if (!order.droppedByRiders.includes(riderId)) {
            order.droppedByRiders.push(riderId);
        }

        await order.save();

        res.json({ success: true, message: "Job dropped and returned to pool." });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

const placeOrderStripe = async (req, res) => res.json({ success: false, message: "Disabled" });
const verifyOrder = async (req, res) => res.json({ success: false, message: "Disabled" });

export { 
    placeOrder, placeOrderMock, placeOrderStripe, verifyOrder, 
    allOrders, userOrders, sellerOrders, updateStatus, cancelOrder,
    getAvailableJobs, acceptJob, completeDelivery, getRiderOrders, dropJob    
}