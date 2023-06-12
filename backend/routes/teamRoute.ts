import express, { Router } from "express";
import * as teamController from "../controllers/teamController";
import * as authController from "../controllers/authController";

const teamRouter: Router = express.Router();

teamRouter
  .route("/")
  .get(teamController.getAllTeams)
  .post(authController.protect, teamController.userCreateTeam);

teamRouter.use(authController.protect);

teamRouter
  .route("/:id")
  .get(teamController.getTasksNumber, teamController.getTeam)
  .patch(teamController.updateTeam)
  .delete(teamController.deleteTeam);

teamRouter.route("/:id/add-member").post(teamController.addTeamMember);

export default teamRouter;
