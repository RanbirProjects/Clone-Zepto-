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
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Register user
router.post('/register', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const { name, email, password, address, phone } = userReq.body;
        const existingUser = yield user_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const user = new user_model_1.User({ name, email, password, address, phone });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.status(201).json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Login user
router.post('/login', ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        const { email, password } = userReq.body;
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({ user, token });
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
// Get user profile
router.get('/profile', auth_middleware_1.auth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    try {
        res.json(userReq.user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})));
// Update user profile
router.patch('/profile', auth_middleware_1.auth, ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userReq = req;
    const updates = Object.keys(userReq.body);
    const allowedUpdates = ['name', 'email', 'password', 'address', 'phone'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }
    try {
        if (!userReq.user) {
            return res.status(401).json({ error: 'User not found' });
        }
        updates.forEach((update) => {
            userReq.user[update] = userReq.body[update];
        });
        yield userReq.user.save();
        res.json(userReq.user);
    }
    catch (error) {
        res.status(400).json({ error: 'Invalid data' });
    }
})));
exports.userRoutes = router;
