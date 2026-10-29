import mongoose, {Schem} from "mongoose"
const likeScheema = new Schema({

  likes:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Video"
  },
  comments:{ 
    type:mongoose.Schema.Types.ObjectId,
    ref:"Comment"
},
  tweet:{
    type:mongoose.Schema.Type.ObjectId,
    ref:"Tweet"
  },
  likedby:{
    type:mongoose.Schema.Type.ObjectId,
    ref:"User"
  }
},{timestamps:true})

export const Like = mongoose.model("Like",likeScheema)


