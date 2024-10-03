import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ================ AUTH ================
// User authentication by checking token validity
export const auth = (req, res, next) => {
    try {
        // Extract token from one of the three possible locations
        const token = req.body?.token || req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

        // If token is missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token is Missing'
            });
        }

        // Verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
        } catch (error) {
            console.log('Error while decoding token:', error);
            return res.status(401).json({
                success: false,
                error: error.message,
                message: 'Error while decoding token'
            });
        }
        // Go to next middleware
        next();
    } catch (error) {
        console.log('Error while token validating:', error);
        return res.status(500).json({
            success: false,
            message: 'Error while token validating'
        });
    }
}

// ================ IS STUDENT ================ 
export const isStudent = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Student') {
            return res.status(401).json({
                success: false,
                message: 'This Page is protected only for students'
            });
        }
        // Go to next middleware
        next();
    } catch (error) {
        console.log('Error while checking user validity with student accountType:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity with student accountType'
        });
    }
}

// ================ IS INSTRUCTOR ================ 
export const isInstructor = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Instructor') {
            return res.status(401).json({
                success: false,
                message: 'This Page is protected only for Instructors'
            });
        }
        // Go to next middleware
        next();
    } catch (error) {
        console.log('Error while checking user validity with Instructor accountType:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity with Instructor accountType'
        });
    }
}

// ================ IS ADMIN ================ 
export const isAdmin = (req, res, next) => {
    try {
        if (req.user?.accountType !== 'Admin') {
            return res.status(401).json({
                success: false,
                message: 'This Page is protected only for Admins'
            });
        }
        // Go to next middleware
        next();
    } catch (error) {
        console.log('Error while checking user validity with Admin accountType:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while checking user validity with Admin accountType'
        });
    }
}
