import express from 'express';
import {getBudgets, setBudget} from '../control/budgets.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getBudgets);
router.post('/', authMiddleware, setBudget);

export default router;