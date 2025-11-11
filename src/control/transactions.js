import {pool} from "../config/db.js";
import {v4 as uuidv4} from "uuid";

export const getTransactions = async (req, res, next) => {

    const {walletId, startDate, endDate} = req.query;

    let query = `SELECT * FROM transactions`;

    if(walletId) {

        query += ` WHERE walletId = ${walletId}`

        if (startDate) {
            query += ` AND date >= ${startDate}`
        }
        
        if (endDate) {
            query += ` AND date <= ${endDate}`;
        }

    } 
    else {
        if(startDate && endDate) {
            query += ` WHERE date BETWEEN ${startDate} AND ${endDate}`
        } 
        else if (startDate) {
            query += ` WHERE date >= ${startDate}`
        } 
        else if (endDate) {
            query += ` WHERE date <= ${endDate}`
        }
    }

    try {
        const [transactions] = await pool.query(query);

        res.status(200).json({transactions: transactions, message: "Request Successfull"});
    }
    catch(err) {
        next(err);
    }
}

export const addTransaction = async (req, res, next) => {

    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const userId = req.user.id;
    const {type, category, walletId, amount, description} = req.body;

    if(!type || !category || !walletId || !amount) {
        return res.status(400).json({message: "Bad Request."});
    }

    const [walletRows] = await pool.query(
      "SELECT * FROM wallets WHERE id = ? AND userId = ?",
      [walletId, userId]
    );

    if(!walletRows.length) {
        return res.status(400).json({message: "Wallet not found"});
    }

    const wallet = walletRows[0];

    let newBalance = parseFloat(wallet.balance);

    if(type == 'income') {
        newBalance += parseFloat(amount);
    }
    else if(type == 'expense') {
        newBalance -= parseFloat(amount);
    }

    if(newBalance < 0) {
        return res.status(400).json({message: "Insuffient balance"});
    }
    
    try {
        await pool.query("UPDATE wallets SET balance = ? WHERE id = ? ",
            [newBalance, walletId]
        )

        const now = new Date(Date.now());
        const formattedDate = now.toISOString().slice(0, 10);
        const transactionId = uuidv4();

        await pool.query(
            "INSERT INTO transactions (id, walletId, type, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [transactionId, walletId, type, amount, category, formattedDate, description || ""]
        );

        res.status(201).json({ message: "Transaction added", id: transactionId });
    }
    catch(err) {
        next(err);
    }
}

export const deleteTransaction = async (req, res, next) => {
  const { transactionId } = req.params;
  const userId = req.user.id;

  if(!transactionId) {
    return res.status(400).json({message: "Bad Request."});
  }

  try {

    const [rows] = await pool.query(
      `
      SELECT t.*, w.userId, w.balance
      FROM transactions t
      JOIN wallets w ON t.walletId = w.id
      WHERE t.id = ? AND w.userId = ?
      `,
      [transactionId, userId]
    );

    if (!rows.length) {
        return res.status(404).json({ message: "Transaction not found" });
    }

    const transaction = rows[0];
    let newBalance = parseFloat(transaction.balance);

    if(transaction.type == 'income') {
        newBalance -= parseFloat(transaction.amount);
    } 
    else if(transaction.type == 'expense') {
        newBalance += parseFloat(transaction.amount);
    }

    await pool.query("UPDATE wallets SET balance = ? WHERE id = ?", [newBalance, transaction.walletId]);

    await pool.query("DELETE FROM transactions WHERE id = ?", [transactionId]);

    res.status(200).json({ message: "Transaction deleted" });

  } 
  catch (err) {
    next(err);
  }
};