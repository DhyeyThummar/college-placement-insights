# Admin Special Key Documentation

## Overview
The admin signup now requires a **Special Key** instead of selecting from a dropdown. This ensures only authorized personnel can create admin accounts.

---

## Special Key Details

### Default Special Key
```
ADMIN2025
```

### How It Works
1. Admin enters their details on the signup page
2. Admin enters the **College Name** (free text input)
3. Admin enters the **Special Key** (password field)
4. Backend validates the special key
5. If valid, creates admin account with auto-generated `collegeId`

---

## College ID Generation

The `collegeId` is automatically generated from the college name:
- Converts to lowercase
- Replaces spaces with hyphens
- Removes special characters
- Only keeps alphanumeric and hyphens

### Examples:
| College Name | Generated College ID |
|--------------|---------------------|
| MIT College | `mit-college` |
| IIT Bombay | `iit-bombay` |
| St. Xavier's College | `st-xaviers-college` |
| ABC Engineering College | `abc-engineering-college` |

---

## Configuration

### Environment Variables

**Root `.env`:**
```env
ADMIN_SPECIAL_KEY=ADMIN2025
```

**`server/.env`:**
```env
ADMIN_SPECIAL_KEY=ADMIN2025
```

**`package.json` (server:dev script):**
```json
"server:dev": "cross-env ... ADMIN_SPECIAL_KEY=ADMIN2025 ..."
```

---

## Changing the Special Key

### Option 1: Update Environment Files
1. Edit `.env` file:
   ```env
   ADMIN_SPECIAL_KEY=YourNewKey123
   ```

2. Edit `server/.env` file:
   ```env
   ADMIN_SPECIAL_KEY=YourNewKey123
   ```

3. Edit `package.json`:
   ```json
   "server:dev": "... ADMIN_SPECIAL_KEY=YourNewKey123 ..."
   ```

4. Restart the backend server

### Option 2: Use Environment Variable
Set it in your system or deployment platform:
```bash
export ADMIN_SPECIAL_KEY=YourNewKey123
```

---

## Signup Flow

### Frontend (Auth Page)
1. **Full Name** - Admin's name
2. **Email** - Admin's email (must be unique)
3. **Password** - Admin's password
4. **College Name** - Free text input (e.g., "MIT College")
5. **Special Key** - Password field (must match `ADMIN_SPECIAL_KEY`)

### Backend Validation
```typescript
// Validates special key
const VALID_SPECIAL_KEY = process.env.ADMIN_SPECIAL_KEY || 'ADMIN2025';
if (specialKey !== VALID_SPECIAL_KEY) {
  return res.status(403).json({ error: 'Invalid special key' });
}

// Generates collegeId from collegeName
const collegeId = collegeName.toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '');
```

---

## Security Recommendations

### For Development:
- Current key: `ADMIN2025` is fine

### For Production:
1. **Use a strong, unique key**
   - Minimum 16 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `Adm!n$2025#Secure@Key`

2. **Store in environment variables**
   - Never commit to Git
   - Use deployment platform's secret management

3. **Rotate periodically**
   - Change every 3-6 months
   - Update all admins with new key

4. **Limit distribution**
   - Only share with authorized personnel
   - Use secure channels (encrypted email, password manager)

---

## API Endpoint

### POST `/api/admin/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "collegeName": "MIT College",
  "specialKey": "ADMIN2025"
}
```

**Success Response (201):**
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "admin_id",
    "name": "John Doe",
    "email": "john@example.com",
    "collegeId": "mit-college",
    "collegeName": "MIT College"
  }
}
```

**Error Responses:**

**Invalid Special Key (403):**
```json
{
  "error": "Invalid special key"
}
```

**Missing Fields (400):**
```json
{
  "error": "Missing fields"
}
```

**Admin Already Exists (409):**
```json
{
  "error": "Admin already exists"
}
```

---

## Testing

### Test Admin Signup:
1. Start backend: `npm run server:dev`
2. Start frontend: `npm run dev`
3. Navigate to: `http://localhost:5174/auth`
4. Click "Sign Up" tab
5. Fill in:
   - Full Name: Test Admin
   - Email: test@college.edu
   - Password: test123
   - College Name: Test College
   - Special Key: **ADMIN2025**
6. Click "Create Account"

### Expected Result:
- ✅ Account created successfully
- ✅ Redirected to admin dashboard
- ✅ College ID: `test-college`

---

## Troubleshooting

### "Invalid special key" Error
- **Cause**: Entered key doesn't match `ADMIN_SPECIAL_KEY`
- **Solution**: Verify you're using `ADMIN2025` (case-sensitive)

### Special Key Not Working
- **Cause**: Environment variable not loaded
- **Solution**: 
  1. Check `.env` files
  2. Restart backend server
  3. Verify `process.env.ADMIN_SPECIAL_KEY` in backend

### College ID Issues
- **Cause**: Special characters in college name
- **Solution**: College ID auto-generated, removes special chars
- **Example**: "St. Mary's College" → `st-marys-college`

---

## Distribution Instructions

### For New Admins:
Send them:
1. **Application URL**: `http://your-domain.com/auth`
2. **Special Key**: `ADMIN2025` (via secure channel)
3. **Instructions**:
   - Click "Sign Up"
   - Enter your details
   - Enter your college name exactly as you want it displayed
   - Enter the special key provided
   - Create account

---

## Summary

✅ **Removed**: College dropdown selection  
✅ **Added**: College name text input  
✅ **Added**: Special key validation  
✅ **Auto-generated**: College ID from college name  
✅ **Secure**: Only authorized users can create admin accounts  
✅ **Flexible**: Easy to change special key via environment variables  

**Current Special Key**: `ADMIN2025`

---

**Important**: Keep the special key confidential and share only with authorized personnel!
