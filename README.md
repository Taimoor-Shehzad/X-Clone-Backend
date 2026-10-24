# X-Clone Backend

A Node.js + Express backend for a social media application inspired by X (formerly Twitter). The service handles user authentication, profile management, follow relationships, post creation, comments, likes, and notifications, while persisting data in MongoDB and storing uploaded images in Cloudinary.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Clerk for authentication
- Cloudinary for image uploads
- Arcjet for request protection
- Vercel-ready deployment configuration

## Features

- User sync and profile management with Clerk
- Public user profile lookup
- Follow/unfollow capability
- Post creation, retrieval, likes, and user-specific feed
- Commenting on posts
- Notification generation for follows, likes, and comments
- Image upload support for profile/banner and post media
- CORS enabled and production-safe server setup

## Project Structure

```bash
.
├── src
│   ├── config
│   │   ├── arcjet.js
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── env.js
│   ├── controllers
│   │   ├── comment.controller.js
│   │   ├── notification.controller.js
│   │   ├── post.controller.js
│   │   └── user.controller.js
│   ├── middleware
│   │   ├── arcjet.middleware.js
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── models
│   │   ├── comment.model.js
│   │   ├── notification.model.js
│   │   ├── post.model.js
│   │   └── user.model.js
│   ├── routes
│   │   ├── comment.route.js
│   │   ├── notification.route.js
│   │   ├── post.route.js
│   │   └── user.route.js
│   └── server.js
├── .gitignore
├── package.json
├── package-lock.json
├── vercel.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Clerk account and API keys
- Cloudinary account
- ArcJet credentials (optional but configured)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/x-clone

ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the App

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The app starts from `src/server.js` and exposes the API on the configured port.

## API Overview

### Users

- `GET /api/users/profile/:username` — Get public profile by username
- `PUT /api/users/profile` — Update profile and upload banner/profile image
- `POST /api/users/sync` — Sync authenticated Clerk user data
- `GET /api/users/me` — Get current user
- `POST /api/users/follow/:targetUserId` — Follow a user
- `GET /api/users` — List users

### Posts

- `GET /api/posts` — Get all posts
- `GET /api/posts/:postId` — Get a single post
- `GET /api/posts/user/:username` — Get posts for a specific user
- `POST /api/posts` — Create a new post with optional image
- `POST /api/posts/:postId/like` — Like or unlike a post
- `DELETE /api/posts/:postId` — Delete a post

### Comments

- `GET /api/comments/post/:postId` — Get comments for a post
- `POST /api/comments/post/:postId` — Create a comment
- `DELETE /api/comments/delete/:commentId` — Delete a comment

### Notifications

- `GET /api/notifications` — Fetch notifications for the current user
- `DELETE /api/notifications/:notificationId` — Delete a notification

## Authentication

Authentication is handled with Clerk via `@clerk/express`. Protected routes use `protectRoute` middleware to ensure only authenticated users can access user-specific endpoints.

## Media Uploads

Uploads are managed with Multer and stored using Cloudinary. The middleware restricts uploaded files to images up to 5MB.

## Deployment

This project includes a `vercel.json` configuration for deployment on Vercel. The server entry point is:

```bash
src/server.js
```

## Notes

- The app is configured as an ES module (`"type": "module"`).
- The project is organized in a classic MVC-style backend structure with routes, controllers, models, and middleware.
- ArcJet middleware is present but currently commented out in `src/server.js`, which suggests it may be enabled later for rate limiting or bot protection.

## License

This project is licensed under the ISC license.
