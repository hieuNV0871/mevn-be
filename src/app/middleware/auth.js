const jwt = require('jsonwebtoken')
const dotenv = require("dotenv")
dotenv.config()

const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(401).json({error: "Invalid Authentication."})

        jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
            if(error) return res.status(401).json({error: "Invalid Authentication."})
            req.user = user
            next()
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

module.exports = auth