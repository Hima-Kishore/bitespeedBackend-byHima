import express, { Request, Response } from "express";
import cors from "cors";
import { identifyRoutes } from "./routes/identifyRoutes";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", identifyRoutes);
app.use("/", (req: Request, res: Response) => {
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Backend API Test</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(to right, #00c6ff, #0072ff);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.2rem;
          max-width: 600px;
          line-height: 1.6;
        }
        code {
          background-color: rgba(255, 255, 255, 0.2);
          padding: 0.2em 0.4em;
          border-radius: 4px;
        }
        .box {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>I am Himakishore</h1>
        <p>
          To test our backend URL, please send a <strong>POST</strong> request to the
          <code>/identify</code> endpoint using <strong>Postman</strong>.
        </p>
      </div>
    </body>
    </html>
  `);

});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
