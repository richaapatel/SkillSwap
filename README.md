# SkillSwap

SkillSwap is a web platform where users can register skills they can teach and skills they want to learn, with the goal of allowing users to discover and exchange knowledge.

## Technology Stack
- **Frontend**: React + Vite, Bootstrap
- **Backend**: Node.js + Express
- **Database**: MongoDB using Mongoose

## Project Structure
The project is divided into two main parts:
- `client/`: Contains the React + Vite frontend application.
- `server/`: Contains the Node.js + Express backend application.

## How to Run

### Frontend (Client)
1. Open a terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Backend (Server)
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and add your `MONGO_URI`.
4. Start the Express development server using nodemon:
   ```bash
   npm run dev
   ```
