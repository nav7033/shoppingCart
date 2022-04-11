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
        if (req.params.userId) {
            if (decodedToken.userId != req.params.userId) {
                return res.status(400).send({ status: false, msg: "this userId is different from decoded UserId" })
            }
        }
        next()

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.authentication = authentication