const mongoose = require('mongoose')



const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:[true,'required full name'],
        trim:true
    },
    lname:{
        type:String,
        required:[true,'required last name'],
        trim:true
    },
    email:{
        type:String,
        required:[true,'required email'],
        lowercase:true,
        trim:true,
        unique:true,
        validate: {
            validator: function (email) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
            },
            message: 'Please fill a valid email address',
            isAsync: false
        }
    },
    profileImage:{
        type:String,
        required:[true,'required profile image'],
        trim:true

    },
    phone:{
        type:String,
        required:[true,'required phone number'],
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,'required password'],
        trim:true
    },
    address:{
        shipping:{
            street:{
                type:String,
                required:true,
                trim:true
            },
            city:{
                type:String,
                required:true,
                trim:true
            },
            pincode:{
                type:Number,
                required:true,
                trim:true
            }
        },
        billing:{
            street:{
                type:String,
                required:true,
                trim:true,
            },
            city:{
                type:String,
                required:true,
                trim:true
            },
            pincode:{
                type:Number,
                required:true,
                trim:true
            }
        }
    }
},{timestamps:true})

module.exports = mongoose.model('user',userSchema)