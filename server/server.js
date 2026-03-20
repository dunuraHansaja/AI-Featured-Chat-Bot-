const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// MongoDB connection (assuming we'll use MongoDB for data storage)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Models
const Product = mongoose.model('Product', {
  name: String,
  price: Number,
  stock: Number,
  category: String
});

const Order = mongoose.model('Order', {
  items: [{ product: String, quantity: Number, price: Number }],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Voice processing endpoint
app.post('/api/process-voice', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Create form data for the AI service
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    
    form.append('audio', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Call Python AI service
    const response = await axios.post('http://localhost:8000/process-audio', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    const { text, items } = response.data;

    // Process the extracted items into an order
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findOne({ name: new RegExp(item.item, 'i') });
      if (product) {
        const quantity = parseFloat(item.quantity);
        const itemTotal = product.price * quantity;
        orderItems.push({
          product: product.name,
          quantity,
          price: itemTotal
        });
        total += itemTotal;
      }
    }

    const order = new Order({ items: orderItems, total });
    await order.save();

    res.json({
      message: 'Order processed successfully',
      text,
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process voice' });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});