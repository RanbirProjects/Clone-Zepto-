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
exports.productRoutes = void 0;
const express_1 = __importDefault(require("express"));
const product_model_1 = require("../models/product.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Get all products
router.get('/', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const { category, search, sort } = userReq.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        let sortOption = {};
        if (sort === 'price-asc') {
            sortOption = { price: 1 };
        }
        else if (sort === 'price-desc') {
            sortOption = { price: -1 };
        }
        else if (sort === 'rating') {
            sortOption = { rating: -1 };
        }
        const products = yield product_model_1.Product.find(query).sort(sortOption);
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
// Get single product
router.get('/:id', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const product = yield product_model_1.Product.findById(userReq.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
// Create product (admin only)
router.post('/', auth_middleware_1.auth, auth_middleware_1.admin, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const product = new product_model_1.Product(userReq.body);
        yield product.save();
        res.status(201).json(product);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Update product (admin only)
router.patch('/:id', auth_middleware_1.auth, auth_middleware_1.admin, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    const updates = Object.keys(userReq.body);
    const allowedUpdates = [
        'name',
        'description',
        'price',
        'category',
        'image',
        'stock',
        'isAvailable',
    ];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }
    try {
        const product = yield product_model_1.Product.findById(userReq.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        updates.forEach((update) => {
            product[update] = userReq.body[update];
        });
        yield product.save();
        res.json(product);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Delete product (admin only)
router.delete('/:id', auth_middleware_1.auth, auth_middleware_1.admin, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const product = yield product_model_1.Product.findByIdAndDelete(userReq.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
exports.productRoutes = router;
