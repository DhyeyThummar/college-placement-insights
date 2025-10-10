# Admin Setup Guide - College Placement Pulse

## 🎯 Overview

This guide provides complete instructions for setting up and managing admin accounts for the College Placement Pulse system. Each college has its own unique pre-approved key for admin registration.

## 🔑 College-Specific Admin Keys

### Current Admin Keys (Manually Set)

| College | Admin Key | College ID |
|---------|-----------|------------|
| Indian Institute of Technology Delhi | `IIT_DELHI_2024` | 1 |
| Indian Institute of Technology Bombay | `IIT_BOMBAY_2024` | 2 |
| Indian Institute of Technology Kanpur | `IIT_KANPUR_2024` | 3 |
| Indian Institute of Technology Madras | `IIT_MADRAS_2024` | 4 |
| Indian Institute of Technology Kharagpur | `IIT_KHARAGPUR_2024` | 5 |
| National Institute of Technology Karnataka | `NIT_KARNATAKA_2024` | 6 |
| National Institute of Technology Trichy | `NIT_TRICHY_2024` | 7 |
| Birla Institute of Technology and Science | `BITS_PILANI_2024` | 8 |
| Delhi Technological University | `DTU_DELHI_2024` | 9 |
| Netaji Subhas University of Technology | `NSUT_DELHI_2024` | 10 |

## 📋 Admin Signup Process

### Step 1: Access Admin Registration
1. Navigate to the application homepage
2. Click on "Admin Panel" in the quick actions section
3. Or go directly to `/auth` page
4. Click on "Sign Up" tab

### Step 2: Fill Registration Form
1. **Full Name**: Enter your full name
2. **Email**: Enter your email address (this will be your login username)
3. **Password**: Create a strong password
4. **College**: Select your college from the dropdown
5. **Pre-approved Key**: Enter the admin key for your college (see table above)

### Step 3: Submit Registration
1. Click "Create Account"
2. If successful, you'll be redirected to the sign-in page
3. Sign in with your email and password

## 🔐 Admin Login Process

### Step 1: Access Login Page
1. Go to `/auth` page
2. Make sure "Sign In" tab is selected

### Step 2: Enter Credentials
1. **Email**: Enter your registered email
2. **Password**: Enter your password

### Step 3: Access Dashboard
1. Click "Sign In"
2. You'll be redirected to the admin dashboard
3. From there, you can upload placement data and manage your college's information

## 🏫 Admin Dashboard Features

### Data Upload
- Upload CSV files with placement data
- Data is automatically associated with your college
- Preview data before saving
- Export existing data

### College Management
- View your college's placement statistics
- Navigate to college dashboard for data visualization
- Manage placement records

### Key Features
- **Automatic College Association**: Your admin account is automatically linked to your college
- **Data Security**: Only you can upload data for your college
- **Real-time Updates**: Changes reflect immediately in the system

## 🆕 Adding New Colleges

### For System Administrators

When you need to add a new college to the system:

#### Method 1: Using Key Management Tool (Recommended)

```bash
cd server
node manageKeys.cjs add <collegeId> "<collegeName>" <adminKey>
```

**Example:**
```bash
node manageKeys.cjs add 9 "IIT Roorkee" IIT_ROORKEE_2024
```

#### Method 2: Manual JSON Update

1. **Edit the JSON file:**
   - Open `server/admin-keys.json`
   - Add your new college with a custom admin key

2. **Load the updated keys:**
   ```bash
   cd server
   node loadManualKeys.cjs
   ```

#### Step 3: Update College List
Add the new college to the `colleges` array in:
- `server/admin-keys.json`
- `src/data/placementData.js`

#### Step 4: Provide Key to College
Share the admin key with the college administrator for registration.

## 🔧 Key Management System

### Command Line Key Management Tool

The system includes a powerful command-line tool for managing admin keys:

#### List All Keys
```bash
cd server
node manageKeys.cjs list
```

#### Update an Existing Key
```bash
node manageKeys.cjs update <collegeId> <newKey>
```
**Example:**
```bash
node manageKeys.cjs update 1 IIT_DELHI_2025
```

#### Add New College
```bash
node manageKeys.cjs add <collegeId> "<collegeName>" <adminKey>
```
**Example:**
```bash
node manageKeys.cjs add 9 "IIT Roorkee" IIT_ROORKEE_2024
```

#### Toggle Key Status (Active/Inactive)
```bash
node manageKeys.cjs toggle <collegeId>
```
**Example:**
```bash
node manageKeys.cjs toggle 1
```

#### Export All Keys
```bash
node manageKeys.cjs export
```

### Manual Key Management

#### Method 1: Edit JSON File
1. Open `server/admin-keys.json`
2. Modify the keys as needed
3. Run: `node loadManualKeys.cjs`

#### Method 2: Direct Database Update
Use the API endpoints or database tools to update keys directly.

### API Endpoints for Key Management

#### Get All Admin Keys
```
GET /api/admin-keys/all
```

#### Get Key for Specific College
```
GET /api/admin-keys/{collegeId}
```

#### Create New Admin Key
```
POST /api/admin-keys/create
Body: {
  "collegeId": "string",
  "collegeName": "string", 
  "createdBy": "string"
}
```

#### Update Admin Key Status
```
PUT /api/admin-keys/{collegeId}
Body: {
  "isActive": boolean
}
```

#### Delete Admin Key
```
DELETE /api/admin-keys/{collegeId}
```

#### Verify Admin Key
```
POST /api/admin-keys/verify
Body: {
  "adminKey": "string",
  "collegeId": "string"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "Invalid admin key for this college" (403 Forbidden)
- **Cause**: Wrong admin key or college ID mismatch
- **Solution**: 
  - Verify you're using the correct admin key from the table above
  - Make sure you select the correct college from the dropdown
  - Check that the college ID matches the admin key
  - Example: For IIT Delhi, use key `IIT_DELHI_2024` with College ID 1

#### 2. "Admin already exists"
- **Cause**: Email already registered
- **Solution**: Use a different email or contact system administrator

#### 3. "Missing fields"
- **Cause**: Incomplete registration form
- **Solution**: Fill all required fields

#### 4. "Failed to save data"
- **Cause**: Server connection or authentication issues
- **Solution**: Check internet connection and try logging in again

### Getting Help

If you encounter issues:
1. Check this guide first
2. Verify your admin key is correct
3. Ensure all form fields are filled
4. Contact system administrator if problems persist

## 🔒 Security Notes

- Admin keys are unique per college
- Keys are case-sensitive
- Keep your admin credentials secure
- Don't share admin keys with unauthorized personnel
- Change your password regularly

## 📞 Support

For technical support or questions about admin setup:
- Check the troubleshooting section above
- Verify your college's admin key
- Ensure you're using the correct college selection

---

**Last Updated**: September 18, 2025
**Version**: 1.0
