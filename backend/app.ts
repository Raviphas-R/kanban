import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
const cookieParser = require('cookie-parser');

import globalErrorHandler from './controllers/errorController';
import userRouter from './routes/userRoute';
import teamRouter from './routes/teamRoute';
import taskRouter from './routes/taskRoute';
import AppError from './utils/appError';

const app: Express = express();

app.use(morgan('dev'));

app.use(cors());
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/team', teamRouter);
app.use('/api/task', taskRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export { app };
