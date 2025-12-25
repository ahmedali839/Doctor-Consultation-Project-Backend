const express = require("express")
const { body } = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const validate = require("../middleware/validate")
const Doctor = require("../models/Doctor")
const Patient = require("../models/Patient");
// const { Passport } = require("passport");
const passport = require("passport");

const router = express.Router();


const signToken = (id, type) => jwt.sign({ id, type }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" })



// Doctor Auth's:

// Signup Auth
router.post("/doctor/register", [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
], validate,
    async (req, res, next) => {
        try {
            const exists = await Doctor.findOne({ email: req.body.email });
            if (exists) return res.badRequest("Doctor Already Exists.")

            const hashed = await bcrypt.hash(req.body.password, 12);
            const doc = await Doctor.create({ ...req.body, password: hashed })

            const token = signToken(doc._id, "doctor")

            res.created({
                token, user: {
                    id: doc._id,
                    type: "doctor",
                }
            }, "Doctor registered Successfully.")

        } catch (error) {
            res.serverError("Rigesteration Failed", [error.message])
        }
    }
)

// Login Auth
router.post("/doctor/login", [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
],
    validate,
    async (req, res, next) => {
        try {
            const doc = await Doctor.findOne({ email: req.body.email });
            if (!doc || !doc.password) return res.unAuthorized("Invalid credentials.")

            const match = await bcrypt.compare(req.body.password, doc.password)
            if (!match) return res.unAuthorized("Invalid credentials.")

            const token = signToken(doc._id, "doctor")

            res.created({
                token, user: {
                    id: doc._id,
                    type: "doctor",
                }
            }, "Login Successfully.")

        } catch (error) {
            res.serverError("Login Failed", [error.message])
        }
    }
)

// // Patient Auth's:

// Signup Auth
router.post("/patient/register", [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
], validate,
    async (req, res, next) => {
        try {
            console.log(`Entered into tycatch.`)
            const exists = await Patient.findOne({ email: req.body.email });
            console.log(`Entered into tycatch.`)
            if (exists) return res.badRequest("Patient Already Exists.")
            console.log(`email checked.`)

            const hashed = await bcrypt.hash(req.body.password, 12);
            console.log(`bcrypt done.`)
            console.log(`body: `, req.body)
            console.log(`hashed: `, hashed)
            const patient = await new Patient({ ...req.body, password: hashed })
            console.log(`after patient model.`);
            await patient.save()

            const token = signToken(patient._id, "patient")
            console.log(`patient registeration completed.`)
            res.created({
                token, user: {
                    id: patient._id,
                    type: "patient",
                }
            }, "Patient registered Successfully.")

        } catch (error) {
            res.serverError("Rigesteration Failed error: ", error)
            res.serverError("Rigesteration Failed", [error.message])
        }
    }
)

// Login Auth
router.post("/patient/login", [
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
],
    validate,
    async (req, res, next) => {
        try {
            const patient = await Patient.findOne({ email: req.body.email });
            if (!patient || !patient.password) return res.unAuthorized("Invalid credentials.")

            const match = await bcrypt.compare(req.body.password, patient.password)
            if (!match) return res.unAuthorized("Invalid credentials.")

            const token = signToken(patient._id, "patient")

            res.created({
                token, user: {
                    id: patient._id,
                    type: "patient",
                }
            }, "Login Successfully.")

        } catch (error) {
            res.serverError("Login Failed", [error.message])
        }
    }
)

// Google Auth start from here

router.get("/google", (req, res, next) => {
    const userType = req.query.type || "patient";

    Passport.authenticate("google", {
        scope: ["profile", "email"],
        state: userType,
        prompt: "select_account"
    })(req, res, next)
})

router.get("/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/auth/failure"
    }),
    async (req, res) => {
        try {
            const { user, type } = req.user;
            const token = signToken(user._id, type);

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || "https:localhost:3000";

            const redirectUrl = `${frontendUrl}/auth/success?token=${token}&type=${type}&user=${encodeURIComponent(JSON.stringify({
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
            }))}`

            res.redirect(redirectUrl);
        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/auth/error/message=${encodeURIComponent(error.message)}`)
        }
    }
)



// Auth Failure
router.get("/failure", (req, res) => res.badRequest("Google Authentication failed."))


module.exports = router;