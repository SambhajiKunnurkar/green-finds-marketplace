const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');

const seedDatabase = async () => {
  try {
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
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227',
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
    
    // Add a sample user for testing
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      });
      console.log('Sample user created');
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
