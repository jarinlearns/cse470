const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import Routes
const userRoutes = require('./routes/userRoutes'); // ADD THIS LINE

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Database Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('MongoDB Connection Failed', error);
        process.exit(1);
    }
};
connectDB();

app.get('/', (req, res) => {
    res.send('API is running for TrustyHire...');
});

// Use Routes
app.use('/api/users', userRoutes); // ADD THIS LINE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);