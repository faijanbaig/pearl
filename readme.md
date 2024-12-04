# Email Sending Service

The **Email Sending Service** is a robust and scalable system designed to handle email delivery efficiently and reliably. This service incorporates advanced features like retry logic, provider fallback, idempotency, and rate limiting to ensure emails are sent effectively, even under adverse conditions.

## Features

- **Retry Logic**: Ensures reliable delivery by retrying failed attempts with exponential backoff.
- **Fallback Mechanism**: Automatically switches to a secondary provider if the primary fails.
- **Idempotency**: Prevents duplicate emails by tracking unique email requests.
- **Rate Limiting**: Manages the flow of requests to stay within allowable limits.
- **Status Tracking**: Provides insights into the email delivery process.
- **Queue System**: Organizes email tasks efficiently.
- **Logging**: Tracks key events and errors for debugging.

## Technology Stack

- **Backend**: Node.js with Express for handling API requests.

## Objectives

This project demonstrates proficiency in:

- Building resilient systems with retry and fallback mechanisms.
- Ensuring idempotency in distributed systems.
- Implementing rate limiting and basic queueing.
- Structuring a project for scalability and maintainability.

## Setup and Installation

### Prerequisites

- Install [Node.js](https://nodejs.org/)

### Installation Steps

1. Clone the repository:

```bash
 git clone https://github.com/faijanbaig/pearl.git
```

2. Navigate into the project directory:

   ```bash
   cd pearl
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   node index.js
   ```

## Usage

## API Endpoints

1. POST /api/v0/send-email: Create a new ticket.
   Example :POST http://localhost:3000/api/v0/send-email

   Request Body:

   ```json
   {
     "email": "recipient@example.com",
     "subject": "Subject of the email",
     "content": "Body of the email"
   }
   ```

   Response Body On Success:

   ```json
   {
     "statusCode": 200,
     "data": null,
     "message": "Email sent successfully",
     "success": true
   }
   ```

   Response Body On Failure:

   ```json
   {
     "statusCode": 500,
     "data": null,
     "message": "Failed to send email.",
     "success": false
   }
   ```

## Unit Testing

- **Mock providers simulate various scenarios**:
  - Successful email sends.
  - Transient failures and retries.
  - Fallback between providers.
  - Idempotency enforcement.
- **Use Jest for unit testing.**
  Run tests:
  ```bash
  npm test
  ```

## Running Tests

To run tests, run the following command

```bash
  npm run test
```
