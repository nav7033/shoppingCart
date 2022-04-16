const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId



const cartSchema = new mongoose.Schema({
    userId:{
        type:objectId,
        required:[true,'required userId'],
        ref:'user',
        unique:true
    },
    items:[{
        productId:{
            type:objectId,
            required:[true,"required productId"],
            ref:'product'
        },
        quantity:{
            type:Number,
            required:[true,'required quantity'],
            min:1
        }
    }],
    totalPrice:{
        type:Number,
        required:[true,'required totalPrice'],

    },
    totalItems:{
        type:Number,
        required:[true,'required totalItems']
    }

},{timestamps:true})

module.exports = mongoose.model('cart',cartSchema)