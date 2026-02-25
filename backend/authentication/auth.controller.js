import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function identifier_logic(identifier) {

    const onlyNumbersRegex = /^\d+$/;

    if (onlyNumbersRegex.test(identifier)) {
        return {phoneNumber: identifier, email: undefined, flag: 0};
    } else {
        return {phoneNumber: undefined, email: identifier, flag: 1};
    }
}

function cookie_wrapper(res, returnedFirstname, token, returnedLastname){

    res.cookie(process.env.AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.COOKIE_MAX_AGE)
    });

    res.cookie(process.env.FIRSTNAME_COOKIE_NAME, returnedFirstname,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.COOKIE_MAX_AGE)
    });
    res.cookie(process.env.LASTNAME_COOKIE_NAME, returnedLastname,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: Number(process.env.COOKIE_MAX_AGE)
    });
}

function jwtpacket_builder(userID,returnedIdentifier) {

    const checker = identifier_logic(returnedIdentifier);
    if (checker.flag === 1) {
        return {
            user: userID,
            identifier: returnedIdentifier,
            identifierType: "email"
        }
    }else{
        return {
            user: userID,
            identifier: returnedIdentifier,
            identifierType: "phoneNumber"
        }
    }
}

export const signup = async (req, res) => {
    try {
        const {firstname, lastname, identifier, pass} = req.body;

        //0. Get packet info:
        console.log('SignUp Step 0. Incoming Packet:', req.body);
        // 1. Determine identifier type

        // let email = null;
        // let phoneNumber = null;
        //
        // const onlyNumbersRegex = /^\d+$/;
        //
        // if (onlyNumbersRegex.test(identifier)) {
        //     phoneNumber = identifier;
        // } else {
        //     email = identifier;
        // }

        const {email, phoneNumber} = await identifier_logic(identifier);

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(
            pass,
            Number(process.env.BCRYPT_SALT_ROUNDS)
        );

        // 3. Prepare payload for dataLink
        const dataPayload = {
            firstname,
            lastname,
            email,
            phoneNumber,
            password: hashedPassword,
            is_planned: false
        };

        //3a Info of outgoing packet to dataLink

        console.log("SignUp Step 1. Outgoing packet to dataLink:", dataPayload);
        console.log("        Next refer dataLink console.")

        // 4. Send data to dataLink service
        const dataLinkResponse = await axios.post(
            `${process.env.DATALINK_BASE_URL}/user/signup`,
            dataPayload
        );

        console.log("SignUp Step 2. Packet incoming from dataLink:", dataLinkResponse.data);

        const {userID, identifier: returnedIdentifier,firstname: returnedFirstname, lastname: returnedLastname} =
            dataLinkResponse.data;

        // 5. Create JWT
        const token = jwt.sign(
            jwtpacket_builder(userID,returnedIdentifier),
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        );

        // 6. Set HTTP-only cookie
        // res.cookie(process.env.AUTH_COOKIE_NAME, token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        //     maxAge: Number(process.env.COOKIE_MAX_AGE)
        // });

        cookie_wrapper(res,returnedFirstname,token,returnedLastname);

        // 7. Send response to frontend
        return res.status(dataLinkResponse.status).json({
            status: "success"
        });
    } catch (err) {
        console.error("Axios Error:", err.response.data);

        return res.status(err.response.status || 500).json({
            status: "error",
            message:
                err.response.data.message ||  // backend message (best)
                "Signup failed"
        });
    }

    // catch (error) {
    //     return res.status(500).json({
    //         status: "error",
    //         message: "Signup failed"
    //     });
    // }



};

// -------------------------------------------------------------------------------------------------------------------

export const login = async (req, res) => {
    try {
        const {identifier, pass} = req.body;

        // 1. Determine identifier type
        // let email = null;
        // let phoneNumber = null;
        //
        // const onlyNumbersRegex = /^\d+$/;
        //
        // if (onlyNumbersRegex.test(identifier)) {
        //     phoneNumber = identifier;
        // } else {
        //     email = identifier;
        // }

        const {email, phoneNumber} = await identifier_logic(identifier);

        // 2. Hash incoming password (previous approach)
        // const hashedPassword = await bcrypt.hash(
        //     pass,
        //     Number(process.env.BCRYPT_SALT_ROUNDS)
        // );

        // 3. Prepare payload for dataLink
        const dataPayload = {
            email,
            phoneNumber,
            password: pass
        };

        // 4. Call dataLink login endpoint
        const dataLinkResponse = await axios.post(
            `${process.env.DATALINK_BASE_URL}/user/login`,
            dataPayload
        );

        const {userID, identifier: returnedIdentifier,firstname: returnedFirstname, lastname: returnedLastname} =
            dataLinkResponse.data;

        // 5. Create JWT
        const token = jwt.sign(
            jwtpacket_builder(userID,returnedIdentifier),
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY
            }
        );

        // 6. Set HTTP-only cookie
        // res.cookie(process.env.AUTH_COOKIE_NAME, token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        //     maxAge: Number(process.env.COOKIE_MAX_AGE)
        // });

        cookie_wrapper(res,returnedFirstname,token,returnedLastname);

        // 7. Respond to frontend
        return res.status(200).json({
            status: "success"
        });

    } catch (err) {
        // 8. Error handling based on dataLink response
        if (err.response) {
            const status = err.response.status;

            if (status === 404) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found"
                });
            }

            if (status === 401) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid password"
                });
            }
        }

        // 9. Fallback server error
        return res.status(500).json({
            status: "error",
            message: "Login failed"
        });
    }
};

//---------------------------------------------------------------------------------------------------------------------

export const logout = async (req,res) => {

    try{
        res.clearCookie(process.env.AUTH_COOKIE_NAME,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "strict"
        });

        return res.status(200).json({
            status: "success",
            message: "Logged out successfully!"
        })
    }catch(err){
        console.log("Error on logout hit:",err.response.data)

        return res.status(500).json({
            status: "error",
            message: "Internal Server Error"
        })
    }

}
