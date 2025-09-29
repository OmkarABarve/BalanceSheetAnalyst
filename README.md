# Balance Sheet Analyst

A React application for analyzing balance sheets with Supabase integration.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update the Supabase URL and API key in `.env`

3. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from the project settings
   - Update the values in `.env`

4. **Install Tailwind CSS (if not already included):**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

5. **Configure Tailwind:**
   Update `tailwind.config.js`:
   ```js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

## Features

- User authentication with Supabase
- Dashboard for balance sheet analysis
- Profile management
- Responsive design with Tailwind CSS

## Project Structure

```
project-root/
│── .env                      # Environment variables
│── package.json
│── tsconfig.json
│── vite.config.ts
│
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # App routes
│   │
│   ├── lib/
│   │   └── supabaseClient.ts # Supabase initialization
│   │
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   │
│   ├── services/
│   │   └── userService.ts   # Authentication services
│   │
│   ├── hooks/
│   │   └── useAuth.ts       # Custom authentication hook
│   │
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Navbar.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── Profile.tsx
│   │
│   └── styles/
│       └── globals.css      # Global styles and Tailwind imports
│
└── public/
    └── index.html           # HTML template
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
