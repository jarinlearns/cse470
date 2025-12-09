// trustyhire-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Required for frontend/backend communication
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Allows parsing of JSON request bodies
app.use(cors({ 
    origin: 'http://localhost:5173' // Replace with Vercel URL later
})); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));

// Basic route check
app.get('/', (req, res) => {
  res.send('TrustyHire Backend API is running!');
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));