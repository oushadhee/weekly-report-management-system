# Weekly Report Management System

## Overview

Weekly Report Management System is a full-stack application for managing weekly team reports. It includes:
- A backend API built with Node.js, Express, TypeScript, MongoDB, and JWT authentication.
- A frontend application built with React, TypeScript, React Router, Tailwind CSS, and Axios.

The system supports two user roles:
- `team_member`: create, edit, delete, and submit weekly reports.
- `manager`: manage projects, review team reports, view dashboard metrics, and monitor submission status.

## Key Features

### Team Member
- Register and log in using email and password.
- Create new weekly reports with tasks completed, planned tasks, blockers, hours, and notes.
- Edit or delete draft/late reports.
- Submit reports for review.
- View personal report history and current report status.
- Access profile and team dashboard pages.

### Manager
- View all team reports with filters for week, project, user, and status.
- Create, update, and delete projects.
- Assign team members to projects.
- Monitor dashboard statistics such as total reports, submitted reports, late reports, blockers, and compliance.
- View team members and report submission status.

## Project Structure

```
report-generator/
  backend/
    package.json
    tsconfig.json
    src/
      index.ts
      controllers/
      middleware/
      models/
      routes/
  frontend/
    package.json
    tsconfig.json
    src/
      App.tsx
      components/
      context/
      pages/
      utils/
```

## Backend Details

### Technology
- Node.js
- Express
- TypeScript
- MongoDB / Mongoose
- JWT authentication with cookies
- Input validation with express-validator
- Security middleware: helmet, cors, cookie-parser

### Main Backend Routes

- `POST /api/auth/register` - create a new user
- `POST /api/auth/login` - authenticate user and set cookie
- `GET /api/auth/me` - get authenticated user profile
- `GET /api/reports` - get reports for current user
- `POST /api/reports` - create a report
- `GET /api/reports/:id` - get report details by id
- `PUT /api/reports/:id` - update report by id
- `DELETE /api/reports/:id` - delete report by id
- `PUT /api/reports/:id/submit` - submit report
- `GET /api/projects` - get all projects
- `POST /api/projects` - create a project (`manager` only)
- `PUT /api/projects/:id` - update a project (`manager` only)
- `DELETE /api/projects/:id` - delete project (`manager` only)
- `PUT /api/projects/:id/assign` - assign team members to a project (`manager` only)
- `GET /api/manager/reports` - get team reports (`manager` only)
- `GET /api/manager/dashboard` - manager dashboard stats (`manager` only)
- `GET /api/manager/members` - get team members (`manager` only)
- `GET /api/manager/submission-status` - weekly submission status (`manager` only)

### Backend Environment Variables

Create a `.env` file in `report-generator/backend` with:

```env
MONGODB_URI=mongodb://localhost:27017/weekly-report-db
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

> If you use MongoDB Atlas, replace `MONGODB_URI` with your cluster connection string.

## Frontend Details

### Technology
- React
- TypeScript
- React Router DOM
- Axios
- Tailwind CSS
- React Context for authentication

### Main Frontend Pages

- `/login` - login page
- `/register` - account registration
- `/dashboard` - team member dashboard
- `/create-report` - report creation form
- `/my-reports` - list of personal reports
- `/edit-report/:id` - edit a draft or late report
- `/report-history` - team member report history
- `/profile` - user profile page
- `/manager/dashboard` - manager dashboard overview
- `/manager/all-reports` - manager report review page
- `/manager/projects` - project management page
- `/manager/charts` - charts and metrics page
- `/manager/team-members` - team member listing

### Frontend Configuration

The frontend reads API settings from `report-generator/frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5002/api
```

If you run the backend on another port, update this value accordingly.

## Installation

### Backend

```bash
cd report-generator/backend
npm install
```

### Frontend

```bash
cd report-generator/frontend
npm install
```

## Running the App

### Start Backend

```bash
cd report-generator/backend
npm run dev
```

This starts the backend server with `nodemon` and TypeScript support.

### Start Frontend

```bash
cd report-generator/frontend
npm start
```

This runs the React app in development mode at `http://localhost:3000`.

## Build

### Backend Build

```bash
cd report-generator/backend
npm run build
npm start
```

### Frontend Build

```bash
cd report-generator/frontend
npm run build
```

## Authentication & Authorization

- Authentication is handled by JWT tokens stored in HTTP-only cookies.
- Protected routes require authentication using the backend `protect` middleware.
- Manager-only routes require the `manager` role via the `authorize('manager')` middleware.

## Report Workflow

- Team members create weekly reports with week range, project, completed/planned tasks, blockers, hours, and notes.
- Reports start as `draft`.
- Draft or `late` reports can be edited or deleted by the owner.
- Submitted reports are locked and cannot be edited or deleted.
- Managers can view all submitted and late reports and track team submission status.

## Notes

- The backend uses `mongoose` models for `User`, `Project`, and `Report`.
- Reports are linked to projects and users using MongoDB references.
- Managers can manage projects and assign team members.
- The React frontend uses a secure auth flow with `axios.defaults.withCredentials = true`.

## Contributing

If you want to improve this project, you can:
- add better validation and error handling
- improve the UI layout and accessibility
- add pagination and search for reports
- add role-based access controls on the frontend
- add unit and integration tests

## License

This project does not include a license file. Add one if you want to share or publish it.
