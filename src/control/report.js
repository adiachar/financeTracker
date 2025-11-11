import { pool } from "../config/db.js";

export const getReport = async (req, res, next) => {
    const userId = req.user.id;
    const today = new Date();
    const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const startDate = `${month}-01`;

    console.log(userId);
    try {
        const [rows] = await pool.query(
            `
            SELECT t.type, SUM(t.amount) AS total
            FROM transactions t
            JOIN wallets w ON t.walletId = w.id
            WHERE w.userId = ? AND t.date >= ?
            GROUP BY t.type
            `,
            [userId, startDate]
        );
        
        let totalIncome = 0.0;
        let totalExpense = 0.0;

        console.log(rows)

        for(let row of rows) {
            if(row.type === 'income') {
                totalIncome = row.total;
            } 
            else if(row.type === 'expense') {
                totalExpense = row.total;
            }
        }

        const netSavings = (totalIncome || 0) - (totalExpense || 0);

        res.status(200).json({totalIncome, totalExpense, netSavings});
        
    }
    catch(err) {
        next(err);
    }
}