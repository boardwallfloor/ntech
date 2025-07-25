import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { fileURLToPath } from 'url';
import * as dataLayer from '../db/index.js';

const SALT_ROUNDS = 10;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

//  Membership 
export const registerUser = async (email, firstName, lastName, password) => {
    const existingUser = await dataLayer.findUserByEmail(email);
    if (existingUser) {
        const error = new Error('Email already registered');
        error.statusCode = 400;
        error.errorCode = 102;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await dataLayer.createUser(email, firstName, lastName, hashedPassword);
};

export const loginUser = async (email, password, jwtSign) => {
    const user = await dataLayer.findUserByEmail(email);
    if (!user) {
        const error = new Error('Username atau password salah');
        error.statusCode = 401;
        error.errorCode = 103;
        throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
        const error = new Error('Username atau password salah');
        error.statusCode = 401;
        error.errorCode = 103;
        throw error;
    }
    return jwtSign({ email: user.email }, { expiresIn: '12h' });
};

export const getUserProfile = (email) => dataLayer.findUserByEmail(email);

export const updateUserProfile = async (email, firstName, lastName) => {
    await dataLayer.updateUserProfileData(firstName, lastName, email);
    return dataLayer.findUserByEmail(email);
};

export const updateProfileImage = async (email, fileData) => {
    if (!fileData) {
        const error = new Error('File upload is required.');
        error.statusCode = 400;
        throw error;
    }
    if (fileData.mimetype !== 'image/jpeg' && fileData.mimetype !== 'image/png') {
        const error = new Error('Invalid file format. Only JPEG and PNG are allowed.');
        error.statusCode = 400;
        throw error;
    }
    const user = await dataLayer.findUserByEmail(email);
    const filename = `${user.id}-${Date.now()}-${fileData.filename}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const fileUrl = `/uploads/${filename}`;
    await util.promisify(fs.writeFile)(filepath, await fileData.toBuffer());
    await dataLayer.updateProfileImageData(fileUrl, email);
    return dataLayer.findUserByEmail(email);
};

// Information
export const getBanners = () => dataLayer.getAllBanners();
export const getServices = () => dataLayer.getAllServices();

//Transaction
export const getUserBalance = (email) => dataLayer.findUserByEmail(email);

export const topUpBalance = async (email, amount) => {
    if (typeof amount !== 'number' || amount <= 0) {
        const error = new Error('Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0');
        error.statusCode = 400;
        error.errorCode = 102;
        throw error;
    }
    const user = await dataLayer.findUserByEmail(email);
    const newBalance = user.balance + amount;
    await dataLayer.updateUserBalance(newBalance, user.id);
    await dataLayer.createTransactionRecord(user.id, 'TOPUP', 'Top Up balance', amount);
    return { balance: newBalance };
};

export const executePayment = async (email, serviceCode) => {
    const user = await dataLayer.findUserByEmail(email);
    const service = await dataLayer.findServiceByCode(serviceCode);
    if (!service) {
        const error = new Error('Service atau Layanan tidak ditemukan');
        error.statusCode = 400;
        error.errorCode = 102;
        throw error;
    }
    if (user.balance < service.service_tariff) {
        const error = new Error('Saldo tidak mencukupi');
        error.statusCode = 400;
        error.errorCode = 102;
        throw error;
    }
    const newBalance = user.balance - service.service_tariff;
    await dataLayer.updateUserBalance(newBalance, user.id);
    const { invoice_number, created_on } = await dataLayer.createTransactionRecord(user.id, 'PAYMENT', service.service_name, service.service_tariff);
    return { invoice_number, service_code: service.service_code, service_name: service.service_name, transaction_type: 'PAYMENT', total_amount: service.service_tariff, created_on };
};

export const getTransactionHistory = async (email, limit, offset) => {
    const user = await dataLayer.findUserByEmail(email);
    return dataLayer.getHistory(user.id, limit, offset);
};
