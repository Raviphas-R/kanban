import AppError from "../utils/appError";
import { Request, Response, NextFunction } from "express";

// For handle invalid param
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handler Error for duplicate unique field
const handleDuplicateFieldDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

// For handle invalid Schema
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendError = (err: any, req: Request, res: Response) => {
  if (req.originalUrl.startsWith("/")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
    }

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }
};

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error = Object.create(err);

  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);

  sendError(error, req, res);
};

export default globalErrorHandler;
