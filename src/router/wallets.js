import express from 'express';
import {getWallets, createWallet, deleteWallet} from '../control/wallets.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getWallets);
router.post('/', authMiddleware, createWallet);
router.delete('/:walletId', authMiddleware, deleteWallet);

export default router;