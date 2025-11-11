import express from 'express';
import {getAllBudgets, setBudget} from '../control/budgets.js';

const router = express.Router();

router.get('/', getAllBudgets);
router.post('/', setBudget);

export default router;