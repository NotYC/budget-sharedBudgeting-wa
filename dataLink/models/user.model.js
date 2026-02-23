import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstname: String,
        lastname: String,
        email: String,
        phoneNumber: String,
        password: String,
        is_planned: {
            type: Boolean,
            default: false
        },
        plan_id: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
