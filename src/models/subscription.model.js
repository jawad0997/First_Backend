import mongoose, {Schema} from "mongoose"

const subscriptionScheema = new Schema({
  subscriber:{
    type : mongoose.Schema.Types.ObjectId,//One who subscribing the channel 
    ref:"User"
  },
  channel:{
    type : mongoose.Schema.Types.ObjectId,//One whom subscriber is subscribing
    ref:"User"
  }
  
},{timestamps:true})

export const Subscription = mongoose.module("Subscription",subscriptionScheema)