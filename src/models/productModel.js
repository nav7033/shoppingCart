const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,"required title"],
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:[true,"required description"],
        trim:true
    },
    price:{
        type:Number,
        required:[true,"required price"],
        format:'currency',
        minimum:0,
        trim:true 
    },
    currencyId:{
        type:String,
        required:[true,"required currencyId"],
        trim:true,
    },
    currencyFormat:{
        type:String,
        required:[true,"required currencyFormat"],
        trim:true
    },
    isFreeShipping:{
        type:Boolean,
        default:false
    },
    productImage:{
        type:String,
        required:[true,"required productImage"]
    },
    style:String,
    availableSizes:{
        type:[String],
        trim:true
        //enum:["S", "XS","M","X", "L","XXL", "XL"]
    },
    installments:Number,
    deletedAt:Date,
    isDeleted:{
        type:Boolean,
        default:false
    }

},{timestamps:true})
module.exports = mongoose.model('product',productSchema)