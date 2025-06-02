"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const product_routes_1 = require("./routes/product.routes");
const user_routes_1 = require("./routes/user.routes");
const order_routes_1 = require("./routes/order.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/products', product_routes_1.productRoutes);
app.use('/api/users', user_routes_1.userRoutes);
app.use('/api/orders', order_routes_1.orderRoutes);
// MongoDB Connection
mongoose_1.default
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zepto-clone')
    .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
});
