const orderModel = require('../models/orderModel')
const productModel = require('../models/productModel')
const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const { isValid } = require('../validator/valid')
const objectId = require('mongoose').Types.ObjectId

//=====================placedOrder===================================================
const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let { cartId, cancellable } = req.body
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "please enter some data" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "required cartId" })
        }
        if (!objectId.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" })
        }
        const findCart = await cartModel.findOne({ _id: cartId })
        if (!findCart) {
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
        if (findCart.userId != userId) {
            return res.status(400).send({ status: false, msg: "cart userId and params user not equal" })
        }
        let data = {}
        let totalQuantity = 0;
        for (let i = 0; i < findCart.items.length; i++) {
            totalQuantity += findCart.items[i].quantity
        }
        data.userId = userId
        data.items = findCart.items
        data.totalPrice = findCart.totalPrice
        data.totalItems = findCart.totalItems
        data.totalQuantity = totalQuantity
        if (cancellable != null) {
            data.cancellable = cancellable
        }
        const orderRes = await orderModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: orderRes })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//============================updateOrder==========================================================
const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = {}
        let { orderId, status, isDeleted } = req.body
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "Enter some data for update " })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        if (!isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "required orderId" })
        }
        if (!objectId.isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "orderId is invalid" })
        }
        if (!isValid(status)) {
            return res.status(400).send({ status: false, msg: "required status" })
        }
        const userMatch = await userModel.findOne({ _id: userId })
        if (!userMatch) {
            return res.status(404).send({ status: false, msg: "user not found" })
        }
        const orderUpdate = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!orderUpdate) {
            return res.status(404).send({ status: false, msg: "order not found" })
        }
        if (!(status == 'pending' || status == 'completed' || status == 'cancelled')) {
            return res.status(400).send({ status: false, msg: "status value should be 'pending','completed','cancelled' only allowed" })
        }
        data.status = status
        if (status == "cancelled" || status == "Cancelled") {

            if (orderMatch.cancellable != true) {

                return res.status(400).send({ status: false, message: "Cannot Cancel This Order, Because It's Not A Cancellable Order" })
            }

            if (isValid(isDeleted)) {
                data.isDeleted = isDeleted
                data.deletedAt = new Date()
            }
            const items = orderUpdate.items
            for (let i = 0; i < items.length; i++) {
                const updateProductDetails = await productModel.findOneAndUpdate({ _id: items[i].productId }, { $inc: { installments: items[i].quantity } })
            }
        }
        const orderRes = await orderModel.findOneAndUpdate({ _id: orderId }, data, { new: true })
        return res.status(200).send({ status: true, message: "Success", data: orderRes })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports.createOrder = createOrder
module.exports.updateOrder = updateOrder



