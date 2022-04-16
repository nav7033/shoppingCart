const productModel = require('../models/productModel')
const ObjectId = require('mongoose').Types.ObjectId
const { uploadFile } = require('../aws/awsS3')
const { isValid, validForEnum, isValidArray } = require('../validator/valid')


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
        if (!/^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(productData.price)) {
            return res.status(400).send({ status: false, msg: "only digit allowed there" })
        }
        if (!isValid(productData.currencyId)) {
            return res.status(400).send({ status: false, msg: "required currencyId" })
        }
        if (productData.currencyId.trim() != 'INR' ) {
            return res.status(400).send({ status: false, msg: "please enter indian currency Id  INR" })
        }
        if (!isValid(productData.currencyFormat)) {
            return res.status(400).send({ status: false, msg: "required currencyFormat" })
        }
        if (productData.currencyFormat.trim() !=  '₹') {
            return res.status(400).send({ status: false, msg: "please enter indian currency symbol ₹ " })
        }
        if (!isValidArray(JSON.parse(productData.availableSizes))) {
            return res.status(400).send({ status: false, msg: "please enter availableSizes" })
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
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = queryData
        let filters = { isDeleted: false }
        if (isValid(size)) {
            if (!isValidArray(JSON.parse(size))) {
                return res.status(400).send({ status: false, msg: "please enter Sizes" })
            }
            if (!validForEnum(size)) {
                return res.status(400).send({ status: false, msg: "please enter valid Sizes" })
            }
            filters["availableSizes"] = size
        }
        let arr = []

        if (isValid(name)) {
            const checkSubstring = await productModel.find({ isDeleted: false }).select({ title: 1, _id: 0 })
            for (let i = 0; i < checkSubstring.length; i++) {
                let checkTitle = checkSubstring[i].title
                let check = checkTitle.includes(name)
                console.log(checkTitle)
                if (check) {
                    arr.push(checkSubstring[i].title)
                }

            }
            filters["title"] = arr

        }
        if (!(priceGreaterThan == null && priceLessThan != null)) {
            filters['price'] = { $gt: priceGreaterThan }
        }


        if (!(priceGreaterThan != null && priceLessThan == null)) {
            filters["price"] = { $lt: priceLessThan }


        }
        if (priceGreaterThan != null && priceLessThan != null) {
            filters["price"] = { $gt: priceGreaterThan, $lt: priceLessThan }

        }
        if (isValid(priceSort)) {
            if (priceSort == 1) {
                const products = await productModel.find(filters).sort({ price: 1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, msg: "No data found please try again" })
                }
                return res.status(200).send({ status: true, msg: "Results", count: products.length, data: products })
            }
            if (priceSort == -1) {
                const products = await productModel.find(filters).sort({ price: -1 })
                if (products.length == 0) {
                    return res.status(404).send({ status: false, msg: "No data found please try again" })
                }
                return res.status(200).send({ status: true, msg: "Results", count: products.length, data: products })
            }
        }

        const products = await productModel.find(filters)
        if (products.length == 0) {
            return res.status(404).send({ status: false, msg: "No such data found according to the filters" })
        }
        return res.status(200).send({ status: true, msg: "Results", count: products.length, data: products }) 

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
            return res.status(400).send({ status: false, msg: "productId is required" })
        }
        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" })
        }
        let updateData = req.body
        let objectData = {}
        if (Object.keys(updateData) == 0) {
            return res.status(400).send({ status: false, msg: "enter data to update" })
        }
        let findTitle = await productModel.findOne({ title: updateData.title })
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
        if (file.length > 0) {
            let uploadFileUrl = await uploadFile(file[0])
            objectData.productImage = uploadFileUrl
        }
        if (isValid(updateData.availableSizes)) {
            if (!isValidArray(JSON.parse(updateData.availableSizes))) {
                return res.status(400).send({ status: false, msg: "please enter availableSizes" })
            }
            if (!validForEnum(updateData.availableSizes)) {
                return res.status(400).send({ status: false, msg: "please enter valid availableSizes" })
            }
            objectData.availableSizes = JSON.parse(updateData.availableSizes)
        }

        if (isValid(updateData.installments)) {
            objectData.installments = updateData.installments
        }
        const updateProduct = await productModel.findOneAndUpdate({ _id: productId }, objectData, { new: true })
        if (!updateProduct) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }
        return res.status(200).send({ status: true, msg: "product data updated successfully", data: updateProduct })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
const deleteProduct = async function (req, res) {
    try {
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
        const deleteData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: data }, { new: true }).select({ __v: 0 })
        return res.status(200).send({ status: true, msg: "delete data successfully", data: deleteData })

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