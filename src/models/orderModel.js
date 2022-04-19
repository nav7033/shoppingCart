const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId


const orderSchema = new mongoose.Schema({
    userId:{
        type:objectId,
        required:[true,"userId required"],
        refs:'user'
    },
    items:[{
        _id:false,
        productId:{
            type:objectId,
            refs:'product',
            required:[true,"productId requiredS"]
        },
        quantity:{
            type:Number,
            default:1
        }

    }],
    totalPrice:{
        type:Number,
        required:[true,"required totalPrice"]
    },
    totalItems:{
        type:Number,
        required:[true,"required totalItems"]
    },
    totalQuantity:{
        type:Number,
        required:[true,"required totalQuantity"]
    },
    cancellable:{
        type:Boolean,
        default:true
    },
    status:{
        type:String,
        default:'pending',
        enum:['pending','completed','cancelled']
    },
    deletedAt:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

module.exports = mongoose.model('order',orderSchema)