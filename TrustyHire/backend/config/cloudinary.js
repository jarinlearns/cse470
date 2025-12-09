const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'trustyhire_resumes',
        format: async (req, file) => 'pdf', // Forces format to PDF
        public_id: (req, file) => file.originalname.split('.')[0] + '_' + Date.now(),
    },
});

module.exports = { cloudinary, storage };