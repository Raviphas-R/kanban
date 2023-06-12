import { Task, TaskModel } from "../models/taskModel";
import * as factory from "./handlerFactory";

const taskPopulateOptions: { [key: string]: string | boolean }[] = [
  { path: "participant", select: "name image role email" },
  { path: "team", select: "teamName" },
];

export const getAllTasks = factory.getAll<Task>(TaskModel);
export const getTask = factory.getOne<Task>(TaskModel, taskPopulateOptions);
export const createTask = factory.createOne<Task>(TaskModel);
export const updateTask = factory.updateOne<Task>(TaskModel);
export const deleteTask = factory.deleteOne<Task>(TaskModel);
