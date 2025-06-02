"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const order_model_1 = require("../models/order.model");
const product_model_1 = require("../models/product.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Create order
router.post('/', auth_middleware_1.auth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const { items, shippingAddress, paymentMethod } = userReq.body;
        if (!userReq.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Calculate total amount and validate stock
        let totalAmount = 0;
        for (const item of items) {
            const product = yield product_model_1.Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
            totalAmount += product.price * item.quantity;
            // Update stock
            product.stock -= item.quantity;
            yield product.save();
        }
        const order = new order_model_1.Order({
            user: userReq.user._id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
        });
        yield order.save();
        res.status(201).json(order);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Get user orders
router.get('/my-orders', auth_middleware_1.auth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        if (!userReq.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const orders = yield order_model_1.Order.find({ user: userReq.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
// Get single order
router.get('/:id', auth_middleware_1.auth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        if (!userReq.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const order = yield order_model_1.Order.findById(userReq.params.id).populate('items.product');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Check if user is admin or order owner
        if (order.user.toString() !== userReq.user._id.toString() &&
            userReq.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
// Update order status (admin only)
router.patch('/:id/status', auth_middleware_1.auth, auth_middleware_1.admin, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const { status } = userReq.body;
        const order = yield order_model_1.Order.findById(userReq.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        order.status = status;
        yield order.save();
        res.json(order);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Get all orders (admin only)
router.get('/', auth_middleware_1.auth, auth_middleware_1.admin, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const orders = yield order_model_1.Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
exports.orderRoutes = router;
