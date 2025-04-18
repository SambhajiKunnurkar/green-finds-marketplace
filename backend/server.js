
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecocart-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  ecoRating: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], required: true },
  featured: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Cart Model
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

// Order Model
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Middleware for auth
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecocart-secret-key');
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new Error();
    }
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Routes
// User Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'ecocart-secret-key',
      { expiresIn: '7d' }
    );
    
    // Return user data and token
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/verify', auth, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }
  });
});

app.get('/api/users/profile', auth, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    address: req.user.address
  });
});

app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Update user
    req.user.name = name;
    req.user.phone = phone;
    
    await req.user.save();
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/address', auth, async (req, res) => {
  try {
    const { street, city, state, zipCode, country } = req.body;
    
    // Update address
    req.user.address = {
      street,
      city,
      state,
      zipCode,
      country
    };
    
    await req.user.save();
    
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Address update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, rating, brand, minPrice, maxPrice } = req.query;
    
    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    
    if (rating) {
      const ratings = rating.split(',');
      filter.ecoRating = { $in: ratings };
    }
    
    if (brand) {
      const brands = brand.split(',');
      filter.brand = { $in: brands };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true }).limit(4);
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/eco-alternatives', async (req, res) => {
  try {
    const ecoProducts = await Product.find({ 
      ecoRating: { $in: ['A', 'B'] } 
    }).limit(4);
    res.json(ecoProducts);
  } catch (error) {
    console.error('Error fetching eco alternatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/products/alternatives/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find products in the same category with better eco ratings
    const alternatives = await Product.find({
      category: product.category,
      ecoRating: { $in: ['A', 'B'] },
      _id: { $ne: product._id }
    }).limit(6);
    
    res.json(alternatives);
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cart Routes
app.get('/api/cart', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = { items: [] };
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/cart/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }
    
    // Check if product already in cart
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Populate product data
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/cart/update/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(
      item => item.product.toString() === productId
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Populate product data
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/cart/remove/:productId', auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Populate product data
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/cart/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/cart', auth, async (req, res) => {
  try {
    const { items } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }
    
    cart.items = items;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Populate product data
    await cart.populate('items.product');
    
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Order Routes
app.get('/api/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    
    // Create new order
    const order = new Order({
      user: req.user._id,
      items,
      total,
      shippingAddress,
      status: 'Pending'
    });
    
    await order.save();
    
    // Clear cart after order is placed
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sample data seeding function
const seedDatabase = async () => {
  try {
    // Check if products already exist
    const productsCount = await Product.countDocuments();
    
    if (productsCount > 0) {
      console.log('Database already has products, skipping seed');
      return;
    }
    
    console.log('Seeding database with sample products...');
    
    // Sample products data
    const sampleProducts = [
      {
        name: 'Organic Cotton T-Shirt',
        brand: 'EcoWear',
        category: 'Clothing',
        description: 'Made from 100% organic cotton, this t-shirt is soft, sustainable, and ethically produced.',
        price: 35.00,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
        ecoRating: 'A',
        featured: true
      },
      {
        name: 'Bamboo Toothbrush Set',
        brand: 'GreenHome',
        category: 'Home',
        description: 'Biodegradable bamboo toothbrushes with plant-based bristles. Reduces plastic waste.',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1603316033975-ec7514ece812',
        ecoRating: 'A',
        featured: true
      },
      {
        name: 'Recycled Glass Water Bottle',
        brand: 'TerraCycle',
        category: 'Home',
        description: 'Made from 100% recycled glass with a silicone protective sleeve and stainless steel cap.',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1624797432677-6f803a8d3902',
        ecoRating: 'A',
        featured: false
      },
      {
        name: 'All-Natural Shower Gel',
        brand: 'NaturalBeauty',
        category: 'Beauty',
        description: 'Made with organic ingredients and essential oils. Free from synthetic chemicals.',
        price: 18.50,
        image: 'https://images.unsplash.com/photo-1618545535997-8c1e8252cfbb',
        ecoRating: 'B',
        featured: false
      },
      {
        name: 'Hemp Backpack',
        brand: 'EcoWear',
        category: 'Accessories',
        description: 'Durable backpack made from sustainable hemp with organic cotton lining.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa',
        ecoRating: 'A',
        featured: true
      },
      {
        name: 'Reusable Produce Bags - Set of 5',
        brand: 'GreenHome',
        category: 'Home',
        description: 'Mesh bags made from recycled materials. Perfect for grocery shopping.',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1610500796385-3ffc1ae2fccb',
        ecoRating: 'A',
        featured: false
      },
      {
        name: 'Organic Lip Balm',
        brand: 'NaturalBeauty',
        category: 'Beauty',
        description: 'Made with organic beeswax, coconut oil, and essential oils.',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227',
        ecoRating: 'B',
        featured: false
      },
      {
        name: 'Compostable Phone Case',
        brand: 'TerraCycle',
        category: 'Electronics',
        description: 'Made from plant-based materials that biodegrade when composted.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1606148556656-072fb8bade5c',
        ecoRating: 'A',
        featured: true
      },
      {
        name: 'Fast Fashion T-Shirt',
        brand: 'QuickTrends',
        category: 'Clothing',
        description: 'Trendy t-shirt made from conventional cotton.',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68',
        ecoRating: 'D',
        featured: false
      },
      {
        name: 'Plastic Water Bottle 6-Pack',
        brand: 'HydroQuick',
        category: 'Home',
        description: 'Convenient single-use plastic water bottles.',
        price: 7.99,
        image: 'https://images.unsplash.com/photo-1626197031507-9f7696e9edd1',
        ecoRating: 'F',
        featured: false
      },
      {
        name: 'Synthetic Shower Gel',
        brand: 'CleanQuick',
        category: 'Beauty',
        description: 'Shower gel with synthetic fragrances and colorings.',
        price: 4.99,
        image: 'https://images.unsplash.com/photo-1570333269894-2e0b8ec612da',
        ecoRating: 'D',
        featured: false
      },
      {
        name: 'Disposable Plastic Razors',
        brand: 'SharpShave',
        category: 'Beauty',
        description: 'Pack of 10 disposable plastic razors.',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1626017650498-ee47ab5ee0a2',
        ecoRating: 'F',
        featured: false
      }
    ];
    
    await Product.insertMany(sampleProducts);
    
    console.log('Database seeded with sample products');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedDatabase();
});
