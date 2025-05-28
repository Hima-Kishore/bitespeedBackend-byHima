# BiteSpeed Backend

A Node.js + TypeScript backend server built with Express and Prisma, designed to serve as the foundational service for BiteSpeed applications.

## 📦 Project Structure

```bash
bitespeed-backend/
├── index.ts         # Entry point for development
├── index.js         # Compiled output for production
├── prisma/          # Prisma schema and migration files
├── package.json     # Project metadata and dependencies
├── tsconfig.json    # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (or your preferred database)
- Prisma CLI

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Hima-Kishore/bitespeed-by-hima.git
cd bitespeed-backend
npm install
```

## 🛠️ Prisma Setup

Set up your database using Prisma:

1. Create a `.env` file and add your database connection string in the following format:

    ```env
    DATABASE_URL="your-database-connection-url from render"
    ```

2. Run the following command to apply the initial migration:

    ```bash
    npx prisma migrate dev --name init
    ```

---

## 🔧 Development

Start the development server with TypeScript support:

```bash
npm run dev
```

### Deployement

please send a POST request to the /identify end point to corresponding backend url

```bash
https://bitespeedbackend-byhima.onrender.com
```


