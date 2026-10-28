import {asyncHandler} from "../utils/asynchandler.js"
import mongoose from "mongoose"
import {Apierror} from "../utils/Apierror.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary,deletecloudinary} from "../utils/cloudnary.js"
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
  coverimg: coverImg?.url || "",
  avatarPublicId: avatar.public_id,
  coverimgPublicId: coverImg?.public_id || ""
  
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
    $unset: {
      refreshTokens: 1
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
  const incomingRefreshToken = req.cookies.refreshTokens || req.body?.refreshTokens

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
  .cookie("accesstoken",accesstoken,option)
  .cookie("refreshTokens",newrefreshToken,option)
  .json(
    new ApiResponse(
      200,
      {accesstoken,refreshTokens:newrefreshToken},
      "Access token refreshed"
    )
  )
  
} catch (error) {
  throw new Apierror(401,error?.message || "Invalid refresh token ")
}

  
})

//Change password

const changePassword = asyncHandler( async (req,res) => {
const { oldPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user?._id)

const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new Apierror(400,"Incorrect Old password")
  }

  user.password = newPassword
await   user.save({validateBeforeSave:false})

return res
  .status(200)
  .json( new ApiResponse(200,{},"Password changed successfully"))
  
})

//To provide current user 

const currentUser = asyncHandler( async (req,res) => {
  return res
  .status(200)
  .json(new ApiResponse(200,req.user,"Current user fetched successfully") )
})

//To update Userinfo
const updateUser = asyncHandler( async (req,res) => {
  const {fullname, email} = req.body
  if (!fullname || !email ) {
    throw new Apierror(400,"All Fields are required")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      fullname,
      email
    }
  },{new: true})
  .select("-password")
return res
  .status(200)
  .json(new ApiResponse(200,{user},"Account details updated successfully ") )
})


//Update Avatar 

const updateAvatar = asyncHandler( async (req,res) => {
  const avatarLocalpath = req.file?.path
  if (!avatarLocalpath) {
    throw new Apierror(400,"Avatar File is missing ")
  }
 const oldAvatarPublicId = req.user?.avatarPublicId
  
  const avatarUpdate = await uploadOnCloudinary(avatarLocalpath)

  if (!avatarUpdate?.url || !avatarUpdate?.public_id) {
    throw new Apierror(400,"Error while uploding avatar on Cloudinary ")
  }

 const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set: {
      avatar: avatarUpdate.url,
      avatarPublicId: avatarUpdate.public_id
    }
  },
  { new: true }
).select("-password -refreshTokens");
   if (!user) {
    throw new Apierror(404, "User not found");
  }
  
  if (
  oldAvatarPublicId &&
  oldAvatarPublicId !== avatarUpdate.public_id
) {
  const deleteResult = await deletecloudinary(oldAvatarPublicId);

  if (deleteResult?.result !== "ok") {
    console.error("Old avatar deletion was not confirmed");
  }
}
  
return res
  .status(200)
  .json(new ApiResponse(200,user,"Avatar Updated Successfully"))

  
})

//Update CoverImage
const updateCoverimg = asyncHandler( async (req,res) => {
  const coverImgLocalpath = req.file?.path
  if (!coverImgLocalpath) {
    throw new Apierror(400,"Cover File is missing ")
  }
 const oldCoverimgPublicId = req.user?.coverimgPublicId
  
  const coverImgUpdate = await uploadOnCloudinary(coverImgLocalpath)

  if (!coverImgUpdate?.url || !coverImgUpdate?.public_id) {
    throw new Apierror(400,"Error while uploding Cover image on Cloudinary ")
  }

 const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set: {
      coverimg: coverImgUpdate.url,
      coverimgPublicId: coverImgUpdate.public_id
    }
  },
  { new: true }
).select("-password -refreshTokens");
   if (!user) {
    throw new Apierror(404, "User not found");
   }
  if (
  oldCoverimgPublicId &&
  oldCoverimgPublicId !== coverImgUpdate.public_id
) {
  const deleteResult = await deletecloudinary(oldCoverimgPublicId);

  if (deleteResult?.result !== "ok") {
    console.error("Old Cover image deletion was not confirmed");
  }
}
  
return res
  .status(200)
  .json(new ApiResponse(200,user,"Cover Updated Successfully"))

  
})


//UserProfile

const userChannelProfile = asyncHandler( async (req,res) => {
  const {username} = req.params

  if (!username) {
    throw new Apierror(400,"Username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as:"subscribers"
      }
    },
   {
     $lookup:{
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as:"subscribedTo"
   }
    },

       {
         $addFields:{
           subscriberCount:{
             $size: "$subscribers"
           },
           channelsSubscribedCount: {
             $size: "$subscribedTo"
           },
             isSubscribed:{
               $cond:{
               if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                 then: true,
                 else:false
               }
             }
         }
       },
       {
         $project:{
           username: 1,
           fullname:1,
           email:1,
           avatar:1,
           coverimg:1,
           subscriberCount:1,
           channelsSubscribedCount:1,
           isSubscribed:1,
         }
       }
  ])

  if(!channel?.length){
    throw new Apierror(404,"Channel Does not exist")
  }

return res
  .status(200)
  .json( new ApiResponse(200,channel[0],"User channel fetched successfully"))
})

//Watch history 

const getWatchHistory = asyncHandler( async(req,res) => {
  const user = await User.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullname:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner:{
                  $arrayElemAt: ["$owner", 0]
              }
            }
          }
        ]
      }
    },
  ])

  return res
  .status(200)
  .json(new ApiResponse(200,user[0]?.watchHistory || [],"Watch history fetched successfully"))
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  currentUser,
  updateUser,
  updateAvatar,
  updateCoverimg,
  userChannelProfile,
  getWatchHistory
       }