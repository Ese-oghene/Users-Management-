import jwt from "jsonwebtoken"
import ENV from '../config.js'

// auth middlewares
export default async function Auth(req, res, next){
    try {
       // access through authorise headed to validate request
     const token =  req.headers.authorization.split(" ")[1] 

     // retrieve the user details to the logged in user
    const decodedToken = await jwt.verify(token, ENV.JWT_SECRET)
        req.user = decodedToken

        next()
    // res.json( decodedToken)
    } catch (error) {
      res.status(401).json({err: "Athentication fails"})  
    }
}

export function localVariables(req, res, next){
        req.app.locals = {
            OTP: null,
            resetSession: false
        }
        next()
}