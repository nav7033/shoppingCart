const cartModel = require('../models/cartModel')
const userModel = require("../models/userModel")
const objectId = require('mongoose').Types.ObjectId
const productModel = require('../models/productModel')
const { isValid } = require('../validator/valid')



//=======================create Cart=================================

const createCart = async function (req, res) {

    try {
        let userId = req.params.userId
        let { cartId, productId } = req.body
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "please enter some data" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let userData = await userModel.findOne({ _id: userId })
        if (!userData) { return res.status(404).send({ status: false, msg: "user data not found " }) }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId  required" })
        }
        if (!objectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }
        if (!isValid(cartId)) {
            let cartDataCheck = await cartModel.findOne({ userId: userId })
            if (cartDataCheck) { return res.status(400).send({ status: false, msg: "cartData already exist for this user please add to cart" }) }
        }
        let cartData = await cartModel.findOne({ _id: cartId })

        if (cartData) {

            if (cartData.userId != userId) {
                return res.status(403).send({ status: false, msg: "this cart userId and params user not same ,please check cartId" })
            }
            let updateData = {}
            console.log(cartData.items.length)

            for (let i = 0; i < cartData.items.length; i++) {
                if (cartData.items[i].productId == productId) {
                    cartData.items[i].quantity = cartData.items[i].quantity + 1;

                    updateData['items'] = cartData.items
                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) {
                        return res.status(404).send({ status: false, msg: "product not found" })
                    }
                    price = productPrice.price
                    updateData['totalPrice'] = cartData.totalPrice + price
                    updateData['totalItems'] = cartData.items.length

                    const cartUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, updateData, { new: true })
                    return res.status(201).send({ status: true, message: "Success", data: cartUpdate })

                }
                if (cartData.items[i].productId != productId && i == cartData.items.length - 1) {
                    let obj = { productId: productId, quantity: 1 }
                    let arr = cartData.items
                    arr.push(obj)

                    updateData['items'] = arr

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, message: ` product not found with this ${productId}` }) }
                    Price = productPrice.price
                    updateData['totalPrice'] = cartData.totalPrice + Price
                    updateData['totalItems'] = cartData.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, updateData, { new: true })
                    return res.status(201).send({ status: true, message: "Success", data: updatedCart })
                }

            }

        }
        else {
            let arr = []
            let newData = {}
            newData.userId = userId;
            let object = { productId: productId, quantity: 1 }
            arr.push(object)
            newData['items'] = arr
            const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
            if (!productPrice) { return res.status(404).send({ status: false, msg: `No product found with this ${productId}` }) }
            Price = productPrice.price;
            newData.totalPrice = Price;

            newData['totalItems'] = arr.length;

            const newCart = await cartModel.create(newData)

            return res.status(201).send({ status: true, message: "Success", data: newCart })

        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
//===================================updateCart=======================================================
const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const { cartId, productId, removeProduct } = req.body
        const key = Object.keys(req.body)
        if (key == 0) {
            return res.status(400).send({ status: false, msg: "please enter some data" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is required" })
        }
        if (!objectId.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" })
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (!objectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }
        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, msg: "removeProduct is required" })
        }
        let cartData = await cartModel.findOne({ _id: cartId })
        if (!cartData) { return res.status(404).send({ status: false, msg: "cartData not found !" }) }

        if (typeof removeProduct != 'number') {
            return res.status(400).send({ status: false, msg: "only number are allowed!" })
        }
        const productRes = await productModel.findOne({ _id: productId, isDeleted: false }).select({ _id: 0, price: 1 })
        if (!productRes) { return res.status(400).send({ status: false, msg: "product not found !" }) }

        if (removeProduct == 0) {

            let dataObj = {}
            let updatePrice = 0
            let updateItems = 0
            for (let i = 0; i < cartData.items.length; i++) {
                if (cartData.items[i].productId != productId && i == cartData.items.length - 1) {
                    return res.status(400).send({ status: false, msg: "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productPrice = productRes.price * cartData.items[i].quantity
                    updatePrice = cartData.totalPrice - productPrice
                    cartData.items.splice(i, 1)
                    updateItems = cartData.totalItems - 1
                    dataObj.items = cartData.items
                }

            }
            dataObj.totalPrice = updatePrice
            dataObj.totalItems = updateItems

            const removeRes = await cartModel.findOneAndUpdate({ userId: userId }, dataObj, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: removeRes })

        }
        if (removeProduct == 1) {
            let dataObj = {}
            for (let i = 0; i < cartData.items.length; i++) {

                if (cartData.items[i].productId == productId) {
                    let quantity = cartData.items[i].quantity - 1
                    if (quantity < 1) {
                        dataObj.totalItems = cartData.totalItems - 1
                        let productPrice = productRes.price * cartData.items[i].quantity
                        dataObj.totalPrice = cartData.totalPrice - productPrice
                        cartData.items.splice(i, 1)
                        const reduceData = await cartModel.findOneAndUpdate({ userId: userId }, dataObj, { new: true })
                        return res.status(200).send({ status: true, message: "Success", data: reduceData })

                    }
                    if (cartData.items[i].productId != productId && i == cartData.items.length - 1) {
                        return res.status(400).send({ status: false, msg: "product not found in the cart" })
                    }
                    else {
                        cartData.items[i].quantity = quantity
                        dataObj.items = cartData.items
                        dataObj.totalPrice = cartData.totalPrice - productRes.price
                        const reduceData = await cartModel.findOneAndUpdate({ userId: userId }, dataObj, { new: true })
                        return res.status(200).send({ status: true, message: "Success", data: reduceData })
                    }


                }

            }

        }

        else {
            return res.status(400).send({ status: false, msg: "removeProduct field should be allowed only 0 and 1 " })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//=============================fetchCartData===========================================================

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        const getData = await cartModel.findOne({ userId: userId }).select({ _id: 0 })
        if (!getData) {
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
        return res.status(200).send({ status: true, message: "Success", data: getData })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

//=============================================DeleteCart==========================================
const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        const cartData = await cartModel.findOne({ userId: userId })
        if (!cartData) {
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
        let cart = { totalItems: 0, totalPrice: 0, items: [] }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, cart, { new: true })
        return res.status(204).send({ status: true, message: "cart deleted successfully", data: deleteCart })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createCart = createCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart