const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadToCloudinary = async (file, folderName) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: folderName,
    width: 600,
    height: 600,
    crop: 'limit'
  });
  return {src: result.secure_url, id: result.public_id};
};

module.exports = { cloudinary, uploadToCloudinary };