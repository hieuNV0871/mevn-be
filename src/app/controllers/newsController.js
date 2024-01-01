const News = require('../models/News')

const newsController = {
    createNews: async (req, res) => {
        try {
            const {title, author, content, publishedAt} = req.body
            const news = await News.findOne({title})
            if(news) return res.status(400).json({error: "Bài viết đã tồn tại"})
            const newNews = new News({
                title, author, content, publishedAt
            })
            await newNews.save()
            res.status(200).json({success: "Tạo bài viết thành công", data: newNews})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },
    updateNews: async (req, res) => {
        try {
            const { title, author, content, publishedAt } = req.body;
            const _id = req.params.id;
            // Lấy thông tin người dùng từ req.user (tùy thuộc vào cách bạn xác thực)
            // Kiểm tra xem người dùng hiện tại có phải là tác giả của news hay không
            const newsToUpdate = await News.findById(_id);

    
            if (!newsToUpdate) {
                return res.status(404).json({ error: "Bài viết không tồn tại" });
            }

            if (newsToUpdate.author !== author) {
                return res.status(403).json({ error: "Bạn không có quyền chỉnh sửa bài viết này" });
            }
            // Nếu là tác giả, thì tiến hành cập nhật
            await News.findByIdAndUpdate(_id, { title, content, publishedAt });
    
            res.status(200).json({ success: "Cập nhật bài viết thành công" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteOneNews: async (req, res) => {
        try {
            const _id = req.params.id
            await News.deleteOne({_id})
            res.status(200).json({success: "Xóa bài viết thành công"})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },
    getAllNews: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
            const totalNews = await News.countDocuments();
            const news = await News.find().skip(skip).limit(limit)
            res.status(200).json({success: "Lấy tất cả bài viết thành công", data: news, total: totalNews})
        } catch (error) {
            res.status(500).json({error: error.message})
        }
    },
    getAllNewsPublished: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100; // Default limit to 10 if not provided
            const page = parseInt(req.query.page) || 1; // Default page to 1 if not provided
            const skip = (page - 1) * limit;
        
            const currentTime = new Date();
            const news = await News.find({ publishedAt: { $lte: currentTime } })
                .skip(skip)
                .limit(limit);
            
            const totalPublishedNews = await News.countDocuments({ publishedAt: { $lte: currentTime } });
            const totalPages = Math.ceil(totalPublishedNews / limit);
        
            res.status(200).json({
                success: "Lấy tất cả bài biết đã xuất bản thành công",
                data: news,
                total: totalPages,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
}

module.exports = newsController