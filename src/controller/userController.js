const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/usersModel");
const { response } = require("../utils/responseService");
const speakeasy = require("speakeasy");
const { validationResult } = require('express-validator');
const {uploadFile} = require('../utils/uploadService')
async function signup(req, res) {
  const { name, email, password } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, 400, 'Validation errors', errors.array());
    }
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return response(res, false, 400, "Email already registered.");
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user in the database
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const newUser = await user.save();
    return response(res, true, 201, "User registered successfully.", newUser);
  } catch (error) {
    console.error("Error during user registration:", error);
    return response(res, false, 500, "Internal server error.");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response(res, false, 400, 'Validation errors', errors.array());
    }
    const user = await User.findOne({ email });
    if (!user) return response(res, false, 401, "Invalid email or password.");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return response(res, false, 401, "Invalid email or password.");

    // Generate access and refresh tokens
    const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    user.refreshToken = refreshToken;
    await user.save();
    return response(res, true, 200, "Login successful.", {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return response(res, false, 500, "Internal server error.");
  }
}

async function uploadProfilePicture(req, res) {
  uploadFile(req, res, async (error) => {
    if (error) {
      console.error("Error uploading profile picture:", error);
      return response(res, false, 500, "Profile picture upload failed");
    }
    const filePath = req.file.path;
    // Update the user's profile with the file path
    const userId = req.user._id;
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage: filePath },
        { new: true }
      );
      if (!user) {
        return response(res, false, 404, "User not found");
      }
      return response(
        res,
        true,
        200,
        "Profile picture uploaded and user profile updated"
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
      return response(res, false, 500, "Failed to update user profile");
    }
  });
}

async function updateUserInformation(req, res) {
  try {
    const userId = req.user.__id;
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { ...req.body } },
      { new: true }
    );
    if (!user) {
      return response(res, false, 404, "User not found");
    }
    return response(res, true, 200, "User information updated", user);
  } catch (error) {
    console.error("Error updating user information:", error);
    return response(res, false, 500, "Failed to update user information");
  }
}

async function forgetPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return response(res, false, 404, "User not found");
    }

    // Generate an OTP
    const otp = generateOTP();

    // Store the OTP in the user's document
    user.passwordResetOTP = otp;
    await user.save();

    // Send the OTP via email using the email service
    await sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}`
    );

    return response(
      res,
      true,
      200,
      "Password reset OTP email sent successfully"
    );
  } catch (error) {
    console.error(
      'Error initiating "forget password" process with OTP:',
      error
    );
    return response(
      res,
      false,
      500,
      'Failed to initiate "forget password" process with OTP'
    );
  }
}

// Generate a random OTP
function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 32 }).base32,
    step: 300, // OTP changes every 5 minutes
  });
}

function generateAccessToken(user) {
  const accessToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "15m",
  });
  return accessToken;
}

async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return response(res, false, 400, "No refresh token provided");
    }

    const user = await User.findOne({ refreshToken: refreshToken });

    if (!user) {
      return response(res, false, 404, "User not found");
    }

    if (user.refreshToken !== refreshToken) {
      return response(res, false, 403, "Invalid refresh token");
    }

    const accessToken = generateAccessToken(user);
    return response(res, true, 200, "Access token refreshed", { accessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return response(res, false, 500, "Failed to refresh access token");
  }
}

module.exports = {
  signup,
  login,
  uploadProfilePicture,
  updateUserInformation,
  forgetPassword,
  refreshAccessToken
};
