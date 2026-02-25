import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signupUser = async (req, res) => {
    try {
        const { firstname, lastname, email, phoneNumber, password, is_planned } = req.body;

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            phoneNumber,
            password,
            is_planned
        });

        const preferredIdentifier = newUser.email || newUser.phoneNumber;

        return res.status(201).json({
            statusCode: 201,
            userID: newUser._id,
            identifier: preferredIdentifier
        });

    } catch (error) {
        // MongoDB duplicate key error code
        if (error.code === 11000) {
            // Specific field detection
            if (error.keyPattern?.email) {
                return res.status(409).json({
                    statusCode: 409,
                    message: "Email already registered"
                });
            }

            if (error.keyPattern?.phoneNumber) {
                return res.status(409).json({
                    statusCode: 409,
                    message: "Phone number already registered"
                });
            }
        }

        return res.status(500).json({
            statusCode: 500,
            message: "Database error"
        });
    }
};

// Version 1.0 Signup(working)
// export const signupUser = async (req, res) => {
//     try {
//         console.log("SignUp Step 1a: Incoming packet from Backend:",req.body);
//
//         const user = await User.create(req.body);
//         const identifier = user.email ? user.email : user.phoneNumber;
//
//         console.log("SignUp Step 1b: Outgoing packet to Backend:",{"ID":user._id},identifier);
//
//         return res.status(201).json({
//             userID: user._id,
//             identifier,
//             firstname: user.firstname,
//             lastname: user.lastname
//         });
//
//     } catch (err) {
//         return res.status(500).json({ status: "error" });
//     }
// };

export const login = async (req, res) => {
    try {
        const { email, phoneNumber, password } = req.body;

        // 1. Validate identifier
        if (!email && !phoneNumber) {
            return res.status(400).json({
                message: "Identifier required"
            });
        }

        // 2. Find user
        const user = await User.findOne(
            email ? { email } : { phoneNumber }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 3. Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // 4. Prefer email over phone
        const preferredIdentifier = user.email || user.phoneNumber;

        // 5. Success
        return res.status(200).json({
            userID: user._id,
            identifier: preferredIdentifier,
            firstname: user.firstname,
            lastname: user.lastname
        });

    } catch (err) {
        return res.status(500).json({
            message: "Login failed"
        });
    }
};