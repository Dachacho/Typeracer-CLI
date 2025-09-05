# Typeracer CLI

A simple CLI-based Typeracer game with leaderboards, built with Node.js, TypeScript, Express, and Prisma.

## Features

- Play typing races in your terminal
- Tracks your WPM (words per minute) and accuracy
- Stores results and displays a leaderboard
- No authentication required—just enter your username

## Getting Started

### Setup

#### 1. Clone the repository

```sh
git clone https://github.com/yourusername/typeracer.git
cd typeracer
```

#### 2. Install dependencies

For the backend:

```sh
cd backend
npm install
```

For the client:

```sh
cd ../client
npm install
```

#### 3. Set up the database

```sh
cd ../backend
npx prisma migrate dev --name init
```

#### 4. Start the backend server

```sh
npm run dev
```

The backend will run on [http://localhost:3000](http://localhost:3000).

#### 5. Start the CLI client

Open a new terminal window:

```sh
cd ../client
npm run dev
```

## Usage

1. Enter your username when prompted.
2. Type the displayed text as quickly and accurately as you can.
3. See your WPM and accuracy.
4. View the leaderboard to compare your results.

## Project Structure

```
typeracer/
  backend/   # Express API, Prisma models, SQLite DB
  client/    # CLI app (TypeScript, Inquirer, Axios)
```

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma (SQLite)
- Inquirer, Chalk, Ora (for CLI UX)
- Axios
