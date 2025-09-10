# Typeracer CLI

A simple CLI-based Typeracer game with leaderboards, built with Node.js, TypeScript, Express, and Prisma.

## Features

- **Singleplayer:** Race against the clock and compete with the leaderboard.
- **Multiplayer Rooms:** Create or join real-time races with friends in your terminal.
- **Live Notifications:** See when other users join your room.
- **Synchronized Countdown:** All players start at the same time.
- **Tracks WPM and Accuracy:** Get instant feedback on your performance.
- **Room and Global Leaderboards:** See results for each race and overall.
- **Post-Race Menu:** Play again, view leaderboard, or quit—no need to restart the app.
- **No Authentication Required:** Just enter your username and play.

## Features to be Added

- [ ] **Multiple Rounds:** Play several rounds in a row and track average stats.
- [ ] **Custom Texts:** Let users add their own texts to the database.
- [ ] **Timed Mode:** Type as much as possible in a set time.
- [ ] **Export Results:** Export your results as CSV or JSON.
- [ ] **Spectator Mode:** Watch ongoing races.
- [ ] **Chat:** In-room chat for players.

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

---

_you will have to seed your own data for texts_
