# Frontend setup

This frontend is configured with:

- React + Vite
- Tailwind CSS
- React Router
- Axios (centralized API client)
- React Icons

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   copy .env.example .env
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

## Structure

- `src/App.jsx` - main app layout
- `src/services/api.js` - axios instance and auth header helper
