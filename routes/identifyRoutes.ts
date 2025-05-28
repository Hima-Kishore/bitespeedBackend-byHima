import express from "express";

import { identify } from "../controllers/IdentifyController";

const router = express.Router();

router.post("/identify", identify);

export { router as identifyRoutes };
