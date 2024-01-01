const Users = require("../models/User")

const authAdmin = async (req, res, next) => {
    try {
        const user = await Users.findOne({_id: req.user.id})
        if(user.role!==9999) {
            return res.status(403).json({warning: "Từ chối truy cập"})
        }
        next()
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}


module.exports = authAdmin