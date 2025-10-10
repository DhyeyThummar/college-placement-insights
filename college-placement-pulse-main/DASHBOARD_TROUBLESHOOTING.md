# College Dashboard Troubleshooting Guide

## Current Issue: Dashboard Not Rendering

### **Step 1: Test Basic Routing** ✅

I've temporarily replaced the college dashboard with a simple test dashboard to isolate the issue.

**What to do:**
1. Go to All Colleges page
2. Click "View Dashboard" on any college
3. You should see a **Test Dashboard** page with:
   - College ID displayed
   - Current URL shown
   - Debug information

**If Test Dashboard Works:**
- ✅ Routing is working
- ✅ Issue is in CollegeDashboard component
- → Proceed to Step 2

**If Test Dashboard Doesn't Work:**
- ❌ Routing issue
- → Check browser console for errors
- → Check if frontend is running on correct port

---

### **Step 2: Check API Endpoints**

Open the test file I created: `test_api.html`

**What to do:**
1. Open `test_api.html` in browser
2. Check browser console for API responses
3. Verify these endpoints work:
   - `GET /api/colleges` - Should return list of colleges
   - `GET /api/analytics/college/{collegeId}` - Should return analytics

**Expected Results:**
```json
// Colleges endpoint
{
  "success": true,
  "colleges": [
    {
      "id": "your-college-id",
      "name": "Your College",
      "code": "your-college-id"
    }
  ]
}

// Analytics endpoint
{
  "success": true,
  "analytics": {
    "totalStudents": 150,
    "placedStudents": 135,
    "placementRate": 90.0,
    "avgPackage": 12.5
  }
}
```

---

### **Step 3: Check Backend Logs**

Look at your backend terminal for these logs:

**When visiting college dashboard:**
```
Analytics for your-college-id - Found 150 records
College your-college-id - Valid packages: 120
```

**If no logs appear:**
- ❌ Frontend not calling backend
- → Check network tab in browser dev tools

**If logs show 0 records:**
- ❌ No data uploaded for this college
- → Upload placement data via admin dashboard

---

### **Step 4: Check Frontend Console**

Open browser dev tools (F12) and look for:

**Expected logs:**
```
Fetching data for college ID: your-college-id
College data: { name: "Your College", ... }
Analytics data: { totalStudents: 150, ... }
```

**Common errors:**
```
Failed to fetch
CORS error
404 Not Found
500 Internal Server Error
```

---

### **Step 5: Restore Full Dashboard**

Once basic routing works, restore the full dashboard:

**In `src/App.tsx`, change:**
```typescript
// From:
<Route path="/college/:collegeId" element={<TestDashboard />} />

// To:
<Route path="/college/:collegeId" element={<CollegeDashboard />} />
```

---

## Common Issues & Solutions

### **Issue 1: "View Dashboard" Does Nothing**
**Cause**: JavaScript error preventing navigation
**Solution**: 
1. Check browser console for errors
2. Check if All Colleges page has correct college IDs
3. Verify button onClick handlers work

### **Issue 2: Dashboard Shows Loading Forever**
**Cause**: API calls failing or hanging
**Solution**:
1. Check network tab for failed requests
2. Verify backend is running on port 5051
3. Check CORS settings

### **Issue 3: Dashboard Shows "College Not Found"**
**Cause**: College ID mismatch or college doesn't exist
**Solution**:
1. Check URL parameter matches college code
2. Verify college exists in database
3. Check college creation during admin signup

### **Issue 4: Dashboard Shows "No Placement Data"**
**Cause**: No data uploaded or data not linked to college
**Solution**:
1. Upload placement data via admin dashboard
2. Verify data is tagged with correct college ID
3. Check analytics API returns data

### **Issue 5: Package Values Still Zero**
**Cause**: Package data format issues
**Solution**:
1. Check uploaded CSV has numeric package values
2. Verify package parsing in analytics controller
3. Check backend logs for package validation

---

## Debug Features Added

### **Frontend Debug Panel**
The CollegeDashboard now shows a debug panel with:
- College ID from URL
- College data load status
- Analytics data load status
- Total students count
- Any errors encountered

### **Backend Logging**
Enhanced logging shows:
- Number of records found for college
- Number of valid packages
- Analytics calculation results

### **API Test Page**
`test_api.html` provides:
- Direct API endpoint testing
- JSON response viewing
- Error detection

---

## Testing Checklist

### **✅ Basic Functionality:**
- [ ] Frontend runs without errors (`npm run dev`)
- [ ] Backend runs without errors (`npm run server:dev`)
- [ ] All Colleges page loads
- [ ] College cards have "View Dashboard" buttons

### **✅ Routing Test:**
- [ ] Click "View Dashboard" shows Test Dashboard
- [ ] Test Dashboard displays college ID correctly
- [ ] Back button works

### **✅ API Test:**
- [ ] `/api/colleges` returns college list
- [ ] `/api/analytics/college/{id}` returns analytics
- [ ] No CORS errors in console

### **✅ Data Test:**
- [ ] Placement data uploaded via admin dashboard
- [ ] Backend logs show records found
- [ ] Analytics API returns non-zero values

### **✅ Full Dashboard:**
- [ ] Switch back to CollegeDashboard component
- [ ] Dashboard renders with college info
- [ ] Statistics show correct values
- [ ] Charts display (if data available)

---

## Quick Fixes

### **Fix 1: Restart Everything**
```bash
# Stop both servers
Ctrl+C (in both terminals)

# Restart backend
npm run server:dev

# Restart frontend (in new terminal)
npm run dev
```

### **Fix 2: Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R
- Clear cache and reload
- Try incognito mode

### **Fix 3: Check Ports**
- Backend should be on: http://localhost:5051
- Frontend should be on: http://localhost:5174
- API calls should go to port 5051

---

## Next Steps

1. **Test the routing** with the Test Dashboard
2. **Check API endpoints** with test_api.html
3. **Verify data upload** and backend logs
4. **Restore full dashboard** once routing works
5. **Report specific errors** if issues persist

The Test Dashboard will help us identify exactly where the problem is occurring!
