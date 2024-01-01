const { cloudinary, uploadToCloudinary } = require('../../utils/cloudinary');


const uploadController = {
  uploadImages: async (req, res) => {
    try {
      const images = [];
      const files = req.files;
      // console.log(files);
      if(!files) return
      const folderName = req.body.folderName
      for (const file of files) {
        const image = await uploadToCloudinary(file, folderName);
        images.push(image);
      }
      res.status(200).json({success:"Tải ảnh lên cloud thành công", data: images });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  uploadImage: async (req, res) => {
    try {
      const file = req.file;
      const folderName = req.body.folderName
      const image = await uploadToCloudinary(file, folderName);
      res.status(200).json({success:"Tải ảnh lên cloud thành công", data: image });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = uploadController;