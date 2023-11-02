const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  updateUserInformation,
  uploadProfilePicture,
} = require("../controller/userController"); // Import the user controller
const {authenticateJWT} = require("../middleware/authenticate"); // Import your authentication middleware
const { validateSignup, validateLogin } = require('../validation/userValidation');

router.post("/signup",validateSignup, signup);
router.post("/login", validateLogin, login);
router.put("/update", authenticateJWT, updateUserInformation);
router.post("/upload-profile-picture", authenticateJWT, uploadProfilePicture);

module.exports = router;
