import {asyncHandler} from "../utils/asynchandler.js"
import {Apierror} from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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
  

  const {username,email,fullname,password} = req.body
 if (
   [username,email,fullname,password].some((feild) => feild?.trim() === "")
 ) {
   throw new Apierror(400,"All feilds are required")
 }

const existedUser = User.findOne({
  $or: [{username},{email}]
  
})
  console.log(existedUser);
if (existedUser) {
  throw new Apierror(409,"Please check username or email allready existed")
}


const avatarLocalpath = req.file?.avatar[0]?.path;
const coverimgLocalpath = req.file?.coverimg[0]?.path;

  if (!avatarLocalpath) 
    throw new error(400,"Avatar file is required")


 const avatar = await uploadOnCloudinary(avatarLocalpath)

 const coverImg = await uploadOnCloudinary(coverimgLocalpath)

if (!avatar) 
throw new error(400,"Avatar file is required")


const user = User.create({
  fullname,
  username: username.toLowerCase(),
  email,
  password,
  avatar: avatar.url,
  coverimg: coverimg?.url || ""
  
})


const usercreated = await User.findById(user._id).select("-password -refreshTokens")

  if (!usercreated) 
    throw new error(500,"Something went wrong while registering the user")


return res.status(201).json(
  new ApiResponse(200,usercreated,"User registered Successfully")
)


  
  
} )

export {registerUser}