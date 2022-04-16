const jwt = require('jsonwebtoken')



const authentication = async function (req, res, next) {
    try {
        let bearerHead = req.headers["x-api-key"];

        if (!bearerHead) {
            return res.status(400).send({ status: false, msg: "token must be present" });
        }
        const bearer = bearerHead.split(' ')
        const bearerToken = bearer[1]
        const decodedToken = jwt.verify(bearerToken, "secret-key", { ignoreExpiration: true })
        if (!decodedToken) {
            return res.status(401).send({ status: false, msg: "token is invalid" });
        }
        let time = Math.floor(Date.now() / 1000)
        if (decodedToken.exp < time) {
            return res.status(401).send({ status: false, msg: "token is expired,please login again" });
        }
        next()

    }
    catch (err) {
        
        return res.status(500).send({ status: false, msg: err.message })
    }
}
const authorize = async function (req, res, next){
    try{
        let userId = req.params.userId
        const bearerHead = req.headers["x-api-key"];
        const bearer = bearerHead.split(' ')
        const bearerToken = bearer[1]
        const decodedToken = jwt.verify(bearerToken, "secret-key")
        let time = Math.floor(Date.now() / 1000)
        if (decodedToken.exp < time) {
            return res.status(401).send({ status: false, msg: "token is expired,please login again" });
        }
        let userValid = decodedToken.userId
        if (userValid != userId) {
            return res.status(403).send({ status: false, msg: "you are not authorized to make change" })
        }
        next()
     

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.authentication = authentication
module.exports.authorize = authorize