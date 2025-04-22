const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const MissingPetSchema = new mongoose.Schema({
    reportId: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },

    phone: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                return /^[0-9]{10,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },

    petType: { 
        type: String, 
        required: true, 
        enum: ["dog", "cat"] // Ensuring only valid pet types are accepted
    },
    breed: { type: String, required: true },
    specialMark: { type: String, default: "" },
    lastSeen: { type: Date, required: true },
    location: { type: String, required: true },
    photoUrls: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Automatically update `updatedAt` on every document save
MissingPetSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance
MissingPetSchema.index({ lastSeen: -1 });
MissingPetSchema.index({ petType: 1 });
MissingPetSchema.index({ location: 1 });

module.exports = mongoose.model("MissingPet", MissingPetSchema);
