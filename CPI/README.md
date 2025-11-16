# College Placement Pulse

A modern React + Vite + TypeScript dashboard for college placement insights.

## Backend (Express + MongoDB)

This project includes a Node.js/Express backend with MongoDB for authentication, CSV uploads, and placement insights APIs.

### Setup

1. Create `.env` in project root with:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/college-placement-insights
JWT_SECRET=change_me
CORS_ORIGIN=http://localhost:5173
ADMIN_PREAPPROVED_KEY=your_preapproved_key_here
```

2. Install dependencies:

```
npm install
```

3. Run backend in dev mode:

```
npm run server:dev
```

4. Run frontend:

```
npm run dev
```

### API Endpoints

- POST `/api/user/signup`
- POST `/api/user/login`
- POST `/api/admin/signup` (requires `preApprovedKey` matching `ADMIN_PREAPPROVED_KEY`)
- POST `/api/admin/login`
- POST `/api/admin/upload` (multipart `file`; admin JWT required)
- GET `/api/placements/:collegeId`
- GET `/api/placements/:collegeId/stats`

CSV columns: `batchYear,studentName,branch,company,package,status`

Preview of Project :


<img width="1440" height="716" alt="Screenshot 2025-11-15 at 11 58 24 AM" src="https://github.com/user-attachments/assets/1e4ab509-6778-46f7-ab24-56a3b51d3955" />


<img width="1440" height="757" alt="Screenshot 2025-11-15 at 11 59 29 AM" src="https://github.com/user-attachments/assets/c203fe58-d28f-414f-a7d9-5235bba36ffe" />
<img width="1439" height="778" alt="Screenshot 2025-11-15 at 11 59 45 AM" src="https://github.com/user-attachments/assets/e626ca2a-b99b-44a0-86c2-19ef3058f4c3" />
<img width="1045" height="768" alt="Screenshot 2025-11-15 at 12 00 25 PM" src="https://github.com/user-attachments/assets/8f72c4a8-9e28-492e-927a-180dc73e293c" />
<img width="1041" height="719" alt="Screenshot 2025-11-15 at 12 00 42 PM" src="https://github.com/user-attachments/assets/01ec2f9f-e8da-4c7e-9eca-a31992a1ec60" />
<img width="990" height="774" alt="Screenshot 2025-11-15 at 12 01 07 PM" src="https://github.com/user-attachments/assets/aa59ff3c-448b-4c28-bae9-5e8f860087d6" />
<img width="755" height="778" alt="Screenshot 2025-11-15 at 12 02 26 PM" src="https://github.com/user-attachments/assets/c9df58c5-9ed6-4d8a-80c8-567b6e82c614" />
<img width="1435" height="772" alt="Screenshot 2025-11-15 at 12 03 12 PM" src="https://github.com/user-attachments/assets/3206e1db-73c4-429b-9c1f-c9791749e1e8" />
<img width="1435" height="771" alt="Screenshot 2025-11-15 at 12 03 42 PM" src="https://github.com/user-attachments/assets/86081f14-e8dd-4143-bdcb-7b3971849d70" />












