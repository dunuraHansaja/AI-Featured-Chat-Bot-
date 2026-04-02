const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// In-memory storage for development (replace with MongoDB later)
let products = [
  { _id: '1', name: 'rice', price: 350, stock: 100, category: 'food' },
  { _id: '2', name: 'sugar', price: 250, stock: 50, category: 'food' },
  { _id: '3', name: 'soap', price: 150, stock: 30, category: 'household' },
  { _id: '4', name: 'car wash', price: 750, stock: 10, category: 'service' }
];

let orders = [];
let nextProductId = 5;
let nextOrderId = 1;

// Optional: Try MongoDB connection but don't fail if it's not available
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB not available, using in-memory storage'));

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
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product
app.post('/api/products', async (req, res) => {
  try {
    const product = {
      _id: nextProductId.toString(),
      ...req.body,
      createdAt: new Date()
    };
    products.push(product);
    nextProductId++;
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      _id: nextOrderId.toString(),
      ...req.body,
      createdAt: new Date()
    };
    orders.push(order);
    nextOrderId++;
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
console.log('Received audio file:', req.file);
    // Create form data for the AI service
    const FormData = require('form-data');
    const fs = require('fs');
    const form = new FormData();
    console.log('Received audio file:', req.file.path);

    form.append('audio', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
console.log('test');

    // Call Python AI service
    const response = await axios.post('http://localhost:8000/process-audio', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
console.log('AI Service Response:', response.data);
    const { text, items } = response.data;

    console.log('Extracted text:', text);
    console.log('Extracted items:', items);

    // Process the extracted items into an order
    const orderItems = [];
    let total = 0;

    for (const item of items) {
      console.log('Processing item:', item);
      const product = products.find(p => p.name.toLowerCase().includes(item.item.toLowerCase()));
      console.log('Found product:', product);
      if (product) {
        // Extract numeric value from quantity string (e.g., "2 kg" -> 2)
        const quantityMatch = item.quantity.match(/(\d+\.?\d*)/);
        const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
        const itemTotal = product.price * quantity;
        orderItems.push({
          product: product.name,
          quantity,
          price: itemTotal
        });
        total += itemTotal;
      }
    }

    const order = orderItems.length > 0 ? {
      _id: nextOrderId.toString(),
      items: orderItems,
      total,
      status: 'pending',
      createdAt: new Date()
    } : null;

    if (order) {
      orders.push(order);
      nextOrderId++;
    }

    res.json({
      message: orderItems.length > 0 ? 'Order processed successfully' : 'Voice processed but no matching products found',
      text,
      order
    });
  } catch (error) {
    console.error('Error processing voice:', error.message);
    console.error('Full error:', error);

    // Return a fallback response instead of failing
    res.json({
      message: 'Voice processing failed, but request recorded',
      text: 'Unable to process audio at this time',
      order: null,
      error: error.message
    });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderIndex = orders.findIndex(o => o._id === req.params.id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    orders[orderIndex] = { ...orders[orderIndex], ...req.body };
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});