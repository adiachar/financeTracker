import {pool} from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv'

dotenv.config();

export const userRegister = async (req, res, next) => {
    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({message: "Bad Request"});
    }

    try {
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if(existing.length) {
            return res.status(400).json({message: 'User already exists.'});
        }

        const salt = parseInt(process.env.BCRYPT_SALT);
        const passwordHash = await bcrypt.hash(password, salt);
        const id = uuidv4();

        await pool.query("INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)", [id, email, passwordHash]);

        const token = jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: '2h'});

        return res.status(201).json({ token: token, message: "User Registered Successfully."});
    }
    catch(err) {
        next(err);
    }
}

export const userLogin = async (req, res, next) => {

    if (!req.body) {
        return res.status(400).json({ message: "Request body is missing" });
    }

    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({message: "Bad Request"});
    }   

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if(!rows.length) {
            return res.status(400).json({message: "Email not found."});
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if(!isMatch) {
            return res.status(400).json({message: "Wrong Password."})
        }

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '2h'});

        return res.status(201).json({ token: token, message: "User Login Successfull."});
    }
    catch(err) {
        next(err);
    }
}