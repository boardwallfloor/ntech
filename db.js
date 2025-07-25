import sqlite3 from 'sqlite3';
import path from 'path';
import util from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_PATH = path.join(__dirname, 'users.db');

const db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

const dbRun = util.promisify(db.run.bind(db));
const dbAll = util.promisify(db.all.bind(db));
const dbGet = util.promisify(db.get.bind(db));

const initializeDatabase = async () => {
    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        hashed_password TEXT NOT NULL,
        profile_image TEXT,
        balance INTEGER NOT NULL DEFAULT 0
      )
    `);

    // Create banners table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        banner_name TEXT NOT NULL,
        banner_image TEXT NOT NULL,
        description TEXT NOT NULL
      )
    `);

    // Create services table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_code TEXT NOT NULL UNIQUE,
        service_name TEXT NOT NULL,
        service_icon TEXT NOT NULL,
        service_tariff INTEGER NOT NULL
      )
    `);

    // Create transactions table
    await dbRun(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            invoice_number TEXT NOT NULL UNIQUE,
            transaction_type TEXT NOT NULL,
            description TEXT NOT NULL,
            total_amount INTEGER NOT NULL,
            created_on TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Seed data 
    const banners = await dbAll('SELECT 1 FROM banners LIMIT 1');
    if (banners.length === 0) {
        console.log('Seeding banners data...');
        const bannerData = [
            { name: 'Banner 1', image: 'https://nutech-integrasi.app/dummy.jpg', desc: 'Lorem Ipsum Dolor sit amet' },
            { name: 'Banner 2', image: 'https://nutech-integrasi.app/dummy.jpg', desc: 'Lorem Ipsum Dolor sit amet' },
        ];
        const stmt = db.prepare('INSERT INTO banners (banner_name, banner_image, description) VALUES (?, ?, ?)');
        bannerData.forEach(b => stmt.run(b.name, b.image, b.desc));
        stmt.finalize();
    }

    const services = await dbAll('SELECT 1 FROM services LIMIT 1');
    if (services.length === 0) {
        console.log('Seeding services data...');
        const serviceData = [
            { code: 'PAJAK', name: 'Pajak PBB', icon: 'https://nutech-integrasi.app/dummy.jpg', tariff: 40000 },
            { code: 'PLN', name: 'Listrik', icon: 'https://nutech-integrasi.app/dummy.jpg', tariff: 10000 },
            { code: 'PULSA', name: 'Pulsa', icon: 'https://nutech-integrasi.app/dummy.jpg', tariff: 40000 },
        ];
        const serviceStmt = db.prepare('INSERT INTO services (service_code, service_name, service_icon, service_tariff) VALUES (?, ?, ?, ?)');
        serviceData.forEach(s => serviceStmt.run(s.code, s.name, s.icon, s.tariff));
        serviceStmt.finalize();
    }
};

export { db, initializeDatabase };
