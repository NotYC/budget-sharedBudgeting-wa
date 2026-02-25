import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
            trim: true
        },
        lastname: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // allows null values without conflict
            lowercase: true,
            trim: true,
            default: undefined
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true, // critical since either email OR phone exists
            default: undefined
        },
        password: {
            type: String,
            required: true
        },
        is_planned: {
            type: Boolean,
            default: false
        },
        plan_id: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Explicit indexes (production clarity)
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", userSchema);

export default User;
