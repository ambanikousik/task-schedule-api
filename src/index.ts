import express from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import { dbConnect } from './db/database';
import authRouter from './routes/auth_router';
import taskRouter, { initTaskExecuter } from './routes/task_router';

const app = express();
dotenv.config();
const port = process.env.PORT;

dbConnect();
initTaskExecuter();
app.use(compression());
app.use(express.json());
app.use(authRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

