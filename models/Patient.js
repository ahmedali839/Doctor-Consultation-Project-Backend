const mongoose = require("mongoose")
const { computeAgeFromDob } = require("../utils/date")

const emergencyContactSchema = new mongoose.Schema({
    name: { type: String, required: false },
    phone: { type: String, required: false },
    relationship: { type: String, required: false },
}, { _id: false })


const medicalHistorySchema = new mongoose.Schema({
    alergies: { type: String, default: "" },
    currentMedications: { type: String, default: "" },
    chronicConditions: { type: String, default: "" },
}, { _id: false })


const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    profileImage: { type: String, default: "" },

    phone: { type: String },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

    emergencyContact: emergencyContactSchema,
    medicalHistory: medicalHistorySchema,

    isVerified: { type: Boolean, default: false },


}, { timestamps: true });

patientSchema.pre("save", function (next) {
    if (this.dob && this.isModified("dob")) {
        this.age = computeAgeFromDob(this.dob)
    }
    next();
})

module.exports = mongoose.model("Patient", patientSchema);