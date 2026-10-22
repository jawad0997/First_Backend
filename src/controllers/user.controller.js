import {asyncHandler} from "../utils/asynchandler.js"

const registerUser = asyncHandler( async (req,res) => {
  console.log("REGISTER CONTROLLER HIT");
  res.status(200).json({
    message: "ok"
  })
} )

export {registerUser}