import dotenv from "dotenv";
import { Pool } from 'pg';
import { drizzle } from "drizzle-orm/node-postgres";
dotenv.config();



const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });


export async function dbConnect() {
    console.log('Connecting to database ' + process.env.DATABASE_URL);
    try {
        await pool.connect();
        console.log('Connected to database');
    } catch (error) {
        console.log(error);
    }
}
export const dbClient = drizzle(pool);