# Debug CSV Upload - Invalid Row Issue

## Quick Debug Steps

### 1. **Check Backend Console Logs**
When you upload a CSV file, the backend now logs detailed information:

```
CSV content preview: batchYear,studentName,branch,company,package,status...
Parsed CSV data: [{ batchYear: '2024', studentName: 'John Doe', ... }]
Processing 2 rows
Row 1 validation errors: ['Invalid status: placed']
Row 1 data: { batchYear: '2024', studentName: 'John Doe', ... }
```

### 2. **Common Issues & Solutions**

#### **Issue: Status Field Case Sensitivity**
**Problem**: CSV has "placed" but validation expects exact match
**Solution**: The code now handles case-insensitive status, but check logs

#### **Issue: Extra Spaces or Hidden Characters**
**Problem**: Fields might have trailing spaces or invisible characters
**Solution**: All fields are now trimmed automatically

#### **Issue: Number Format**
**Problem**: Package field might have currency symbols or commas
**Examples**: 
- ❌ "₹12.5" (has currency symbol)
- ❌ "12,500" (has comma)
- ✅ "12.5" (plain number)

#### **Issue: Empty Rows**
**Problem**: CSV might have empty rows at the end
**Solution**: `skipEmptyLines: true` should handle this

### 3. **Test with Simple CSV**

Use this minimal test file (`test_placement_data.csv`):
```csv
batchYear,studentName,branch,company,package,status
2024,John Doe,Computer Science,Tech Corp,12.5,Placed
2024,Jane Smith,Information Technology,Software Solutions Inc,15.0,Placed
```

### 4. **Check Your CSV Format**

#### **Required Columns (exact names):**
- `batchYear` (not "Batch Year" or "year")
- `studentName` (not "Student Name" or "name")  
- `branch` (not "Branch" or "department")
- `company` (not "Company Name" or "employer")
- `package` (not "Package" or "salary")
- `status` (not "Status" or "placement_status")

#### **Valid Values:**
- **batchYear**: 2000-2030 (numbers only)
- **package**: Positive numbers (12.5, 8.0, 15.25)
- **status**: "Placed", "Not Placed", "Intern" (case insensitive)

### 5. **Download Fresh Template**

1. Go to Admin Dashboard
2. Click "Download CSV Template"  
3. Use the downloaded file as-is to test
4. If template works, compare with your data

---

## Debugging Process

### Step 1: Check Backend Logs
1. Open terminal where backend is running
2. Upload your CSV file
3. Look for console logs showing:
   - CSV content preview
   - Parsed data
   - Validation errors for specific rows

### Step 2: Identify the Problem
Look for patterns in the logs:
```
Row 1 validation errors: ['Invalid status: placed']
```
This tells you exactly what's wrong with row 1.

### Step 3: Fix Your CSV
Based on the error messages, fix your CSV file:
- Fix column names if they don't match exactly
- Remove extra characters from numbers
- Fix status values
- Remove empty rows

### Step 4: Test Again
Upload the corrected CSV file.

---

## Common CSV Issues

### **Wrong Column Names**
```csv
❌ Year,Name,Department,Company,Salary,Placement
✅ batchYear,studentName,branch,company,package,status
```

### **Invalid Status Values**
```csv
❌ status: "Yes", "No", "Internship", "Job"
✅ status: "Placed", "Not Placed", "Intern"
```

### **Invalid Package Format**
```csv
❌ package: "₹12.5 LPA", "12,50,000", "12.5L"
✅ package: "12.5", "8.0", "15.25"
```

### **Invalid Year Format**
```csv
❌ batchYear: "2023-24", "23", "2024 batch"
✅ batchYear: "2024", "2023", "2022"
```

---

## Test Files

### **Minimal Test (should work):**
```csv
batchYear,studentName,branch,company,package,status
2024,Test Student,Computer Science,Test Company,10.0,Placed
```

### **Common Errors Test:**
```csv
batchYear,studentName,branch,company,package,status
abc,Test Student,Computer Science,Test Company,10.0,Placed
2024,,Computer Science,Test Company,10.0,Placed
2024,Test Student,Computer Science,Test Company,abc,Placed
2024,Test Student,Computer Science,Test Company,10.0,Invalid
```

This should show 4 validation errors with specific messages.

---

## Quick Fix Checklist

✅ **Column names match exactly**: batchYear, studentName, branch, company, package, status  
✅ **No empty cells**: All fields filled for each row  
✅ **Valid years**: 2000-2030  
✅ **Valid packages**: Numbers only (no currency symbols)  
✅ **Valid status**: "Placed", "Not Placed", or "Intern"  
✅ **No extra rows**: Remove empty rows at bottom  
✅ **UTF-8 encoding**: Save CSV in UTF-8 format  

---

## If Still Having Issues

1. **Share the exact error message** from backend logs
2. **Share first few rows** of your CSV file
3. **Check file encoding** - should be UTF-8
4. **Try the test file** provided above

The backend now provides detailed debugging information to help identify exactly what's wrong with each row!
