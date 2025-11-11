import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import {authenticationRouter} from './router/authentication.js';
import {budgetsRouter} from "./router/budgets.js";
import {reportRouter} from "./router/report.js";
import {transactionsRouter} from "./router/transactions.js";
import {walletsRouter} from "./router/wallets.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL.");
        connection.release();
    }
    catch(err) {
        console.log("Error while connecting to MySQL", err);
        process.exit(1);
    }
}


app.use('/api/auth', authenticationRouter);
app.use('/api/wallets', walletsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/report', reportRouter);


app.listen(PORT, async () => {
    await testConnection();
    console.log("Listening to the port", PORT);
});