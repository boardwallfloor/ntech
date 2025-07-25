import { db } from '../../db.js';
import util from 'util';

const dbGet = util.promisify(db.get.bind(db));
const dbRun = util.promisify(db.run.bind(db));
const dbAll = util.promisify(db.all.bind(db));

// Membership
export const findUserByEmail = (email) => dbGet('SELECT * FROM users WHERE email = ?', [email]);
export const createUser = (email, firstName, lastName, hashedPassword) => {
    const sql = `INSERT INTO users (email, first_name, last_name, hashed_password, balance) VALUES (?, ?, ?, ?, 0)`;
    return dbRun(sql, [email, firstName, lastName, hashedPassword]);
};
export const updateUserProfileData = (firstName, lastName, email) => dbRun(`UPDATE users SET first_name = ?, last_name = ? WHERE email = ?`, [firstName, lastName, email]);
export const updateProfileImageData = (imageUrl, email) => dbRun(`UPDATE users SET profile_image = ? WHERE email = ?`, [imageUrl, email]);

//Information
export const getAllBanners = () => dbAll('SELECT banner_name, banner_image, description FROM banners');
export const getAllServices = () => dbAll('SELECT service_code, service_name, service_icon, service_tariff FROM services');

//Transaction
export const findServiceByCode = (code) => dbGet('SELECT * FROM services WHERE service_code = ?', [code]);
export const updateUserBalance = (newBalance, userId) => dbRun('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);
export const createTransactionRecord = (userId, type, description, amount) => {
    const invoiceNumber = `INV${Date.now()}-${userId}`;
    const createdOn = new Date().toISOString();
    const sql = `INSERT INTO transactions (user_id, invoice_number, transaction_type, description, total_amount, created_on) VALUES (?, ?, ?, ?, ?, ?)`;
    dbRun(sql, [userId, invoiceNumber, type, description, amount, createdOn]);
    return { invoice_number: invoiceNumber, created_on: createdOn };
};
export const getHistory = (userId, limit, offset) => {
    let sql = `SELECT invoice_number, transaction_type, description, total_amount, created_on FROM transactions WHERE user_id = ? ORDER BY created_on DESC`;
    const params = [userId];
    if (limit !== null) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
    }
    return dbAll(sql, params);
};
