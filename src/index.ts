import express, { Request, Response } from 'express';
import { body, oneOf, validationResult } from 'express-validator';
import compression from 'compression';
import cron from 'node-cron';
import dotenv from 'dotenv';
import mongoose from "mongoose";

const app = express();
dotenv.config();
const port = process.env.PORT;
const mongoUrl: string = process.env.MONGO_URL || "";

mongoose.Promise = Promise;
mongoose.connect(mongoUrl).then(() => {
  console.log("Successfully connected to MongoDB Atlas!");
})
  .catch((error) => {
    console.log("Unable to connect to MongoDB Atlas!");
    console.error(error);
  });
mongoose.connection.on('error', (error: Error) => console.log(error));


app.use(compression());

app.use(express.json());
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

//   const tasks: Task[] = [];
cron.schedule('0 15 * * *', () => {
  console.log('This runs every day at 3:00 PM.');
});

const taskValidationRules = [
  body('user_id').isInt().notEmpty().withMessage('User id is required'),
  oneOf([
    body('duration').isInt(),
    body('time').isTime({
      hourFormat: 'hour24',
      mode: 'default',
    }),
  ], { message: 'Duration or time is required' })
];

// Make your callback function asynchronous so that you can use await

app.post('/', taskValidationRules, (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  setTimeout(() => {
    console.log(`Executing task: ${JSON.stringify(req.body)}`);

  }, 2000); // 2-second delay
  res.send('Hello, TypeScript Express!');

});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});