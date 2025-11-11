import {pool} from "../config/db.js";
import {v4 as uuidv4} from 'uuid';

export const createWallet = async (req, res, next) => {
  
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { name } = req.body;
  const userId = req.user.id;
  const id = uuidv4();

  try {
    const [result] = await pool.query(
      "INSERT INTO wallets (id, name, userId) VALUES (?, ?, ?)",
      [id, name, userId]
    );
    res.status(201).json({message: "Wallet successfully created."});
  } 
  catch (err) {
    next(err);
  }

}

export const getWallets = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const [wallets] = await pool.query("SELECT * FROM wallets WHERE userId = ?", [userId]);
    res.status(200).json(wallets);

  } 
  catch (err) {
    next(err);
  }
}

export const deleteWallet = async (req, res, next) => {
  const { walletId } = req.params;
  const userId = req.user.id;

  try {
    await pool.query("DELETE FROM wallets WHERE id = ? AND userId = ?", [walletId, userId]);
    res.status(200).json({ message: "Wallet deleted" });
  } 
  catch (err) {
    next(err);
  }
}