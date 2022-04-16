const userModel = require('../models/userModel')
const ObjectId = require('mongoose').Types.ObjectId
const { uploadFile } = require('../aws/awsS3')
const {isValid} = require('../validator/valid')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")






//===========================Register User=================================
const createUser = async function (req, res) {
    try {
        const { fname, lname, email, phone, password } = req.body
        const address = JSON.parse(req.body.address)
        console.log(req.body, address)


        if (!isValid(fname)) {
            return res.status(400).send({ status: false, msg: "required first name" })
        }
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, msg: "required last name" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "required email" })
        }
        if (!(/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(email.trim()))) {
            return res.status(400).send({ status: false, msg: "please enter valid email" })
        }
        let dupEmail = await userModel.findOne({ email: email })
        if (dupEmail) {
            return res.status(400).send({ status: false, msg: "email is already register" })
        }
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, msg: "required mobile number" })
        }
        if (!(/^[6-9]\d{9}$/.test(phone.trim()))) {
            return res.status(400).send({ status: false, msg: "this mobile number is invalid" })
        }
        let dupPhone = await userModel.findOne({ phone: phone })
        if (dupPhone) {
            return res.status(400).send({ status: false, msg: "mobile number is already register" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "required password" })
        }
        if (!(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "password should contain at least [1,.,a-zA]" })
        }
        let pass = Object.keys(password.trim())
        if (!pass.length >= 8 && pass.length <= 15) {
            return res.status(400).send({ status: false, msg: "password length should be 8 to 15" })
        }


        //===============address validation=======================
        //shipping
        if (!isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, msg: "shipping street required" })
        }
        if (!isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "shipping city required" })
        }
        if (!isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "shipping pinCode required" })
        }
        //billing
        if (!isValid(address.billing.street)) {
            return res.status(400).send({ status: false, msg: "billing street required" })
        }
        if (!isValid(address.billing.city)) {
            return res.status(400).send({ status: false, msg: "billing city required" })
        }
        if (!isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "billing pinCode required" })
        }
        // s3 and cloud storage
        let file = req.files
        let saltRound = 10
        const hash = await bcrypt.hash(password, saltRound)

        let uploadFileUrl = await uploadFile(file[0])
        let result = {
            fname,
            lname,
            email,
            profileImage: uploadFileUrl,
            phone,
            password: hash,
            address
        }

        let data = await userModel.create(result)
        return res.status(201).send({ status: true, msg: "Register successfully", data: data })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//===============================LogIn====================================================
const logIn = async function (req, res) {
    try {
        const { email, password } = req.body
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "please enter email and password" })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "required email" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, msg: "required password" })
        }
        const validEmail = await userModel.findOne({ email: email.trim()})
        if (!validEmail) {
            return res.status(400).send({ status: false, msg: "email is incorrect" })
        }
        let userId = validEmail._id
        let pass = validEmail.password
        const matchPassword = await bcrypt.compare(password, pass)
        if (!matchPassword) {
            return res.status(400).send({ status: false, msg: "enter valid password" })
        }
        let token = jwt.sign({ userId: userId.toString(), iat: Math.floor(Date.now() / 1000) + (60 * 30) }, "secret-key", { expiresIn: "30m" });
        res.setHeader("x-api-key", token);
        let result = { userId, token }
        return res.status(200).send({ status: true, data: result })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//=========================fetch user profile=================================================
const getUserProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "required userId" })
        }
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId id invalid" })
        }
        let findProfile = await userModel.findOne({ _id: userId })
        if (!findProfile) {
            return res.status(404).send({ status: false, msg: "user profile not found" })
        }
        let result = {
            address: findProfile.address,
            _id: findProfile._id,
            fname: findProfile.fname,
            lname: findProfile.lname,
            email: findProfile.email,
            profileImage: findProfile.profileImage,
            phone: findProfile.phone,
            password: findProfile.password,
            createdAt: findProfile.createdAt,
            updatedAt: findProfile.updatedAt
        }
        return res.status(200).send({ status: true, msg: "User profile", data: result })


    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
//===================================update user profile=================================
const updateUserProfile = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is required" })
        }
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is invalid" })
        }
        let { fname, lname, email, phone, password, address } = req.body
        const dataObject = {};
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "enter data to update" })
        }
        if (isValid(fname)) {
            dataObject['fname'] = fname.trim()
        }
        if (isValid(lname)) {
            dataObject['lname'] = lname.trim()
        }
        if (isValid(email)) {
            let findMail = await userModel.findOne({ email: email })
            if (findMail) {
                return res.status(400).send({ status: false, msg: "this email is already register" })
            }
            dataObject['email'] = email.trim()
        }
        if (isValid(phone)) {
            let findPhone = await userModel.findOne({ phone: phone })
            if (findPhone) {
                return res.status(400).send({ status: false, msg: "this mobile number is already register" })
            }
            dataObject['phone'] = phone.trim()
        }
        if (isValid(password)) {
            if (!password.length >= 8 && password.length <= 15) {
                return res.status(400).send({ status: false, msg: "password length should be 8 to 15" })
            }
            let saltRound = 10
            const hash = await bcrypt.hash(password, saltRound)
            dataObject['password'] = hash
        }
        let file = req.files
        if (file.length > 0) {
            let uploadFileUrl = await uploadFile(file[0])
            dataObject['profileImage'] = uploadFileUrl
        }

        if (address) {
            address = JSON.parse(address)
            if (isValid(address.shipping)) {
                if (isValid(address.shipping.street)) {

                    dataObject['address.shipping.street'] = address.shipping.street
                }
                if (isValid(address.shipping.city)) {

                    dataObject['address.shipping.city'] = address.shipping.city
                }
                if (isValid(address.shipping.pincode)) {
                    if (typeof address.shipping.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: 'please enter pinCode in digit' })
                    }
                    dataObject['address.shipping.pincode'] = address.shipping.pincode
                }
            }

            if (isValid(address.billing)) {
                if (isValid(address.billing.street)) {

                    dataObject['address.billing.street'] = address.billing.street
                }
                if (isValid(address.billing.city)) {

                    dataObject['address.billing.city'] = address.billing.city
                }
                if (isValid(address.billing.pincode)) {
                    if (typeof address.billing.pincode !== 'number') {
                        return res.status(400).send({ status: false, message: ' Please provide pincode in number' })
                    }
                    dataObject['address.billing.pincode'] = address.billing.pincode
                }
            }
        }
        const updateProfile = await userModel.findOneAndUpdate({ userId }, dataObject , { new: true })
        if (!updateProfile) {
            return res.status(404).send({ status: false, msg: "user profile not found" })
        }
        return res.status(200).send({ status: true, msg: "User Profile updated", data: updateProfile })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



module.exports.createUser = createUser
module.exports.logIn = logIn
module.exports.getUserProfile = getUserProfile
module.exports.updateUserProfile = updateUserProfile
