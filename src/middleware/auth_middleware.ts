
import { NextFunction, Request, Response } from 'express';
import { dbClient } from '../db/database';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();


export const checkIfUserExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usernameCheck = await dbClient.select().from(users).where(eq(users.username, req.body.username));

        if (usernameCheck.length > 0) {
            console.log(usernameCheck);
            return res.status(409).json({ message: "Username already taken" });
        }

        const emailcheck = await dbClient.select().from(users).where(eq(users.username, req.body.email));

        if (emailcheck.length > 0) {
            return res.status(409).json({ message: "Email already taken" });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

interface JwtPayload {
    id: number;
}


export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            jwt.decode(token);
            const user = await dbClient.select().from(users).where(eq(users.id, decodedToken.id));
            if (user.length > 0) {
                req.body.user_id = user[0].id;
                next();
            } else {
                return res.status(401).json({ message: "Unauthenticated, User not found" });
            }
        } else {
            return res.status(401).json({ message: "Unauthenticated" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};