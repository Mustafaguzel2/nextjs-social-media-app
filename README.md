# NextJS Social Media App

A modern, feature-rich social networking application built with Next.js, Prisma, and TypeScript. This project leverages cutting-edge web technologies to deliver a fast, responsive, and scalable social media platform.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

NextJS Social Media App serves as a comprehensive social networking solution where users can create posts, interact with content, follow peers, and explore trending topics. With robust APIs, seamless authentication, and dynamic rendering, this application is optimized for both performance and scalability.

## Features

- **Dynamic Routing & Server Components:** Built with Next.js App Router using dynamic APIs for posts, comments, search, and user feeds.
- **Authentication & Authorization:** Secure user authentication implemented using Lucia and Google OAuth integration.
- **Real-Time Interactions:** Integration with Stream Chat for live messaging capabilities.
- **Responsive Design:** Mobile-first design with Tailwind CSS for a consistent experience across devices.
- **Database Integration:** Uses Prisma as an ORM for streamlined database interactions.
- **Robust API Endpoints:** APIs for posts, comments, user feeds, and search functionality.
- **State Management & Data Fetching:** Efficient data fetching and caching using React Query.

## Technologies

- **Next.js 15.x** – SSR & API Routes
- **TypeScript** – Strict type support
- **Prisma** – Database ORM & migrations
- **Lucia Auth** – Secure Authentication
- **Tailwind CSS** – Utility-first CSS framework
- **React Query** – Data fetching & caching
- **Stream Chat** – Real-time chat integration

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- A supported relational database (PostgreSQL, MySQL, etc.)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mustafaguzel2/nextjs-social-media-app.git
   cd nextjs-social-media-app
   ```

2. **Install Dependencies**

   If you encounter peer dependency issues, use the following command:
   ```bash
   npm install --legacy-peer-deps
   ```
   Alternatively, if dependencies have been fixed and updated, a regular install might work:
   ```bash
   npm install
   ```

3. **Setup Environment Variables**

   Create a `.env` file in the root directory and configure the following variables:
   ```
   DATABASE_URL=your_database_connection_url
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   # Add any other environment variables required by your app
   ```

4. **Run Database Migrations**

   After configuring your database, run:
   ```bash
   npx prisma migrate dev
   ```

5. **Run the Development Server**

   Start the app:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## Environment Variables

Ensure all required environment variables are defined. Some key variables include:
- `DATABASE_URL` – Your database connection string.
- `STREAM_API_KEY` and `STREAM_API_SECRET` – Credentials for the Stream Chat API.
- Additional secrets needed for authentication and other integrations.

## Database Setup

This project uses Prisma as its ORM. After setting your `DATABASE_URL`, generate the Prisma client and run migrations:

## Deployment

This project is optimized for deployment on Vercel. For a production build, ensure you:
- Run `npm run build` locally.
- Address any peer dependency issues using `npm install --legacy-peer-deps` if necessary.
- Update any vulnerable packages using `npm audit fix` or `npm audit fix --force` after thorough local testing.
- Connect your repository to Vercel and set the appropriate environment variables in the Vercel dashboard.

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Lucia Auth](https://lucia-auth.com/)
- [Stream Chat API](https://getstream.io/chat/)
- Special thanks to the community and contributors who make open source projects possible.
