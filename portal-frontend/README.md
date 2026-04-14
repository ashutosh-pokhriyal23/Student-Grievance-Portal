# Student Grievance Portal - Frontend

A modern, fast, and professional React application for students to raise and track grievances at NIET College.

## Tech Stack
- **React 18 + Vite**: For a lightning-fast development experience.
- **Tailwind CSS v3**: Clean, custom design system.
- **React Router v6**: Seamless navigation.
- **Supabase**: Real-time data and storage.
- **Lucide React**: Beautiful iconography.
- **React Hot Toast**: Premium notification experience.

## Design Highlights
- **Premium Aesthetics**: Using Sora (headings) and DM Sans (body) fonts.
- **Dynamic Accent Colors**: Different themes for Departments vs Hostels.
- **Interactive Cards**: Soft shadows, hover lifts, and real-time upvote updates.
- **Responsive Layout**: Optimized for mobile, tablet, and desktop.

## Prerequisites
- Node.js 18+

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase project URL and Anon Key.
4. Start the development server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/api`: Axios instances and backend communication.
- `src/components`: Reusable UI elements (cards, forms, badges).
- `src/pages`: Main application views (Dashboard, Space, Detail).
- `src/lib`: External client initializations (Supabase).
- `src/index.css`: Global styles and design system tokens.
