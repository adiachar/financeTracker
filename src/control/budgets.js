import { pool } from "../config/db.js";
import {v4 as uuidv4} from "uuid";

export const getBudgets = async (req, res, next) => {
    const userId = req.user.id;
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    try {
        const [budgets] = await pool.query("SELECT * FROM budgets WHERE userId = ? AND month = ?",
            [userId, month]
        );

        const [spent] = await pool.query(
            `
            SELECT category, SUM(amount) AS totalSpent
            FROM transactions t
            JOIN wallets w ON t.walletId = w.id
            WHERE w.userId = ? AND t.type = 'expense' AND t.date BETWEEN ? AND ?
            GROUP BY category
            `,
            [userId, startDate, endDate]
        );

        // spent is an array, so i am creating a map for easy access.
        const spentMap = {};
        spent.forEach(s => { spentMap[s.category] = parseFloat(s.totalSpent); });

        const result = budgets.map(b => ({
        id: b.id,
        category: b.category,
        budgetAmount: parseFloat(b.amount),
        spentAmount: spentMap[b.category]|| 0,
        remaining: parseFloat(b.amount) - (spentMap[b.category] || 0),
        }));

        res.status(200).json({budgets: result});   
    }
    catch(err) {
        next(err);
    }
}

export const setBudget = async (req, res, next) => {

    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }
    
    const userId = req.user.id;
    const {category, amount} = req.body;
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    

    try {
        const [existing] = await pool.query(
        "SELECT id FROM budgets WHERE userId = ? AND category = ? AND month = ?",
        [userId, category, month]
        );

        if (existing.length > 0) {        
            await pool.query(
                "UPDATE budgets SET amount = ? WHERE userId = ? AND category = ? AND month = ?",
                [amount, userId, category, month]
            );
            return res.json({ message: "Budget updated successfully." });
        }

        const id = uuidv4();
        await pool.query("INSERT INTO budgets (id, userId, category, amount, month) VALUES (?, ?, ?, ?, ?)",
            [id, userId, category, amount, month]
        );

        res.status(200).json({message: "Budget created successfully."});        
    }
    catch(err) {
        next(err);
    }
}