import { UserModel, User } from '../models/userModel';
import * as factory from './handlerFactory';

const popOptions: { [key: string]: string | boolean }[] = [
  {
    path: 'tasks',
    select: '-__v',
  },
  { path: 'teams', select: 'teamName' },
];

export const getAllUsers = factory.getAll<User>(UserModel);
export const getUser = factory.getOne<User>(UserModel, popOptions);
export const createUser = factory.createOne<User>(UserModel);
export const updateUser = factory.updateOne<User>(UserModel);
export const deleteUser = factory.deleteOne<User>(UserModel);
