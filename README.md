# SkillSwap

SkillSwap is a full-stack knowledge-sharing platform where people can list the skills they offer, identify the skills they want to learn, discover other members, and coordinate skill exchanges through authenticated requests.

The application includes a React frontend, an Express REST API, and a MongoDB database managed with Mongoose.

## Features

- User registration and login with JWT authentication
- Protected routes and authenticated session restoration
- Profile creation and editing with public/private data separation
- Browse, search, filter, and create global skills
- Add and remove skills from offered and wanted lists
- Discover users by name, offered skill, or wanted skill
- Paginated user discovery
- Public user profiles with offered and wanted skills
- Backend-generated skill matching with match scores and two-way match information
- Dashboard overview of profile activity, skills, matches, and exchange requests
- Exchange request workflow:
  - Request to learn a skill
  - Optional learner message
  - Accept or reject incoming requests
  - Mark accepted exchanges as completed
- Consistent loading, error, empty, and success states
- Backend validation for malformed input, invalid IDs, authorization, duplicate records, and invalid exchange transitions
- Password requirements enforced on both frontend and backend

## Technology Stack

### Frontend

- React 19
- React Router
- Vite
- Bootstrap and Bootstrap Icons
- Custom responsive CSS design system

### Backend

- Node.js
- Express 5
- Mongoose
- MongoDB
- JSON Web Tokens
- bcryptjs
- dotenv
- CORS

## Project Structure

```text
SkillSwap/
├── client/
│   ├── public/
│   └── src/
│       ├── components/       # Shared UI components
│       ├── context/          # Authentication context
│       ├── pages/            # Application pages
│       ├── routes/           # Frontend route definitions
│       ├── services/         # Centralized API service
│       ├── App.jsx
│       └── index.css
├── server/
│   ├── src/
│   │   ├── config/           # Database configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Authentication middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # REST API routes
│   │   ├── utils/            # Tokens and validation helpers
│   │   ├── app.js            # Express app configuration
│   │   └── server.js         # Environment loading and startup
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

Install the following before starting the project:

- Node.js `20.19+` or `22.12+`
- npm
- MongoDB running locally or an accessible MongoDB deployment

The default local database configuration is:

```text
mongodb://localhost:27017/skillswap
```

If the backend runs in WSL, Docker, or another isolated environment while MongoDB runs elsewhere, `localhost` may refer to the backend environment rather than the machine running MongoDB. In that case, use a MongoDB host address reachable from the backend environment.

## Environment Configuration

### Backend

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Configure the values without committing secrets:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

`JWT_SECRET` must be kept private and should not be committed to source control.

### Frontend

The frontend defaults to `http://localhost:5000/api`. To use a different backend URL, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation and Development

Install dependencies in both application folders:

```bash
cd server
npm install

cd ../client
npm install
```

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

The default development URLs are:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API health check: `http://localhost:5000/api/health`

## Production Commands

Build the frontend:

```bash
cd client
npm run build
```

Preview the production frontend build:

```bash
npm run preview
```

Start the backend without nodemon:

```bash
cd server
npm start
```

Run frontend linting:

```bash
cd client
npm run lint
```

## Frontend Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | User login |
| `/register` | Public | Account registration |
| `/skills` | Public/authenticated | Browse and manage skills |
| `/discover` | Public/authenticated | Discover other members |
| `/users/:userId` | Public | View a public user profile |
| `/dashboard` | Authenticated | View matches, skills, and request activity |
| `/exchanges` | Authenticated | Manage received and sent exchange requests |
| `/profile` | Authenticated | View and edit the current profile |

Unauthenticated users attempting to access protected pages are redirected to `/login`.

## Main User Workflow

1. Register with a valid name, email, and password.
2. Browse the shared skill library.
3. Add skills to the offered and wanted lists.
4. Complete the profile bio so other members understand the learning context.
5. Use Discover or the dashboard to find compatible members.
6. Open a public profile or use the request action on a user card.
7. Select one of the member's offered skills and optionally include a message.
8. Track the request under Requests.
9. The teacher can accept or reject a pending request.
10. Participants can mark an accepted exchange as completed.

## Password Requirements

Registration passwords must:

- Contain at least 8 characters
- Include at least one uppercase letter
- Include at least one lowercase letter
- Include at least one number
- Include at least one special character
- Contain no more than 128 characters

These rules are checked in the registration UI and enforced again by the backend. Passwords are hashed with bcryptjs and are never stored or returned as plaintext.

## API Reference

All API routes are prefixed with `/api`.

Authenticated endpoints require:

```http
Authorization: Bearer <jwt-token>
```

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Verify that the Express application is running |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user and return a JWT |
| `POST` | `/api/auth/login` | Authenticate a user and return a JWT |
| `GET` | `/api/auth/me` | Return the authenticated user |

Registration and login use JSON bodies. Registration accepts `name`, `email`, and `password`.

### Skills

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/skills` | Public | List skills; supports `search` and `category` query parameters |
| `GET` | `/api/skills/:id` | Public | Get one skill |
| `POST` | `/api/skills` | Authenticated | Create a global skill using `name`, `description`, and `category` |

### Users and Profiles

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | Public | Discover users |
| `GET` | `/api/users/:userId` | Public | Get a public user profile |
| `GET` | `/api/users/me` | Authenticated | Get the current user's profile |
| `PUT` | `/api/users/me` | Authenticated | Update the current user's `name` and/or `bio` |
| `GET` | `/api/users/me/skills` | Authenticated | Get offered and wanted skills |
| `POST` | `/api/users/me/skills/offered/:skillId` | Authenticated | Add an offered skill |
| `DELETE` | `/api/users/me/skills/offered/:skillId` | Authenticated | Remove an offered skill |
| `POST` | `/api/users/me/skills/wanted/:skillId` | Authenticated | Add a wanted skill |
| `DELETE` | `/api/users/me/skills/wanted/:skillId` | Authenticated | Remove a wanted skill |

User discovery supports:

- `search`: Search by name
- `offeredSkill`: Filter by an offered skill ID
- `wantedSkill`: Filter by a wanted skill ID
- `page`: Positive page number
- `limit`: Page size from 1 to 50

### Matches

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/matches` | Authenticated | Return backend-generated matches for the current user |

The response includes candidate users, matching skills, a match score, two-way match information, and pagination. An optional `skillId` filter can restrict results to one skill the current user wants to learn.

### Exchanges

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/exchanges` | Authenticated | Create a learning request |
| `GET` | `/api/exchanges/sent` | Authenticated | List requests sent by the current user |
| `GET` | `/api/exchanges/received` | Authenticated | List requests received by the current user |
| `GET` | `/api/exchanges/:exchangeId` | Authenticated | View an exchange as a participant |
| `PATCH` | `/api/exchanges/:exchangeId/accept` | Teacher only | Accept a pending request |
| `PATCH` | `/api/exchanges/:exchangeId/reject` | Teacher only | Reject a pending request |
| `PATCH` | `/api/exchanges/:exchangeId/complete` | Participant | Mark an accepted exchange as completed |

Create an exchange request with:

```json
{
  "teacherId": "<user-id>",
  "skillId": "<offered-skill-id>",
  "message": "Optional message"
}
```

The learner is always taken from the authenticated JWT. The backend verifies that:

- The teacher exists
- The teacher offers the selected skill
- The learner is not requesting from themselves
- A duplicate pending request does not already exist
- Only authorized participants can view or update an exchange

Exchange statuses are `pending`, `accepted`, `rejected`, and `completed`.

## Data Models

### User

Stores a user's name, email, bcrypt password hash, bio, offered skills, wanted skills, and timestamps.

### Skill

Stores a global skill name, optional description, optional category, and timestamps.

### Exchange

Stores the teacher, learner, skill, optional message, status, and timestamps. Teacher, learner, and skill are references to their respective collections.

## Validation and Security

- Passwords are hashed with bcryptjs.
- JWTs are used for authenticated API requests.
- Protected resources derive the current user from the verified JWT.
- Public responses exclude passwords and private account information where appropriate.
- Invalid IDs, malformed input, duplicate records, and invalid status transitions return controlled API errors.
- Exchange authorization is enforced on the backend rather than relying on frontend controls.
- Sensitive values such as `.env` files and JWT secrets should never be committed.

## Testing and Verification

The project does not currently include a full automated integration-test suite. The available checks are:

```bash
# Frontend lint
cd client
npm run lint

# Frontend production build
npm run build

# Backend syntax check
cd ../server
for file in $(rg --files src -g '*.js'); do node --check "$file" || exit 1; done
```

For end-to-end API testing, ensure MongoDB is running and reachable through `MONGO_URI`, start the backend, and verify:

```bash
curl http://localhost:5000/api/health
```

## Troubleshooting

### MongoDB connection refused

If the backend reports `ECONNREFUSED 127.0.0.1:27017`:

1. Confirm that MongoDB is running.
2. Confirm that it is listening on port `27017`.
3. Confirm that the database URI uses the `skillswap` database: `mongodb://localhost:27017/skillswap`.
4. If the backend runs in WSL, Docker, or a virtualized environment, use a host address reachable from that environment instead of assuming `localhost` is shared.

### Frontend cannot reach the API

Confirm that the backend is running and that `client/.env` contains the correct `VITE_API_URL`. Restart the Vite development server after changing environment variables.

## License

This project is intended for educational and project-development use. Add the applicable license information here before distributing the application publicly.
