import express from 'express';
import { Product } from '../models/product.model';
import { auth, admin, AuthRequest } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';

const router = express.Router();

// Get all products
router.get('/', (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const { category, search, sort } = userReq.query;
    let query: any = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    let sortOption = {};
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }
    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Get single product
router.get('/:id', (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const product = await Product.findById(userReq.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Create product (admin only)
router.post('/', auth, admin, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const product = new Product(userReq.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Update product (admin only)
router.patch('/:id', auth, admin, (async (req, res) => {
  const userReq = req as AuthRequest;
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
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }
  try {
    const product = await Product.findById(userReq.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    updates.forEach((update) => {
      (product as any)[update] = userReq.body[update];
    });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Delete product (admin only)
router.delete('/:id', auth, admin, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const product = await Product.findByIdAndDelete(userReq.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

export const productRoutes = router; 