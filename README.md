# AI Product Buzz Feed

AI Product Buzz Feed is a web application for discovering and tracking new AI product launches and tech-related tools. The app collects product information, ranks each item by a buzz score, and gives users a clean dashboard where they can explore what is currently gaining attention.

The project is built as a full-stack web app using Next.js, TypeScript, Tailwind CSS, and Supabase. Supabase is used for authentication and database storage, while the frontend provides an interactive product feed with user-focused features like likes, saved items, feedback, and profiles.

## Features

- Browse AI products and tech launches in a ranked feed
- Sort products by buzz score, votes, and recent activity
- Filter products by source
- Search products by title or description
- User login and signup using Supabase authentication
- Email confirmation for new accounts
- Show/hide password option on the login form
- Like products and view like history
- Save products into “Drawers”
- Submit feedback from inside the app
- User profile support
- Modern dark purple UI theme
- Smooth animations using Framer Motion
- Supabase database integration

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Framer Motion
- Lucide React
- Vitest

## Database

The project uses Supabase for storing product and user-related data. The database includes tables for product information, ingest runs, user profiles, likes, drawers, saved drawer items, and feedback.

Supabase is also used for login and signup, including email confirmation for new users.

## Main Purpose

The goal of this project is to create a useful discovery platform where users can find trending AI products and keep track of the ones they care about. Instead of only showing a static list, the app lets users interact with the feed by liking items, saving them, and giving feedback.

## Running the Project Locally

To run the project on your laptop, clone the repository, install the dependencies, add the Supabase environment variables, and start the development server.

```bash
npm install
npm run dev
