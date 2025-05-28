# BiteSpeed Backend

A Node.js + TypeScript backend server built with Express and Prisma, designed to serve as the foundational service for BiteSpeed applications.

## 📦 Project Structure

```bash
bitespeed-backend/
├── index.ts         
├── contriollers/
├── routes/    
├── prisma/          
├── package.json     
├── tsconfig.json    
```

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Hima-Kishore/bitespeedBackend-byHima.git
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


