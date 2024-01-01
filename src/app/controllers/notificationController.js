const {Notification} = require('../models/Notification')

const notificationController = {
    getAll: async (req, res) => {
        try {
          const { limit, isRead } = req.query;
    
          
          const query = {};
          if (isRead !== undefined) {
            query.isRead = isRead === 'true'; 
          }
    
          
          const notifications = await Notification.find(query)
            .limit(parseInt(limit) || 10) 
            .sort({ createdAt: -1 }); 
          res.status(200).json({ success: true, data: notifications });
        } catch (error) {
          console.error(error);
          res.status(500).json({ success: false, error: error.message });
        }
      },
    readNotification: async (req, res) => {
        try {
            const _id = req.params.id;
            const notification = await Notification.findById(_id);

            if (!notification) {
                return res.status(404).json({ error: "Thong bao không tồn tại" });
            }
            const isRead = true
            await Notification.findByIdAndUpdate(_id, { isRead });
            res.status(200).json({ success: true, data: notification });
          } catch (error) {
            res.status(500).json({ success: false, error: error.message });
          }
    },
    createNotification: async (userId, type , title, content ) => {
        try {
            const newNotification = new Notification({
                userId, type, title, content
            })
            await newNotification.save()
        } catch (error) {
            console.error(error)
        }
    }
   
}

module.exports = notificationController