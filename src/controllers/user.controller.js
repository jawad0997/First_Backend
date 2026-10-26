import {asyncHandler} from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import jwt from "jsonwebtoken";

const generateAccesstokenAndgenerateRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accesstoken =  user.generateAccessToken()
    const refreshtoken = user.generateRefreshToken()

    user.refreshTokens = refreshtoken;
   // await user.save({validateBeforeSave: false})
await user.save({ validateBeforeSave: false });
    return {accesstoken,refreshtoken}

    
  } catch (error) {
    console.error("TOKEN GENERATION ERROR:", error);

    throw new Apierror(500,"There is Something went wrong while generating Access or refresh token ")
  }
}


//register 
const registerUser = asyncHandler( async (req,res) => {
/*.Take user data from frontend
  .Validate data -empty or not 
  .User already exit or not check by email/username
  .check image - check avatar 
  .uploded image on cloudnary
  .check image successfully uploded on cloudnary or not 
  .create user objecy in db 
  .hide passwrd and refresh token from response 
  .check user created successfully or not
  .send response
  
*/
  
//console.log("This is request body",req.body);
  const {username,email,fullname,password} = req.body
 if (
   [username,email,fullname,password].some((feild) => feild?.trim() === "")
 ) {
   throw new Apierror(400,"All feilds are required")
 }

const existedUser = await User.findOne({
  $or: [{username},{email}] 
})
  if(existedUser)
  {
  throw new Apierror(409,"Please check username or email already existed")

}


const avatarLocalpath = req.files?.avatar[0]?.path;
//const coverimgLocalpath = req.files?.coverimg[0]?.path;

  let coverimgLocalpath
  if (req.files && Array.isArray(req.files.coverimg && req.files.coverimg.length > 0 )) {
    coverimgLocalpath = req.files.coverimg[0].path
  }

  if (!avatarLocalpath) 
    throw new Apierror(400,"Avatar file is required")


 const avatar = await uploadOnCloudinary(avatarLocalpath)

 const coverImg = await uploadOnCloudinary(coverimgLocalpath)
console.log("CLOUDINARY AVATAR RESULT:", avatar);
if (!avatar) 
throw new Apierror(400,"Avatar file is required")


const user = await User.create({
  fullname,
  username: username.toLowerCase(),
  email,
  password,
  avatar: avatar.url,
  coverimg: coverImg?.url || ""
  
})


const usercreated = await User.findById(user._id).select("-password -refreshTokens")

  if (!usercreated) 
    throw new Apierror(500,"Something went wrong while registering the user")


return res.status(201).json(
  new ApiResponse(200,usercreated,"User registered Successfully")
)


  
  
} )

//login
const loginUser = asyncHandler( async (req,res) => {
  /*
  .Take data req.body 
  .username or email 
  .find the user
  .Check the password
  .Access and refresh token 
  .send cookie
  */

//  const {username, email, password} = req.body
const {username,email,password} = req.body
  
  if (!(username || email)){
    throw new Apierror(400,"Username or email is required")
  }
  
const user =  await User.findOne({
 $or: [{username}, {email}]
})

if(!user)
throw new Apierror(404,"User does not exit ")

const ispasswordValid = await user.isPasswordCorrect(password);

if (!ispasswordValid) {
  throw new Apierror(401,"Invalid user credential")
}


 const {accesstoken,refreshtoken} = await generateAccesstokenAndgenerateRefreshtoken(user._id)

  const LoggedInUser = await  User.findById(user._id)
    .select("-password -refreshTokens")


const option=  {
  httpOnly: true,
  secure: true
}

  return res.status(200).cookie("accesstoken",accesstoken,option).cookie("refreshtoken",refreshtoken,option).json(
    new ApiResponse(200,{
      LoggedInUser,accesstoken,refreshtoken
    },"User logged in successfully")
  )
  
})

//logout 
const logoutUser = asyncHandler( async (req, res) => {

await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshTokens: undefined
    }
  },
  {
    new: true
  }
)
const option=  {
  httpOnly: true,
  secure: true
}

return res
  .status(200)
  .clearCookie("accesstoken")
  .clearCookie("refreshtoken")
  .json( new ApiResponse(200,{},"User loggedout successfully"))

  
})

//Refreshing Access token 
const refreshAccessToken = asyncHandler( async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshTokens || req.body.refreshTokens

if (!incomingRefreshToken) {
  throw new Apierror(400,"Unauthorized request(")
}

try {
const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)


const user = await User.findById(decodedToken?._id)

if (!user) {
  throw new Apierror(401,"Invalid refresh token")
}

if (incomingRefreshToken !== user?.refreshTokens ) {
  throw new Apierror(401,"Resfresh Token is expried or used")
}

  const option=  {
  httpOnly: true,
  secure: true
}
  
const {accesstoken, newrefreshToken} = await generateAccesstokenAndgenerateRefreshtoken(user._id)

  return res
  .status(200)
  .cookies("accesstoken",accesstoken,option)
  .cookies("refreshTokens",newrefreshToken,option)
  .json(
    new ApiResponse(
      200,
      {accesstoken,refreshTokens:newrefreshToken},
      "Access token refreshed"
    )
  )
  
} catch (error) {
  throw new Apierror(401,error?.message || "Invalid refresh token " )
}

  
})



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
       }