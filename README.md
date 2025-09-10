# Simple Budget API

A Node.js/Express API for personal budget tracking with user authentication and expense management.

## Features

- **User Authentication** - Register and sign in with email/password
- **Category Management** - Create and manage expense/income categories
- **Transaction Tracking** - Record and track financial transactions
- **User-Specific Data** - Each user only sees their own data
- **RESTful API** - Clean, predictable endpoints

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: Basic Auth with bcrypt password hashing
- **Deployment**: Railway (cloud hosting)

## API Base URL

```
https://your-app-name.railway.app
```

## Authentication

All protected endpoints require Basic Authentication. Include the Authorization header:

```
Authorization: Basic <base64-encoded-email:password>
```

### Example Token Generation (Frontend)

```javascript
const email = 'user@example.com';
const password = 'password123';
const credentials = `${email}:${password}`;
const token = `Basic ${btoa(credentials)}`;
```

## API Endpoints

### Authentication Endpoints

#### POST /api/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "joined": "2024-01-15T10:30:00.000Z"
}
```

#### POST /api/signin

Sign in with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "joined": "2024-01-15T10:30:00.000Z"
}
```

### Category Endpoints

#### GET /api/categories

Get all categories for the authenticated user.

**Headers:** `Authorization: Basic <token>`

**Response:**

```json
[
  {
    "id": 1,
    "name": "Food",
    "user": 1
  },
  {
    "id": 2,
    "name": "Transportation",
    "user": 1
  }
]
```

#### POST /api/categories

Create a new category.

**Headers:** `Authorization: Basic <token>`

**Request Body:**

```json
{
  "name": "Entertainment"
}
```

**Response:**

```json
{
  "id": 3,
  "name": "Entertainment",
  "user": 1
}
```

#### GET /api/categories/:categoryId

Get a specific category by ID.

**Headers:** `Authorization: Basic <token>`

**Response:**

```json
{
  "id": 1,
  "name": "Food",
  "user": 1
}
```

#### PATCH /api/categories/:categoryId

Update a category name.

**Headers:** `Authorization: Basic <token>`

**Request Body:**

```json
{
  "name": "Updated Category Name"
}
```

**Response:** `204 No Content`

#### DELETE /api/categories/:categoryId

Delete a category.

**Headers:** `Authorization: Basic <token>`

**Response:** `202 Accepted`

### Transaction Endpoints

#### GET /api/transactions

Get all transactions for the authenticated user.

**Headers:** `Authorization: Basic <token>`

**Response:**

```json
[
  {
    "id": 1,
    "venue": "Grocery Store",
    "amount": "25.50",
    "comments": "Weekly groceries",
    "categoryId": 1
  },
  {
    "id": 2,
    "venue": "Gas Station",
    "amount": "45.00",
    "comments": "Fuel",
    "categoryId": 2
  }
]
```

#### POST /api/transactions

Create a new transaction.

**Headers:** `Authorization: Basic <token>`

**Request Body:**

```json
{
  "venue": "Coffee Shop",
  "amount": 4.5,
  "category_id": 1
}
```

**Response:**

```json
{
  "id": 3,
  "venue": "Coffee Shop",
  "amount": "4.50",
  "comments": null,
  "categoryId": 1
}
```

#### GET /api/transactions/:transactionId

Get a specific transaction by ID.

**Headers:** `Authorization: Basic <token>`

**Response:**

```json
{
  "id": 1,
  "venue": "Grocery Store",
  "amount": "25.50",
  "comments": "Weekly groceries",
  "categoryId": 1
}
```

#### PATCH /api/transactions/:transactionId

Update a transaction.

**Headers:** `Authorization: Basic <token>`

**Request Body:**

```json
{
  "venue": "Updated Venue",
  "amount": 30.0,
  "comments": "Updated description"
}
```

**Response:** `204 No Content`

#### DELETE /api/transactions/:transactionId

Delete a transaction.

**Headers:** `Authorization: Basic <token>`

**Response:** `202 Accepted`

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing 'name' in request body"
}
```

### 401 Unauthorized

```json
{
  "error": "Missing basic token"
}
```

### 404 Not Found

```json
{
  "error": {
    "message": "Transaction does not exist"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "message": "server error"
  }
}
```

## Database Schema

### Users Table

- `id` (Primary Key)
- `name` (VARCHAR 50)
- `email` (TEXT, Unique)
- `joined` (TIMESTAMP)

### Login Table

- `id` (Primary Key)
- `email` (TEXT, Foreign Key to Users)
- `hash` (VARCHAR 100, Bcrypt password hash)

### Categories Table

- `id` (Primary Key)
- `name` (VARCHAR 50)
- `user_id` (Foreign Key to Users)

### Transactions Table

- `id` (Primary Key)
- `venue` (VARCHAR 50)
- `amount` (DECIMAL 10,2)
- `comments` (TEXT, Optional)
- `category_id` (Foreign Key to Categories)
- `user_id` (Foreign Key to Users)

## Setup

### Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up PostgreSQL database
4. Set environment variables:
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost/database_name"
   export NODE_ENV="development"
   ```
5. Start the application: `npm run dev`

### Deployment (Railway)

1. Push code to GitHub
2. Connect Railway to your GitHub repository
3. Add PostgreSQL database in Railway
4. Set environment variables in Railway dashboard
5. Deploy automatically

## Scripts

- `npm start` - Start the application
- `npm run dev` - Start with nodemon for development
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run prettier` - Format code

## Example Frontend Usage

```javascript
// Register a new user
const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
};

// Sign in
const signIn = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Create a category (requires authentication)
const createCategory = async (name, token) => {
  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ name }),
  });
  return response.json();
};

// Create a transaction (requires authentication)
const createTransaction = async (venue, amount, category_id, token) => {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ venue, amount, category_id }),
  });
  return response.json();
};
```
