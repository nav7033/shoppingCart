
const isValid = function (value) {
    if (typeof value == 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
}

const validForEnum = function (value) {
    let enumValue = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    value = JSON.parse(value)
    for (let x of value) {
        if (enumValue.includes(x) == false) {
            return false
        }
    }
    return true;
}
const Enum = function (value) {
    let enumValue = ['pending','completed','cancelled']
    for (let x of value) {
        if (enumValue.includes(x) == false) {
            return false
        }
    }
    return true;
}
const isValidArray = function (object) {
    if (typeof (object) === "object") {
        object = object.filter(x => x.trim())
        if (object.length == 0) {
            return false;
        }
        else { return true; }
    }
}
module.exports.isValid = isValid
module.exports.validForEnum = validForEnum
module.exports.isValidArray = isValidArray
module.exports.Enum = Enum