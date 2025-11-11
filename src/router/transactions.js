import express from 'express';
import {getTransactions, addTransaction, deleteTransaction} from '../control/transactions.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getTransactions);
router.post('/', authMiddleware, addTransaction);
router.delete('/:transactionId', authMiddleware, deleteTransaction);

export default router;