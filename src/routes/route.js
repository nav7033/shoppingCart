const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authentication } = require('../middleware/auth')

router.post('/register', userController.createUser)
router.post('/login', userController.logIn)

router.get('/user/:userId/profile', authentication, userController.getUserProfile)
router.put('/user/:userId/profile', authentication, userController.updateUserProfile)


module.exports = router
