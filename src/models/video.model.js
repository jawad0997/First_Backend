import mongoose, {Scheema} from "mongoose";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';


const videoScheema = new Shceeema({
  videofile:{
    type:String,//from cloudnary 
    required:true
  },
  thumbnail:{
    type:String,//from cloudnary 
    required:true
  },
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  duration:{
    type:Number,
    required:true
  },
  views:{
    type:Number,
    default:0
  },
  ispublished:{
    type:Boolean,
    default:true
  },
  owner:{
    type:mongoose.Scheema.Type.ObjectId,
    ref:"User"
  },


  
},{timestamps:true})

videoScheema.plugin("mongooseAggregatePaginate")
export const Video = mongoose.module("User",videoScheema)