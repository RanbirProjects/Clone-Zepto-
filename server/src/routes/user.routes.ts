import express from 'express';
import { User } from '../models/user.model';
import jwt from 'jsonwebtoken';
import { auth, AuthRequest } from '../middleware/auth.middleware';
import { RequestHandler } from 'express';

const router = express.Router();

// Register user
router.post('/register', (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const { name, email, password, address, phone } = userReq.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = new User({ name, email, password, address, phone });
    await user.save();
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Login user
router.post('/login', (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    const { email, password } = userReq.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

// Get user profile
router.get('/profile', auth, (async (req, res) => {
  const userReq = req as AuthRequest;
  try {
    res.json(userReq.user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}) as RequestHandler);

// Update user profile
router.patch('/profile', auth, (async (req, res) => {
  const userReq = req as AuthRequest;
  const updates = Object.keys(userReq.body);
  const allowedUpdates = ['name', 'email', 'password', 'address', 'phone'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }
  try {
    if (!userReq.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    updates.forEach((update) => {
      (userReq.user as any)[update] = userReq.body[update];
    });
    await userReq.user.save();
    res.json(userReq.user);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
}) as RequestHandler);

export const userRoutes = router; 