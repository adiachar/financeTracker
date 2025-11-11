import express from 'express';
import {getTransactions, addTransaction, deleteTransaction} from '../control/transactions.js';

const router = express.Router();

router.get('/', getTransactions);
router.post('/', addTransaction);
router.delete('/:transactionId', deleteTransaction);

export default router;