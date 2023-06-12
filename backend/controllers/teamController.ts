import { TaskModel } from '../models/taskModel';
import { Team, TeamModel } from '../models/teamModel';
import { UserModel } from '../models/userModel';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import * as factory from './handlerFactory';
import { Response, Request, NextFunction } from 'express';

export const getTasksNumber = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const team = await TeamModel.findById(req.params.id);
    const tasks = await TaskModel.find({ team: req.params.id });
    const taskNumber = tasks.length;
    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    team.taskNumber = taskNumber;
    await team.save();

    next();
  }
);

export const userCreateTeam = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newTeam = new TeamModel({
      teamName: req.body.teamName,
      teamMember: req.user._id,
    });

    await newTeam.save();

    res.status(201).json({ status: 'success', doc: newTeam });
  }
);

// const checkUserExist = async function (newMember: any) {
//   const userId = [];
//   for (const i of newMember) {
//     const user = await UserModel.findOne({ email: i }).select("email");
//     if (!user) throw new AppError(`This email: ${i} doesn't exist`, 404);
//     userId.push(user.id);
//   }
//   return userId;
// };

const checkUserExist = async (newMember: string[]) => {
  const userId = newMember.map(async (email: string) => {
    const user = await UserModel.findOne({ email }).select('email');
    if (!user) throw new AppError(`This user: "${email}" doesn't exist`, 400);
    return user.id;
  });
  return Promise.all(userId);
};

export const addTeamMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const team = await TeamModel.findById(req.params.id);
    if (!team) return;
    const userId = await checkUserExist(req.body.email);

    for (const id of userId) {
      if (team.teamMember.includes(id)) {
        const user = await UserModel.findById(id);
        return next(
          new AppError(`This member: "${user?.email}" is already in team`, 400)
        );
      }
      team.teamMember.push(id);
    }

    await team.save();

    res.status(201).json({
      status: 'success',
      message: `Successful add member "${req.body.email}" to Team`,
    });
  }
);

// const getOne = <T>(
//   model: Model<T>,
//   popOptions: { [key: string]: string | boolean }[] | undefined = undefined
// ) =>
//   catchAsync(
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//       let query: any = model.findById(req.params.id);
//       if (popOptions) query = query.populate(popOptions);
//       // query.populate({ path: 'participant' });
//       const doc = await query;
//       // console.log(doc.tasks.populate({ path: 'participant' }));

//       if (!doc) {
//         return next(new AppError(`No ${model.modelName} with this ID`, 404));
//       }

//       res.status(200).json({
//         status: 'success',
//         data: {
//           doc,
//         },
//       });
//     }
//   );

const teamPopulateOptions: { [key: string]: string | boolean }[] = [
  {
    path: 'tasks',
  },
  {
    path: 'teamMember',
    select: 'name image email',
  },
];

export const getAllTeams = factory.getAll<Team>(TeamModel);
export const getTeam = factory.getOne<Team>(TeamModel, teamPopulateOptions);
// export const createTeam = factory.createOne<Team>(TeamModel);
export const updateTeam = factory.updateOne<Team>(TeamModel);
export const deleteTeam = factory.deleteOne<Team>(TeamModel);
