const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const { authentication,authorize } = require('../middleware/auth')

router.post('/register', userController.createUser)
router.post('/login', userController.logIn)

router.get('/user/:userId/profile', authentication,authorize, userController.getUserProfile)
router.put('/user/:userId/profile', authentication,authorize, userController.updateUserProfile)

router.post("/products",productController.createProduct)
router.get("/products",productController.getProducts)
router.get('/products/:productId',productController.getProductsById)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId',productController.deleteProduct)

router.post('/users/:userId/cart',authentication,authorize,cartController.createCart)
router.put('/users/:userId/cart',authentication,authorize,cartController.updateCart)
router.get('/users/:userId/cart',authentication,authorize,cartController.getCart)
router.delete('/users/:userId/cart',authentication,authorize,cartController.deleteCart)

router.post('/users/:userId/orders',authentication,authorize,orderController.createOrder)
router.put('/users/:userId/orders',authentication,authorize,orderController.updateOrder)

module.exports = router
