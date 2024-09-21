import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ================ AUTH ================
export const auth = (req, res, next) => {
  try {
    // Extract token from body, cookies, or header
    const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is Missing',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Assign decoded token to req.user
    } catch (error) {
      console.error('Error while decoding token:', error.message);
      return res.status(401).json({
        success: false,
        error: error.message,
        message: 'Error while decoding token',
      });
    }

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error while token validation:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error while token validation',
    });
  }
};

// ================ IS STUDENT ================
export const isStudent = (req, res, next) => {
  try {
    if (req.user?.accountType !== 'Student') {
      return res.status(401).json({
        success: false,
        message: 'This Page is protected only for Students',
      });
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error while checking student accountType:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while checking student accountType',
    });
  }
};

// ================ IS INSTRUCTOR ================
export const isInstructor = (req, res, next) => {
  try {
    if (req.user?.accountType !== 'Instructor') {
      return res.status(401).json({
        success: false,
        message: 'This Page is protected only for Instructors',
      });
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error while checking instructor accountType:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while checking instructor accountType',
    });
  }
};

// ================ IS ADMIN ================
export const isAdmin = (req, res, next) => {
  try {
    if (req.user?.accountType !== 'Admin') {
      return res.status(401).json({
        success: false,
        message: 'This Page is protected only for Admins',
      });
    }
    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error('Error while checking admin accountType:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error while checking admin accountType',
    });
  }
};
