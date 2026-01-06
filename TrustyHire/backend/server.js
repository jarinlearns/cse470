const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// 1. IMPORT CLERK
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node'); 

const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');

dotenv.config();
const app = express();

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. ADD MIDDLEWARE HERE (Before routes)
// This adds 'req.auth' to every request so you can get the User ID
app.use(ClerkExpressWithAuth()); 

// Database Connection
const connectDB = async () => {
    try {
        console.log("⏳ Attempting to connect to MongoDB...");
        // Add timeout options to fail faster if there is a problem
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout after 5 seconds instead of waiting forever
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Failed!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        // This will stop the server if DB fails, so you know immediately
        process.exit(1);
    }
};

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes); // This is the correct place for this

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});
