# ERP System with AI Voice Assistant

A modern ERP system built with React (Vite) frontend, Node.js/Express backend, and Python AI services for voice processing.

## Project Structure

```
/
├── client/          # React Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── VoiceAssistant.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/          # Node.js Express backend
│   ├── server.js
│   ├── package.json
│   └── uploads/     # For audio file uploads
├── ai/              # Python AI services
│   ├── ai_service.py
│   └── requirements.txt
└── README.md
```

## Features

### ERP Functions
- **Dashboard**: Overview of products, orders, and revenue
- **Products Management**: Add, view, and manage products
- **Orders Management**: View and update order status
- **Voice Assistant**: AI-powered voice order processing

### AI Features
- Speech-to-text using Whisper
- Text translation (to English)
- Item extraction from voice commands
- Automatic order creation from voice input

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (for data storage)

### Backend Setup (Node.js)
```bash
cd server
npm install
npm start
```

### AI Service Setup (Python)
```bash
cd ai
pip install -r requirements.txt
python ai_service.py
```

### Frontend Setup (React)
```bash
cd client
npm install
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Voice Processing
- `POST /api/process-voice` - Process audio file and create order

## AI Service Endpoints
- `POST /process-audio` - Process audio and extract order information

## Usage

1. Start all services (backend, AI, frontend)
2. Navigate to the Voice Assistant tab
3. Click "Start Recording" and speak your order (e.g., "I want 2 kg rice and 1 packet soap")
4. The system will transcribe, translate, extract items, and create an order automatically

## Technologies Used

- **Frontend**: React, Vite, Axios, Lucide React
- **Backend**: Node.js, Express, Multer, Mongoose
- **AI**: Python, FastAPI, Whisper, Google Translate
- **Database**: MongoDB