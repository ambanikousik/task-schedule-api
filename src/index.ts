import express from 'express';
import compression from 'compression';
import dotenv from 'dotenv';
import { dbConnect } from './db/database';
import authRouter from './routes/auth_router';
import taskRouter, { initTaskExecuter } from './routes/task_router';
import cluster from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';
dotenv.config();

const totalCPUs = cpus().length;
const port = process.env.PORT;


if (cluster.isPrimary) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running as a load balancer`);

  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker,) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });

} else {
  startServer();
}



async function startServer() {
  const app = express();


  await dbConnect();
  initTaskExecuter();
  app.use(compression());
  app.use(express.json());
  app.use(authRouter);
  app.use(taskRouter);

  app.listen(port, () => {
    console.log(`Server running at port ${port}`);
  });
}