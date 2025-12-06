const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose'); // Import Mongoose

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully ✅');
    } catch (error) {
        console.error('MongoDB Connection Failed ❌', error);
        process.exit(1);
    }
};
connectDB(); // Call the function
// ---------------------------

app.get('/', (req, res) => {
    res.send('API is running for TrustyHire...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});