# Reading Tracker

A modern web application to track your reading progress, organize your book collection, and take notes on your reading journey.

![Reading Tracker Screenshot](/public/screenshot.png)

## Features

- 📚 Add and manage your book collection
- 📊 Track reading progress with visual indicators
- 📝 Take notes for each book
- 📱 Responsive design that works on all devices
- 🔐 Secure authentication system
- 🏷️ Categorize books by genre and status
- 📊 View reading statistics and insights

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **UI Components**: Headless UI, Hero Icons
- **Form Handling**: React Hook Form
- **State Management**: React Context API

## Prerequisites

- Node.js 18 or later
- MongoDB database (local or cloud)
- npm or yarn

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/reading-tracker.git
   cd reading-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.template` to `.env.local`
   - Update the environment variables with your configuration

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# File Upload (for production, use a cloud storage service)
UPLOAD_DIR=./public/uploads
```

## Project Structure

```
reading-tracker/
├── app/                    # App router
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   └── ...
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
│   ├── auth.ts             # Authentication configuration
│   ├── db.ts               # Database connection
│   └── models/             # Database models
├── public/                 # Static files
└── types/                  # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Other Platforms

You can also deploy to other platforms that support Node.js applications. Make sure to set up the required environment variables in your hosting provider.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
