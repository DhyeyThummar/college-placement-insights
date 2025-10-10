# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
The project is already configured with:
- MongoDB URI: `mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/`
- Backend Port: 5050
- Frontend Port: 5174
- JWT Secret: devsecret (change in production)

Configuration is in:
- `package.json` (npm scripts)
- `server/.env` (environment file)

### 3. Start Backend Server
Open a terminal and run:
```bash
npm run server:dev
```

Backend will start at: **http://localhost:5050**

### 4. Start Frontend Server
Open another terminal and run:
```bash
npm run dev
```

Frontend will start at: **http://localhost:5174**

## First Time Usage

### 1. Create Admin Account
1. Navigate to: http://localhost:5174/auth
2. Click "Sign Up" tab
3. Fill in:
   - Full Name
   - Email
   - Password
   - Select College
4. Click "Create Account"

**Note**: No admin key required anymore!

### 2. Login
1. Use your email and password
2. You'll be redirected to the admin dashboard

### 3. Upload Placement Data

#### Step 1: Download Template
1. In Admin Dashboard, find "Download & Export" card
2. Click "Download CSV Template"
3. A file `placement_data_template.csv` will download

#### Step 2: Fill Template
Open the CSV and add your data:
```csv
batchYear,studentName,branch,company,package,status
2024,John Doe,Computer Science,Google,15.5,placed
2024,Jane Smith,Mechanical,Tesla,12.0,placed
2024,Bob Johnson,Electronics,Intel,10.5,placed
```

#### Step 3: Upload
1. Click "Select CSV File" in the upload section
2. Choose your filled CSV file
3. Review the data preview
4. Click "Save to Database"

### 4. View Data
- Dashboard shows statistics automatically
- Navigate to college dashboard to see detailed analytics
- Use "Export All Data as CSV" to download existing records

## Troubleshooting

### Backend won't start
- Check if port 5050 is available
- Verify MongoDB connection string
- Check console for error messages

### Frontend won't start
- Check if port 5174 is available
- Ensure dependencies are installed
- Clear browser cache

### CSV Upload Fails
- Verify CSV has all required columns
- Check data format matches template
- Ensure you're logged in as admin

### MongoDB Connection Issues
- Verify internet connection
- Check MongoDB Atlas cluster is active
- Confirm connection string is correct

## API Endpoints

### Base URL: http://localhost:5050/api

#### Authentication
- POST `/admin/signup` - Create admin account
- POST `/admin/login` - Admin login

#### Placement Data
- GET `/admin/csv-template` - Download CSV template
- POST `/admin/upload` - Upload CSV data
- GET `/placements/:collegeId` - Get placements
- GET `/placements/:collegeId/stats` - Get statistics

#### Colleges
- GET `/colleges` - List all colleges

## Project Structure

```
college-placement-pulse-main/
├── server/                 # Backend
│   ├── src/
│   │   ├── controllers/   # API logic
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   └── server.ts      # Entry point
│   └── .env              # Environment variables
├── src/                   # Frontend
│   ├── pages/            # React pages
│   ├── components/       # UI components
│   ├── services/         # API services
│   └── context/          # Auth context
└── package.json          # Dependencies & scripts
```

## Key Changes Made

✅ **Removed**: Admin key system (no longer needed)
✅ **Removed**: User authentication (admin-only system)
✅ **Added**: CSV template download feature
✅ **Updated**: MongoDB connection to your Atlas cluster
✅ **Simplified**: Admin signup process

## Next Steps

1. **Add More Colleges**: Update college list in database
2. **Customize Theme**: Modify styles in `src/index.css`
3. **Add Validation**: Enhance CSV validation rules
4. **Deploy**: Consider deploying to Vercel (frontend) + Railway (backend)

## Support

For issues or questions:
1. Check `CHANGES_SUMMARY.md` for detailed changes
2. Review console logs for errors
3. Verify all environment variables are set correctly

---

**Happy Coding! 🚀**
