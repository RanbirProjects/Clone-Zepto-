import express from 'express';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { auth, admin, AuthRequest } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';

const router = express.Router();

// Create order
router.post('/', auth, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const { items, shippingAddress, paymentMethod } = userReq.body;
    if (!userReq.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    // Calculate total amount and validate stock
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      totalAmount += product.price * item.quantity;
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }
    const order = new Order({
      user: userReq.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Get user orders
router.get('/my-orders', auth, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    if (!userReq.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const orders = await Order.find({ user: userReq.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Get single order
router.get('/:id', auth, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    if (!userReq.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    const order = await Order.findById(userReq.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Check if user is admin or order owner
    if (
      order.user.toString() !== userReq.user._id.toString() &&
      userReq.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Update order status (admin only)
router.patch('/:id/status', auth, admin, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const { status } = userReq.body;
    const order = await Order.findById(userReq.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Get all orders (admin only)
router.get('/', auth, admin, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

export const orderRoutes = router; 