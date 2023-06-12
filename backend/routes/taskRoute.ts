import express, { Router } from "express";
import * as taskController from "../controllers/taskController";
import * as authController from "../controllers/authController";

const taskRouter: Router = express.Router();

taskRouter
  .route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

taskRouter
  .route("/:id")
  .get(taskController.getTask)
  .patch(taskController.updateTask)
  .delete(taskController.deleteTask);

export default taskRouter;
