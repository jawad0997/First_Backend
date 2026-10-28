import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
  secure: true
})


const uploadOnCloudinary  = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    //file uploadCloudinary
   const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type:  "auto"
    })
  //  console.log("File successfully uploaded",response.url);
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {}
  fs.unlinkSync(localFilePath)
  return null
}
//del old 
const deletecloudinary = async (publicid) => {
  try {
    if (!publicid) return null
    const del = await cloudinary.uploader.destroy(publicid)
    return del
  } catch (error) {
    console.log("Cloudinary deleate error",error);
    return null
  }
  
}

export {uploadOnCloudinary,deletecloudinary}


