import {asyncHandler} from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js"
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const verifyjwt = asyncHandler( async (req,res,next) => {

try {
  const token = req.cookies?.accesstoken || req.header("Authorization")?.replace("Bearer ", "").trim()

if(!token){
  throw new Apierror(401,"Unathorized request")
}


const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)


  const user = await User.findById(decodedToken?._id).select("-password -refreshTokens")

  if(!user)

  throw new Apierror(401,"Invalid access token ")

req.user = user
  next()
  
} catch (error) {
  throw new Apierror(401,error?.message || "Invalid access token")
}
  
} )


