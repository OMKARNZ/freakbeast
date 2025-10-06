FreakBeast Fitness Tracker (Android Application)
URL : https://freakbeast.vercel.app/
🚀 Project Overview
The FreakBeast Fitness Tracker is a modern, cross-platform Android application designed to help users manage their workout routines, track session performance, set and monitor personal fitness goals, and view detailed progress reports.

The application emphasizes a seamless user experience, real-time data synchronization, and robust performance through a modern, component-based architecture.

✨ Key Features
User Authentication: Secure sign-up, login, and profile management.

Workout Planner: Create, view, and edit flexible Weekly and Daily Routines, complete with detailed exercise parameters (sets, reps, weight, rest time).

Session Tracking: Start, log, and complete workout sessions in real-time, recording detailed Set Records (reps, weight used).

Goal Management: Set specific, measurable fitness goals (e.g., weight loss, strength gains) and visualize progress towards targets.

Progress Reporting: View historical summaries of workout performance and download comprehensive PDF Progress Reports.

Profile & Health: Calculate and display BMI, track user statistics, and edit account information.

Configuration: Customization options, including Light/Dark Mode theme switching and notification management.

🛠️ Technology Stack
The application is built using a modern, scalable MERN-adjacent stack focused on performance and type safety.

Component

Technology

Role

Frontend (Client)

React

Core library for building the cross-platform Android UI.

Type System

TypeScript

Used end-to-end to enforce strict type checking and enhance code predictability.

Styling/UI

Tailwind CSS / shadcn-ui

Utility-first CSS framework and component library for responsive, efficient styling.

Backend / API

Node.js (Supabase Edge Functions)

Serverless environment used to execute complex business logic (e.g., Goal updates, PDF generation).

Database & Auth

Supabase (PostgreSQL)

Provides PostgreSQL database, real-time subscriptions, secure JWT-based authentication, and Row Level Security (RLS).

📐 Architecture and Structure
The system employs a clear separation of concerns, dividing functionality into three primary layers:

Client Layer (React/TypeScript): Handles all user interactions, state management, and view rendering.

Logic Layer (Node.js Edge Functions): Executes complex business rules, such as calculating progress updates, validating routines, and generating reports.

Data Persistence Layer (Supabase): Manages the PostgreSQL database, ensuring data integrity for all routines, goals, and session logs.

The client communicates with the backend exclusively through secure, authenticated API calls managed by Supabase.

⚙️ Development Setup
To set up the project locally, ensure you have Node.js (version 18+) and npm installed.

Prerequisites
Node.js & npm: Required for running the React/TypeScript environment.

Supabase Project: You must have a hosted Supabase instance with the necessary tables (users, session_log, goal, etc.) configured.

Local Installation
Clone the repository and install dependencies:

# Clone the repository
git clone [https://github.com/OMKARNZ/freakbeast.git](https://github.com/OMKARNZ/freakbeast.git)
cd freakbeast

# Install dependencies
npm install

# Configure environment variables
# Create a .env file in the root directory and add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start the development server
npm run dev

The application will typically be available in your browser at http://localhost:5173.

🧑‍💻 Coding Details and Efficiency
The code is optimized for maintainability and performance. Key development practices include:

Modular React Components: All major screens and UI elements are built as reusable, functional components, reducing duplication and promoting faster development cycles.

Strict Type Enforcement: TypeScript is used across the entire codebase (frontend and Node.js functions) to ensure data flowing between layers adheres to defined contracts, preventing runtime errors.

Optimized Data Handling: Client-side caching is utilized to minimize redundant API calls, ensuring a fast and responsive user interface, particularly when navigating between screens like the Dashboard and Profile.

📄 Licensing
This project is open source and available under the MIT License.
