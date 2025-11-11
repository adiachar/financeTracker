import express from 'express';
import {getAllWallets, createNewWallet, deleteWallet} from '../control/wallets.js';

const router = express.Router();

router.get('/', getAllWallets);
router.post('/', createNewWallet);
router.delete('/:walletId', deleteWallet);

export default router;