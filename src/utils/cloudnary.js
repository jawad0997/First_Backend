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

export {uploadOnCloudinary}


/*import { v2 as cloudinary } from "cloudinary";
import fs from "node:fs/promises";

cloudinary.config({
  secure: true
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(
      localFilePath,
      { resource_type: "auto" }
    );

    console.log("Cloudinary upload successful:", response.secure_url);

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    return null;
  } finally {
    try {
      await fs.unlink(localFilePath);
    } catch (error) {
      console.error("Temporary file cleanup failed:", error.message);
    }
  }
};

export { uploadOnCloudinary }
*/