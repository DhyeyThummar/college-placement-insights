# 🔑 Key Management Quick Reference

## Current Admin Keys

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

## Quick Commands

### List All Keys
```bash
cd server
node manageKeys.cjs list
```

### Update a Key
```bash
node manageKeys.cjs update <collegeId> <newKey>
# Example: node manageKeys.cjs update 1 IIT_DELHI_2025
```

### Add New College
```bash
node manageKeys.cjs add <collegeId> "<collegeName>" <adminKey>
# Example: node manageKeys.cjs add 9 "IIT Roorkee" IIT_ROORKEE_2024
```

### Toggle Key Status
```bash
node manageKeys.cjs toggle <collegeId>
# Example: node manageKeys.cjs toggle 1
```

### Export All Keys
```bash
node manageKeys.cjs export
```

## Manual Key Management

### Edit JSON File
1. Open `server/admin-keys.json`
2. Modify keys as needed
3. Run: `node loadManualKeys.cjs`

### Key Format Recommendations
- Use descriptive names: `IIT_DELHI_2024`
- Include year for versioning: `_2024`, `_2025`
- Use underscores for readability
- Keep consistent naming pattern

## Admin Signup Process
1. Go to `/auth` page
2. Click "Sign Up" tab
3. Fill form with college details
4. Use the admin key from the table above
5. Sign in after successful registration

---
**Last Updated**: September 18, 2025
