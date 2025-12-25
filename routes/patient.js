const express = require("express")
const { body, query } = require("express-validator")
const Patient = require("../models/Patient");
const { authenticate, requireRole } = require("../middleware/auth");
const { computeAgeFromDob } = require("../utils/date");
const validate = require("../middleware/validate")

const router = express.Router();

// Get the Profile of Doctor
router.get("/me", authenticate, requireRole("patient"), async (req, res, next) => {
    const patient = await Patient.findById(req.user._id).select("-password -googleId");
    res.ok(patient, "Profile Fetched.")
})

// update doctor profile
router.get("/onboarding/update", authenticate, requireRole("patient"),
    [
        body("name").optional().notEmpty(),
        body("phone").optional().isString(),
        body("dob").optional().isISO8601(),
        body("gender").optional().isIn(["male", "female", "other"]),
        body("bloodGroup").optional().isString(),

        body("emergencyContact").optional().isObject(),
        body("emergencyContact.name").optional().isString().notEmpty(),
        body("emergencyContact.phone").optional().isString().notEmpty(),
        body("emergencyContact.relationship").optional().isString().notEmpty(),

        body("medicalHistory").optional().isObject(),
        body("medicalHistory.allergies").optional().isString().notEmpty(),
        body("medicalHistory.currentMedications").optional().isString().notEmpty(),
        body("medicalHistory.chronicConditions").optional().isString().notEmpty(),

    ], validate,
    async (req, res, next) => {
        try {
            const updated = { ...req.body };

            if (updated.dob) {
                updated.age = computeAgeFromDob(updated.dob)
            }

            delete updated.password;
            updated.isVerified = true; // Mark profile verified on update
            const patient = await Patient.findByIdAndUpdate(req.user._id, updated, { new: true }).select("-password -googleId")

            res.ok(patient, "Profile Updated");

        } catch (error) {
            res.serverError("updated failed.")
        }

    }
)


module.exports = router;