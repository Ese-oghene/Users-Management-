import UserModel from '../model/User.model.js';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import ENV from "../config.js"
import otpGenerator from "otp-generator"


// middleware to verify user
export async function verifyUser(req, res, next){
    try {
        const { username } = req.method == "GET" ? req.query : req.body

        // check user existance
        let exist = await UserModel.findOne({ username });
        if(!exist) return res.status(404).send({Error : "can't find user!"})
        next()

    } catch (error) {
       return res.status(404).send({Error : "Authetication Error"}) 
    }
}



/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body;

        // Check for existing username
        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return res.status(400).send({ error: "Please use a unique username" });
        }

        // Check for existing email
        const existingEmail = await UserModel.findOne({ email });
        if (existingEmail) {
            return res.status(400).send({ error: "Please use a unique email" });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new UserModel({
                username,
                password: hashedPassword,
                profile: profile || '',
                email
            });

            const result = await user.save();
            return res.status(201).send({ msg: "User Registered Successfully" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}




/** POST: http://localhost:8080/api/login
 * @param : {
  "username" : "example123",
  "password" : "admin123"
  }*/
export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: "Username and password are required" });
        }

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send({ error: "Username not found" });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            return res.status(400).send({ error: "Password does not match" });
        }

        const token = jwt.sign(
            { UserId: user._id, username: user.username },
            ENV.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).send({
            msg: "Login Successful",
            username: user.username,
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}





/** GET: http://localhost:8080/api/login/user/example123 */
export async function getUser(req, res) {
   // const { username } = req.params;
   const { username } = req.query;

    try {
        if (!username) {
            return res.status(400).send({ error: "Invalid Username" });
        }

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send({ error: "Couldn't find the user" });
        }

        // remove password from user
        // mongoose return unnecessary data with object so convert it to json
        const { password, ...rest} = Object.assign({}, user.toJSON());

        return res.status(200).send(rest);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}



/** PUT: http://localhost:8080/api/update
 * @param : {
 * "id" : "<userid>", 
 * }
        body:{
            "firstName" : "",
            "lastName": "",
            "profile": ""
        }
*/
export async function updateUser(req, res) {
    try {
       // const id = req.query.id; // Access the 'id' from URL parameters
       const { UserId } = req.user;
        if (UserId) {
            const body = req.body;

            const updateResult = await UserModel.updateOne({ _id: UserId }, body);

            if (updateResult.nModified === 0) {
                return res.status(404).send({ error: "User not found" });
            }
            return res.status(201).send({ msg: "Record updated" });
        } else {
            return res.status(400).send({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal server error" });
    }
}



/** GET: http://localhost:8080/api/generateOTP */

export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    })
    res.status(201).send({ code: req.app.locals.OTP });
}


/** GET: http://localhost:8080/api/verifyOTP */
export async function verifyOTP(req, res){
    const { code } = req.query
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;     // reset the OTP value
        req.app.locals.resetSession = true   // start the session for reset password
        return res.status(201).send({ msg:'verify successfully' })
    }
    return res.status(400).send({error: "Invalid OTP"})
}


// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */
export async function createResetSession(req, res){
    if ( req.app.locals.resetSession) {
        req.app.locals.resetSession = false    // access to this route only once
        return res.status(201).send({msg:"access granted"})  
    }
    return res.status(404).send({error: "session expired"})
}


// updat the passowrd when we have a valid session
/** PUT: http://localhost:8000/api/resetPassword */

export async function resetPassword(req, res) {
    if (!req.app.locals.resetSession) {
        return res.status(440).send({ error: "Session expired!" });
    }

    try {
        const { username , password } = req.body;

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).send({ error: "Username not found" });
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            // Update the user's password
            const updateResult = await UserModel.updateOne(
                { username: user.username },
                { $set: { password: hashedPassword } }
            );

            if (updateResult){
                return res.status(200).send({
                    msg: "updated Successfull" });
            }
           
    
        } catch (error) {
            console.error("Error updating password:", error);
            return res.status(500).send({ error: "Unable to update password" });
        }
        

    } catch (error) {
        // Log the general error
        console.error(error);
        return res.status(500).send({ error: "An error occurred" });
    }
}



// if (updateResult.nModified > 0) {
//      Password updated successfully
//     return res.status(201).send({ msg: "Password updated" });
// } else {
//      No documents matched the query, or the password is the same (no updates)
//     return res.status(500).send({ error: "Unable to update password" });
// }