const jwt = require('jsonwebtoken');
const User = require('../model/usersModel');
const { response } = require('../utils/responseService'); 
require('dotenv').config()


async function authenticateJWT(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
      return response(res, false, 401, 'Unauthorized');
    }
  
    try {
      const user = await jwt.verify(token, process.env.SECRET_KEY);
      const foundUser = await User.findById(user.userId);
      if (!foundUser) {
        return response(res, false, 404, 'User not found');
      }
      req.user = {
        _id: user.userId,
        name: foundUser.name,
        email: foundUser.email,
        isDoctor: foundUser.isDoctor,
        isAdmin:foundUser.isAdmin
      };
      next();
    } catch (error) {
      console.error('Error during authentication:', error);
      return response(res, false, 403, 'Forbidden');
    }
  }
  
  function isDoctor(req, res, next) {
    if (req.isDoctor || req.isAdmin) {
      next(); 
    } else {
      return response(res, false, 403, 'Access denied. Only doctors allowed.');
    }
  }

  module.exports = { authenticateJWT, isDoctor }