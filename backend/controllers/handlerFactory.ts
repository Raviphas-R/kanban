import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import APIFeatures from '../utils/apiFeatures';

export const getAll = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response): Promise<void> => {
    const features = new APIFeatures(model.find({}), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc: T[] = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

export const getOne = <T>(
  model: Model<T>,
  popOptions: { [key: string]: string | boolean }[] | undefined = undefined
) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      let query: any = model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);

      const doc = await query;

      if (!doc) {
        return next(new AppError(`No ${model.modelName} with this ID`, 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          doc,
        },
      });
    }
  );

export const createOne = <T>(model: Model<T>) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doc: T = await model.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    }
  );

export const updateOne = <T>(model: Model<T>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc: T | null = await model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const deleteOne = <T>(model: Model<T>) =>
  catchAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const doc: T | null = await model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document with that ID', 404));
      }

      res.status(201).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    }
  );
