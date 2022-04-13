const productModel = require('../models/productModel')
const ObjectId = require('mongoose').Types.ObjectId
const { uploadFile } = require('../aws/awsS3')



const isValid = function (value) {
    if (typeof value == 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
}

const validForEnum = function (value) {
    let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    console.log(value)
    value = JSON.parse(value)
    console.log(value)
    for (let x of value) {
        if (enumValue.includes(x) == false) {
            return false
        }
    }
    return true;
}
//============== product Document=======================================

const createProduct = async function (req, res) {
    try {
        const productData = req.body
        if (!isValid(productData.title)) {
            return res.status(400).send({ status: false, msg: "required title" })
        }
        let findTitle = await productModel.findOne({ title: productData.title, isDeleted: false })
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "please enter unique title" })
        }
        if (!isValid(productData.price)) {
            return res.status(400).send({ status: false, msg: "required price" })
        }
        if (!isValid(productData.currencyId)) {
            return res.status(400).send({ status: false, msg: "required currencyId" })
        }
        if (!isValid(productData.currencyFormat)) {
            return res.status(400).send({ status: false, msg: "required currencyFormat" })
        }
        if (!validForEnum(productData.availableSizes)) {
            return res.status(400).send({ status: false, msg: "please enter valid availableSizes" })
        }

        productData.availableSizes = JSON.parse(productData.availableSizes)

        let file = req.files
        if (file.length == 0) {
            return res.status(400).send({ status: false, msg: "required productImage" })
        }
        let uploadFileUrl = await uploadFile(file[0])
        productData.productImage = uploadFileUrl

        const product = await productModel.create(productData)
        return res.status(201).send({ status: true, data: product })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
//==================================get products==========================================

const getProducts = async function (req, res) {
    try {
        let queryData = req.query
        if (Object.keys(queryData).length == 0) {
            let productData = await productModel.find({ isDeleted: false })
            if (!productData) {
                return res.status(404).send({ status: false, msg: "product not available" })
            }
            productData['data'] = productData
            return res.status(200).send({ status: true, msg: "success", data: productData })
        }
        if (Object.keys(queryParam).includes('availableSizes')) {
            let validCat = await bookModel.findOne({ availableSizes: queryData.availableSizes })
            if (!validCat) {
                return res.status(400).send({ status: false, msg: "thats size not available" })
            }
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}
const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid" })
        }
        const findProduct = await productModel.findOne({ _id: productId })
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }
        return res.status(200).send({ status: true, data: findProduct })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!isValid(productId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let updateData = req.body
        let objectData = {}
        if (Object.keys(updateData) == 0) {
            return res.status(400).send({ status: false, msg: "enter data to update" })
        }
        let findTitle = await userModel.findOne({ title: updateData.title })
        if (findTitle) {
            return res.status(400).send({ status: false, msg: "enter unique title" })
        }
        if (isValid(updateData.title)) {
            objectData.title = updateData.title
        }
        if (isValid(updateData.description)) {
            objectData.description = updateData.description
        }
        if (isValid(updateData.price)) {
            objectData.price = updateData.price
        }
        if (isValid(updateData.currencyId)) {
            objectData.currencyId = updateData.currencyId
        }
        if (isValid(updateData.currencyFormat)) {
            objectData.currencyFormat = updateData.currencyFormat
        }
        let file = req.files
        let uploadFileUrl = await uploadFile(file[0])
        if (isValid(uploadFileUrl)) {
            objectData.productImage = uploadFileUrl
        }
        if (!validForEnum(productData.availableSizes)) {
            return res.status(400).send({ status: false, msg: "please enter valid availableSizes" })
        }
        if (isValid(updateData.availableSizes)) {
            objectData.availableSizes = JSON.parse(updateData.availableSizes)
        }
        if (isValid(updateData.installments)) {
            objectData.installments = updateData.installments
        }
        const updateProduct = await productModel.findOneAndUpdate({ _id:productId },objectData, { new: true })
        if (!updateProduct) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }
        return res.status(200).send({ status: true, msg: "product data updated successfully", data:updateProduct })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
const deleteProduct = async function(req,res){
    try{
        let productId = req.params.productId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "invalid productId" })
        }
        let product = await productModel.findOne({ _id: productId })
        if (!product) {
            return res.status(404).send({ status: false, msg: "Document not found" })
        }
        if (product.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "This document already deleted" })
        }
        let data = { isDeleted: true, deletedAt: Date.now() }
        const deleteData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: data }, { new: true }).select({__v:0})
        return res.status(200).send({ status: true, msg: "delete data successfully", data:deleteData })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports.createProduct = createProduct
module.exports.getProducts = getProducts
module.exports.getProductsById = getProductsById
module.exports.updateProduct = updateProduct
module.exports.deleteProduct = deleteProduct