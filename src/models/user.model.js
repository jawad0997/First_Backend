import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userScheema = new Schema({
  username:{
    type: String,
    required:true,
    unique:true,
    index:true,
    lowercase:true,
    trim:true
  },
  email:{
    type: String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },
  fullname:{
    type: String,
    required:true,
    index:true,
    trim:true
  },
  avatar:{
    type:String ,//we get this from cloudnary
    required:true
  },
  avatarPublicId: {
  type: String,
  default: ""
},
  coverimg:{
    type:String ,//we get this from cloudnary
  },
  coverimgPublicId: {
  type: String,
  default: ""
},
  watchHistory:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Video"
    }
  ],
  password:{
    type: String,
   required:[true,"password is required"]
  },
  refreshTokens:{
    type: String
  }
},{
  timestamps:true
})


userScheema.pre("save", async function () {
	if(!this.isModified("password")) return 
  this.password = await bcrypt.hash(this.password,10)
})


userScheema.methods.isPasswordCorrect = async function (password) {
 return	await bcrypt.compare(password,this.password)
}

userScheema.methods.generateAccessToken = function () {
	return jwt.sign(
    {
      _id: this.id,
    name: this.username,
    email: this.email,
    fullname:  this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:  process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userScheema.methods.generateRefreshToken = function () {
	return jwt.sign(
    {
      _id:  this.id,
    
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:  process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userScheema)
