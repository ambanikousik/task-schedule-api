import express from "express";
import { signupSchema } from "../middleware/validator/signup_validator";
import { loginSchema } from "../middleware/validator/login_validator";
import { validateRequest } from 'zod-express-middleware';
import { checkIfUserExists } from "../middleware/auth_middleware";
import bcrypt from 'bcrypt';
import { dbClient } from "../db/database";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
const authRouter = express.Router();
dotenv.config();



authRouter.post("/register", validateRequest({ body: signupSchema }), checkIfUserExists, async (req, res) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        await dbClient.insert(users).values([
            {
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            }
        ]).returning().then((res) => res[0]);

        return res.json({ message: 'User registration successful' });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


authRouter.post("/login", validateRequest({ body: loginSchema }), async (req, res) => {
    try {
        const usersResult = await dbClient.select().from(users).where(eq(users.username, req.body.username));
        if (usersResult.length > 0) {
            const user = usersResult[0];
            const match = await bcrypt.compare(req.body.password, user.password);
            if (match) {
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
                return res.json({ message: "Login successful", token: token });
            } else {
                return res.status(400).json({ message: "Incorrect password" });
            }
        } else {
            return res.status(400).json({ message: "Username not found" });

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default authRouter;