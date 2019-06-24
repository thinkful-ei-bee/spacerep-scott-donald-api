# Spaced repetition API

This is the server side for the [Spaced Repetition Project](https://github.com/thinkful-ei-bee/spacerep-client-scott-donald).
Created by Scott Williams and Donald Sonn

## API Documentation

### POST /api/auth/token

Login route.
"username" and "password" required in body

### PUT /api/auth/token

Refreshes JWT

### GET /api/language

Returns language and words

### GET /api/language/head

Returns next word for testing and data on that word

### POST /api/language/guess

Returns correct answer and shifts head to next question
"guess" required in body

### POST /api/user

Creates new user
"name", "username", and "password" required in body

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests mode `npm test`

Run the migrations up `npm run migrate`

Run the migrations down `npm run migrate -- 0`
