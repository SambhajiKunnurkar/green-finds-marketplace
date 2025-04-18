
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, rating, brand, minPrice, maxPrice } = req.query;
    
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
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true }).limit(4);
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEcoAlternatives = async (req, res) => {
  try {
    const ecoProducts = await Product.find({ 
      ecoRating: { $in: ['A', 'B'] } 
    }).limit(4);
    res.json(ecoProducts);
  } catch (error) {
    console.error('Error fetching eco alternatives:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
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
};

exports.getAlternatives = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
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
};
