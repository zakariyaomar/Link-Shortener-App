# Link Shortener App

A full-stack URL shortener built with React, Vite, Express, PostgreSQL, Prisma, and Tailwind CSS.

![Sign-in screen](./docs/screenshots/login.png)

## Features

- Create an account and sign in with JWT authentication
- Create random or custom short links
- View, copy, and delete your links from one dashboard
- Redirect visitors from a short code to the original URL
- Track link clicks and recent click events
- Set optional link expiration dates
- Responsive Tailwind CSS interface

## Tech Stack

| Area | Technologies |
| --- | --- |
| Client | React, Vite, React Router, Tailwind CSS |
| Server | Node.js, Express, JWT, bcrypt |
| Database | PostgreSQL, Prisma ORM |

## Project Structure

```text
client/       React and Tailwind CSS application
server/       Express API, authentication, and link routes
prisma/       Prisma schema and database migrations
docs/         Project screenshots
```

## Prerequisites

- Node.js 20 or later
- npm
- A PostgreSQL database

## Setup

### 1. Install the client dependencies

```powershell
cd client
npm install
```

### 2. Install the server dependencies

```powershell
cd ..\server
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install --save-dev nodemon prisma
```

### 3. Configure the environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="use-a-long-random-secret"
PORT=5000
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

Do not commit `.env` because it contains private database and JWT credentials.

### 4. Prepare the database

From the project root, run:

```powershell
npx prisma migrate deploy
npx prisma generate
```

### 5. Start the application

Open two terminals.

**API server**

```powershell
cd server
npm run dev
```

**React client**

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Commands

### Client

```powershell
cd client
npm run dev
npm run lint
npm run build
npm run preview
```

### Server

```powershell
cd server
npm run dev
npm start
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/links` | List the signed-in user's links |
| `POST` | `/api/links` | Create a short link |
| `DELETE` | `/api/links/:id` | Delete a short link |
| `GET` | `/:shortCode` | Redirect to the original URL |

Routes under `/api/links` require an `Authorization: Bearer <token>` header.

## Verification

Run the client checks before deployment:

```powershell
cd client
npm run lint
npm run build
```
