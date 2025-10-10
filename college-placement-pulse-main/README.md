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
