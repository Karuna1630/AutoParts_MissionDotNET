# AutoParts Mission

AutoParts Mission is a full-stack vehicle and auto parts management system built with ASP.NET Core and React. It supports customer self-service, staff operations, and admin workflows for managing vehicles, appointments, inventory, vendors, invoices, notifications, and reporting.

## Project Structure

- `Backend/` - ASP.NET Core Web API, application services, domain models, and infrastructure.
- `Frontend/` - Vite + React dashboard application.
- `README.md` - Project overview and local run instructions.

## Main Features

- Customer account, vehicle, and appointment management
- Staff workflows for appointments, part requests, orders, and sales invoices
- Admin dashboards for staff, inventory, vendors, and financial analytics
- JWT authentication and role-based authorization
- PostgreSQL persistence with Entity Framework Core
- Image upload support and notification processing

## Prerequisites

Install the following before running the app:

- .NET 9 SDK
- Node.js 18+ or 20+
- PostgreSQL

## Configuration

Backend settings are read from `Backend/WebAPI/appsettings.json` and environment variables.

At minimum, verify the following values before starting the API:

- Database connection string
- JWT settings
- CORS allowed origins
- SMTP settings if email notifications are needed
- Cloudinary settings if image uploads are used


## How To Run

### 1. Start the backend API

From the repository root:

```powershell
cd Backend/WebAPI
dotnet restore
dotnet run
```

The API will start on the configured local ASP.NET Core port, and Swagger is available in development mode.

### 2. Start the frontend

Open a second terminal from the repository root:

```powershell
cd Frontend
yarn install
yarn dev
```

If you prefer npm, you can use:

```powershell
npm install
npm run dev
```

The frontend runs on Vite, typically at `http://localhost:5173`.

## Notes

- The backend targets `.NET 9`.
- The frontend expects the API to be available locally before making authenticated requests.
- If you change the frontend port, make sure the backend CORS settings allow that origin.
- If the API cannot connect to PostgreSQL, check the connection string and confirm the database is running.

## Useful Commands

Backend:

```powershell
cd Backend/WebAPI
dotnet run
```

Frontend:

```powershell
cd Frontend
yarn dev
```
\