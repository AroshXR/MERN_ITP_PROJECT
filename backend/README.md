# Backend API - Applicant Management System

## Overview
This backend provides a RESTful API for managing applicant data with improved validation, error handling, and security features.

## Recent Improvements Made

### 1. ApplicantModel.js
- ✅ Enhanced validation with detailed error messages
- ✅ Added phone number field with validation
- ✅ Added status field (pending/approved/rejected)
- ✅ Improved email validation regex
- ✅ Added virtual fields and database indexes
- ✅ Better age validation (16-100 years)

### 2. ApplicantController.js
- ✅ Added comprehensive input validation
- ✅ Consistent error handling and messages
- ✅ Added pagination support for getAllApplicants
- ✅ Better error logging with function names
- ✅ Added duplicate email checking
- ✅ Added updateApplicantStatus function
- ✅ Improved MongoDB ID validation
- ✅ Better response structure with messages and data

### 3. ApplicantRoutes.js
- ✅ Removed unused imports
- ✅ Added input validation middleware
- ✅ Added ID validation middleware
- ✅ Added new status update route
- ✅ Better route organization

### 4. app.js
- ✅ Fixed critical typo in applicant route ("/applicant " → "/applicant")
- ✅ Added global error handling
- ✅ Added 404 route handler
- ✅ Better database connection handling
- ✅ Improved user registration and login logic
- ✅ Added environment variable support
- ✅ Better code organization and structure

## API Endpoints

### Applicants
- `GET /applicant` - Get all applicants (with pagination and filtering)
- `POST /applicant` - Create new applicant
- `GET /applicant/:id` - Get applicant by ID
- `PUT /applicant/:id` - Update applicant
- `DELETE /applicant/:id` - Delete applicant
- `PATCH /applicant/:id/status` - Update applicant status

### Users
- `POST /register` - User registration
- `POST /login` - User login

## Environment Variables
Create a `.env` file with:
```
PORT=5001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Features
- Input validation and sanitization
- Comprehensive error handling
- Pagination support
- Status management for applicants
- Secure password hashing
- JWT token authentication
- CORS enabled
- MongoDB with Mongoose ODM

## Running the Application
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start server: `npm start` or `node app.js`
4. Server runs on port 5001 by default
