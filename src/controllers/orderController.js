const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const {isValid,Enum} = require('../validator/valid')
const objectId = require('mongoose').Types.ObjectId


const createOrder = async function (req,res){
    try{
        let userId = req.params.userId
        let data = req.body
        let {items}= data
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let totalQuantity = 0;
        for(let i = 0 ; i<items.length;i++){
            totalQuantity +=items[i].quantity
        }
        data.userId = userId
        data.totalQuantity = totalQuantity
        const orderRes = await orderModel.create(data)
        return res.status(201).send({ status:true, msg: "that is your order",data:orderRes })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

const updateOrder = async function(req,res){
    try{
        let userId = req.params.userId
        let data = req.body
        let{orderId,status}= data
        if (Object.keys(req.body)== 0 ) {
            return res.status(400).send({ status: false, msg: "Enter some data for update " })
        }
        if (!isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "required orderId" })
        }
        if (!objectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        if (!objectId.isValid(orderId)) {
            return res.status(400).send({ status: false, msg: "orderId is invalid" })
        }
        if (!isValid(status)) {
            return res.status(400).send({ status: false, msg: "required orderId" })
        }
        const userMatch = await userModel.findOne({_id:userId})
        if (!userMatch) {
            return res.status(404).send({ status: false, msg: "user not found" })
        }
        const orderUpdate = await orderModel.findOne({_id:orderId,isDeleted:false})
        if (!orderUpdate) {
            return res.status(404).send({ status: false, msg: "order not found" })
        }
        if (!orderUpdate.cancellable) {
            return res.status(400).send({ status: false, msg: "you are not able cancel this" })
        }
        if (!(status =='pending' || status == 'completed' || status == 'cancelled')) {
            return res.status(400).send({ status: false, msg: "status value should be 'pending','completed','cancelled' only allowed" })
        }
        
        const orderRes = await orderModel.findOneAndUpdate({_id:orderId},{status:status},{new:true})
        return res.status(200).send({ status:true, msg: "status update successfully",data:orderRes })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports.createOrder = createOrder
module.exports.updateOrder = updateOrder



