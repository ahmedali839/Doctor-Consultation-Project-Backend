const { validationResult } = require("express-validator")

module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("inside validate")
        console.log("Body received by backend:", req.body); // If this says {} or undefined, that's the bug!
        return res.badRequest("Validation Error", errors.array())
    }
    next();
}
