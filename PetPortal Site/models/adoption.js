const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AdoptionSchema = new mongoose.Schema({
    petId: { type: String, default: uuidv4, unique: true },
    
    // Owner Details
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

    // Pet Details
    petName: { type: String, required: true },
    petType: { 
        type: String, 
        required: true, 
        enum: ["dog", "cat"] 
    },
    age: { type: String, required: true },
    breed: { type: String, required: true },
    description: { type: String, required: true },
    photoUrls: { type: [String], default: [] },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Automatically update `updatedAt` on every document save
AdoptionSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance
AdoptionSchema.index({ petType: 1 });
AdoptionSchema.index({ breed: 1 });
AdoptionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Adoption", AdoptionSchema);
