# MongoDB Database Setup

## ✅ Database Configuration Complete

### New Database Name
**`college_placement_pulse`**

This database will be automatically created in your MongoDB Atlas cluster when you first connect.

---

## Connection Details

### MongoDB Atlas Connection String
```
mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/college_placement_pulse?retryWrites=true&w=majority&appName=Cluster0
```

### Breakdown:
- **Username**: DeepVegad
- **Password**: 143
- **Cluster**: cluster0.q8fenbd.mongodb.net
- **Database**: college_placement_pulse (NEW!)
- **App Name**: Cluster0

---

## Configuration Files Updated

### 1. Root `.env`
```env
PORT=5050
MONGODB_URI=mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/college_placement_pulse?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=devsecret
CORS_ORIGIN=http://localhost:5174
NODE_ENV=development
```

### 2. `server/.env`
```env
MONGODB_URI=mongodb+srv://DeepVegad:143@cluster0.q8fenbd.mongodb.net/college_placement_pulse?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=devsecret
PORT=5050
CORS_ORIGIN=http://localhost:5174
NODE_ENV=development
```

### 3. `package.json` Scripts
Both `server:dev` and `server:start` scripts now use the new database name.

---

## Database Collections

When you run the application, these collections will be created automatically:

### 1. **admins**
Stores admin user accounts
- name
- email
- password (hashed)
- collegeName
- collegeId
- role

### 2. **colleges**
Stores college information
- name
- location
- id
- placement_data

### 3. **placementdatas**
Stores placement records
- collegeId
- batchYear
- studentName
- branch
- company
- package
- status

---

## How to Start Backend Server

### From Project Root Directory:
```bash
cd "c:\Users\online\Downloads\college-placement-pulse-main 3\college-placement-pulse-main"
npm run server:dev
```

### Expected Output:
```
[INFO] 11:38:00 ts-node-dev (pid:xxxx) watching...
MongoDB connected
Server running on http://localhost:5050
```

---

## Verify Database Connection

### Option 1: Check Terminal Output
When server starts, you should see:
```
MongoDB connected
Server running on http://localhost:5050
```

### Option 2: Test Health Endpoint
Open browser or use curl:
```bash
curl http://localhost:5050/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-07T06:08:00.000Z"
}
```

### Option 3: Check MongoDB Atlas
1. Login to MongoDB Atlas
2. Go to your cluster
3. Click "Browse Collections"
4. You should see `college_placement_pulse` database

---

## Database Will Auto-Create When:

1. ✅ Backend server starts successfully
2. ✅ First admin signs up
3. ✅ First placement data is uploaded
4. ✅ Any API call that writes to the database

**Note**: MongoDB Atlas automatically creates databases and collections on first write operation.

---

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Check username and password are correct
- Verify MongoDB Atlas user has read/write permissions

### Error: "MongooseServerSelectionError"
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Check if IP address is whitelisted in Atlas

### Error: "ECONNREFUSED"
- This means trying to connect to local MongoDB
- Verify `.env` files have the correct Atlas connection string

### Database Not Showing in Atlas
- Normal! Database only appears after first write operation
- Create an admin account or upload data to trigger creation

---

## Next Steps

1. **Start Backend Server**
   ```bash
   npm run server:dev
   ```

2. **Start Frontend** (in new terminal)
   ```bash
   npm run dev
   ```

3. **Create First Admin**
   - Go to http://localhost:5174/auth
   - Sign up with your details
   - This will create the database and first collection

4. **Verify in MongoDB Atlas**
   - Login to Atlas
   - Browse Collections
   - See `college_placement_pulse` database

---

## Database Schema

### Admin Schema
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  collegeName: String,
  collegeId: String,
  role: 'admin'
}
```

### Placement Data Schema
```typescript
{
  collegeId: String,
  batchYear: Number,
  studentName: String,
  branch: String,
  company: String,
  package: Number,
  status: 'placed' | 'not_placed'
}
```

---

## Security Notes

⚠️ **For Production:**
- Change JWT_SECRET to a strong random string
- Use environment variables (don't commit .env files)
- Restrict MongoDB Atlas IP whitelist
- Use stronger passwords
- Enable MongoDB Atlas encryption

---

**Database is ready! Start the backend server to create it automatically.**
