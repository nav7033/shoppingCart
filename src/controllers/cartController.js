const cartModel = require('../models/cartModel')
const userModel = require("../models/userModel")
const objectId = require('mongoose').Types.ObjectId
const productModel = require('../models/productModel')
const { isValid } = require('../validator/valid')
const { findOne } = require('../models/cartModel')


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
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (!objectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }
        let cartData = await cartModel.findOne({ userId: userId })
        if (cartData) { return res.status(400).send({ status: false, msg: "cartData already exist for this user please add to cart" }) }

        if (isValid(cartId)) {
            if (!objectId.isValid(cartId)) {
                return res.status(400).send({ status: false, msg: "cartId is invalid" })
            }
            let cartData = await cartModel.findOne({ _id: cartId })
            if (!cartData) { return res.status(404).send({ status: false, msg: "cart data not found " }) }
            if (cartData.userId != userId) {
                return res.status(403).send({ status: false, msg: "this cart userId and params user not same ,please check cartId" })
            }
            let cartUpdate = {}

            for (let i = 0; i < cartData.items.length; i++) {
                if (cartData.items[i].productId == productId) {
                    cartData.items[i].quantity == cartData.items[i].quantity + 1
                    cartUpdate["items"] = cartData.items
                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) {
                        return res.status(404).send({ status: false, msg: "product not found" })
                    }
                    price = productPrice.price
                    cartUpdate["totalPrice"] = cartData.totalPrice + price
                    cartUpdate["totalItems"] = cartData.items.length

                    const cartUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, cartUpdate, { new: true })
                    return res.status(200).send({ status: true, msg: "cart updated", data: cartUpdate })

                }
                if (cartData.items[i].productId != productId && i == cartData.items.length - 1) {
                    const obj = { productId: productId, quantity: 1 }
                    cartData.items = obj
                    cartUpdate['items'] = cartData.items

                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, message: ` product not found with this ${productId}` }) }
                    Price = productPrice.price
                    cartUpdate['totalPrice'] = cartData.totalPrice + Price
                    cartUpdate['totalItems'] = cartData.items.length;

                    const updatedCart = await cartModel.findOneAndUpdate({ _id: cartId }, cartUpdate, { new: true })
                    return res.status(200).send({ status: true, message: "Updated Cart", data: updatedCart })
                }
                else {
                    let newData = {}
                    let arr =[]
                    newData.userId = userId;
                    const object = { productId: productId, quantity: 1 }
                    arr.push(object)
                    newData.items =arr
                    const productPrice = await productModel.findOne({ _id: productId, isDeleted: false }).select({ price: 1, _id: 0 })
                    if (!productPrice) { return res.status(404).send({ status: false, msg: `No product found with this ${productId}` }) }
                    Price = productPrice.price;
                    newData.totalPrice = Price;

                    newData.totalItems = arr.length;

                    const newCart = await cartModel.create(newData)

                    return res.status(201).send({ status: true, message: "Cart details", data: newCart })


                }
            }

        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
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
        let cartData = await cartModel.findById(cartId)
        if (!cartData) { return res.status(404).send({ status: false, msg: "cartData not found !" }) }

        if (isValid(removeProduct)) {
            if (typeof removeProduct != 'number') {
                return res.status(400).send({ status: false, msg: "only number are allowed!" })
            }
        }
        if (removeProduct == 0) {
            let items = []
            let dataObj = {}
            let removePrice = 0
            for (let i = 0; i < cartData.length; i++) {
                if (cartData.items[i].productId != productId) {
                    return res.status(400).send({ status: false, msg: "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    removePrice = productRes.price * cartData.items[i].quantity
                }
                items.push(cartData.items[i])

            }
            productPrice = cartData.totalPrice - removePrice
            dataObj.totalPrice = productPrice
            dataObj.totalItems = items.length
            dataObj.items = items
            const removeRes = await cartModel.findOneAndUpdate({ productId: productId }, dataObj, { new: true })
            return res.status(200).send({ status: true, message: "remove success", data: removeRes })

        }
        if(removeProduct == 1) {
            let dataObj = {}
            let item =[]
            let productPrice = 0
            for (let i = 0; i < cartData.length; i++) {
                if (cartData.items[i].productId != productId) {
                    return res.status(400).send({ status: false, msg:  "product not found in the cart" })
                }
                if (cartData.items[i].productId == productId) {
                    const productRes = await productModel.findOne({ _id: productId, isDeleted: false })
                    if (!productRes) { return res.status(404).send({ status: false, msg: "product not found !" }) }
                    item.push({productId:productId,quantity:cartData.items[i].quantity - 1})
                    dataObj.totalPrice = cartData.totalPrice - productRes.price
                    dataObj.totalItems = item.length
                    dataObj.items = item
                    
                }
                const reduceData = await cartModel.findOneAndUpdate({productId:productId},dataObj,{new:true})
                return res.status(200).send({ status: true, message: "success", data:reduceData})

            }

        }
        else{
            return res.status(400).send({ status: false, msg: "removeProduct field should be allowed only 0 and 1 " }) 
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
const getCart = async function(req,res){
    try{
        const userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        const getData = await cartModel.findOne({userId:userId}).select({_id:0})
        if(!getData){
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
        return res.status(200).send({ status: true, message: "cart details", data:getData})


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
const deleteCart = async function (req,res){
    try{
        const userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        const cartData = await cartModel.findOne({userId:userId})
        if(!cartData){
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
        let cart = {totalItems:0,totalPrice:0,items:[]}
        const deleteCart =await cartModel.findOneAndUpdate({userId:userId},cart,{new:true})
        return res.status(204).send({ status: true, message: "cart deleted successfully", data:deleteCart})


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.createCart = createCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart