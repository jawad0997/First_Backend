import mongoose, {Schema} from "mongoose";
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';


const commentScheema = new Shcema({
  content:{
    type: String,
    required:true
  },
  video:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Video"
  },
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Video"
  },
  
},{timestamps:true})

commentScheema.plugin("mongooseAggregatePaginate")
export const Comments = mongoose.model("Comments",commentScheema)
          