
import { NextFunction, Request, Response } from 'express';
import { dbClient } from '../db/database';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';

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
    }
};