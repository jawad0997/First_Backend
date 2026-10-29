import mongoose, {Schem} from "mongoose"
const playListScheema = new Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  video:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Video"
  }],
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playListScheema)