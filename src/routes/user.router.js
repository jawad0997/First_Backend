import {Router} from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  currentUser,
  updateUser,
  updateAvatar,
  updateCoverimg,
  userChannelProfile,
  getWatchHistory
       } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyjwt} from "../middlewares/uth.middleware.js"
const router = Router()


router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount:1
    },
    {
      name:"coverimg",
      maxCount: 1
    }
  ]),
  registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyjwt,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyjwt,currentUser)
router.route("/update-user").patch(verifyjwt,updateUser)
router.route("/avatar").patch(verifyjwt,upload.single("avatar"),updateAvatar)
router.route("/cover-image").patch(verifyjwt,upload.single("coverimg"),updateCoverimg)
router.route("/c/:username").get(verifyjwt,userChannelProfile)
router.route("/history").get(verifyjwt,getWatchHistory)
export default router;
