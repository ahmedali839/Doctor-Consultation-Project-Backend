const jwt = require("jsonwebtoken")
const Doctor = require("../models/Doctor")
const Patient = require("../models/Patient")

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            const header = req.headers.authorization;
            const token = header.startsWith("Bearer") ? header.slice(7) : null;

            if (!token) return res.unAuthorized("Missing jwt Token")

            const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.auth = decode; 

            if (decode.type === "doctor") {
                req.user = await Doctor.findById(decode.id);
            } else if (decode.type === "patient") {
                req.user = await Patient.findById(decode.id);
            }

            if (!req.user) return res.unAuthorized("Invalid user");

            next();

        } catch (error) {
            return res.unAuthorized("Invalid or expired token")
        }
    },
    requireRole: role => (req, res, next) => {
        if (!req.auth || req.auth.type !== role) {
            return res.forbidden("Insufficient role permissions");
        }
        next();
    }
}

