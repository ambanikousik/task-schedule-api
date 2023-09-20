import express from "express";
import { authenticateUser } from "../middleware/auth_middleware";
import { dbClient } from "../db/database";
import { tasks } from "../db/schema/task";
import { validateRequest } from "zod-express-middleware";
import { taskTypeSchema } from "../middleware/validator/task_schema";
import { and, eq, lt } from "drizzle-orm";
import cron from "node-cron";
import dotenv from 'dotenv';
dotenv.config();


const taskRouter = express.Router();

export async function initTaskExecuter() {
    const taskCheckInterval = parseInt(process.env.MIN_TASK_CHECK_INTERVAL || "10");
    console.log(`Initialising task executer with interval ${taskCheckInterval} minutes`);

    const currentDate = new Date();
    const nextTime = new Date(currentDate.getTime() + (60000 * taskCheckInterval));
    const tasksResult = await dbClient.select().from(tasks).where(and(eq(tasks.executed, false), lt(tasks.executionTime, nextTime)));
    tasksResult.forEach(executeTask)
    cron.schedule(`0 */${taskCheckInterval} * * * *`, async () => {
        console.log(`checking tasks every ${process.env.MIN_TASK_CHECK_INTERVAL} minutes`);
        const currentDate = new Date();
        const nextTime = new Date(currentDate.getTime() + (60000 * taskCheckInterval));
        const tasksResult = await dbClient.select().from(tasks).where(and(eq(tasks.executed, false), lt(tasks.executionTime, nextTime)));
        tasksResult.forEach(executeTask)
    });

}


async function executeTask(task: {
    id: number;
    executionTime: Date;
    user: number | null;
    executed: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}) {
    setTimeout(() => {
        console.log(`Task ${task.id} executed for user ${task.user} at ${task.executionTime}`);
        dbClient.update(tasks).set({ executed: true }).where(eq(tasks.id, task.id)).execute();
    }, task.executionTime.getTime() - new Date().getTime());
}



taskRouter.post("/task", authenticateUser, validateRequest({ body: taskTypeSchema }), async (req, res) => {
    try {
        if (req.body.time) {
            if (new Date(req.body.time) < new Date()) {
                return res.status(400).json({ message: "Time cannot be in the past" });
            }
        }
        const execute_after = req.body.execute_after;
        const currentDate = new Date();
        const calculatedTime = new Date(currentDate.getTime() + (execute_after || 0));
        const time: Date = execute_after ? calculatedTime! : new Date(req.body.time!);

        const task = {
            user: req.body.user_id,
            executionTime: time
        };
        const taskResp = await dbClient.insert(tasks).values([task]).returning().then((res) => res[0]);
        const timeAfter = new Date(taskResp.executionTime.getTime() - currentDate.getTime());
        const taskCheckInterval = parseInt(process.env.MIN_TASK_CHECK_INTERVAL || "10");
        if (timeAfter.getTime() < (60000 * taskCheckInterval)) {
            executeTask(taskResp);
        }

        return res.json({ message: "Task created successfully ", task: taskResp });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



export default taskRouter;