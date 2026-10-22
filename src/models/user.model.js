import mongoose, {Scheema} from "mongoose";
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken"

const userScheema = new Scheema({
  username:{
    type: Stirng,
    required:true,
    unique:true,
    index:true,
    lowercase:true,
    trim:true
  },
  email:{
    type: Stirng,
    required:true,
    unique:true,
    lowercase:true,
    trim:true
  },
  fullname:{
    type: Stirng,
    required:true,
    index:true,
    trim:true
  },
  avatar:{
    type:String ,//we get this from cloudnary
    required: true
  },
  avatar:{
    type:String ,//we get this from cloudnary
  },
  watchHistory:[
    {
      type: mongoose.Scheema.Type.ObjectId,
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


userScheema.pre("save", async function (next) {
	if(!this.isModified("password")) return next()
  this.password = bcrypt.hash(this.password,10)
  next()
})

userScheema.method.isPasswordCorrect = async function (password) {
 return	await bycript.compare(password,this.password)
}

userScheema.method.generateAccessToken = function () {
	return jwt.sign(
    {
      _id = this.id,
    name = this.username,
    email=this.email,
    fullname = this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn = process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userScheema.method.generateRefreshToken = function () {
	return jwt.sign(
    {
      _id = this.id,
    
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn = process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User",userScheema)