require('dotenv').config()

const authRouter = require('./auth')
const uploadRouter = require('./upload')
const categoryRouter = require('./category')
const collectionRouter = require('./collection')
const brandRouter = require('./brand')
const productRouter = require('./product')
const newsRouter = require('./news')
const userRouter = require('./user')
const ordersRouter = require('./orders')
const cartRouter = require('./cart')
const paymentRouter = require('./payment')
const statisticsRouter = require('./statistics')
const notificationRouter = require('./notification')

function route(app) {
    app.use('/v1/auth', authRouter)
    app.use('/v1/upload', uploadRouter)
    app.use('/v1/category', categoryRouter)
    app.use('/v1/collection', collectionRouter)
    app.use('/v1/brand', brandRouter)
    app.use('/v1/product', productRouter)
    app.use('/v1/orders', ordersRouter)
    app.use('/v1/news', newsRouter)
    app.use('/v1/user', userRouter)
    app.use('/v1/cart', cartRouter)
    app.use('/v1/payment', paymentRouter)
    app.use('/v1/statistics', statisticsRouter)
    app.use('/v1/notification', notificationRouter)


    app.use((req, res, next) => {
        res.status(404).json({error: 'Not found!'})
    })
    app.use((error, req, res, next) => {
        res.status(error.status || 500).json({error: error.message})
    })
}

module.exports = route