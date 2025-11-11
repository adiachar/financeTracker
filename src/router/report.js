import express from 'express';
import {getReport} from '../control/report.js';

const router = express.Router();

router.get('/', getReport);

export default router;