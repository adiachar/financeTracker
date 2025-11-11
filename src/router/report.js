import express from 'express';
import {getReport} from '../control/report.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getReport);

export default router;