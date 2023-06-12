import mongoose, { Document, Query, Schema, Types } from "mongoose";
import { TaskModel } from "./taskModel";

interface Team extends Document {
  teamName: string;
  teamMember: Types.ObjectId[];
  taskNumber: number;
}

const teamSchema = new mongoose.Schema<Team>(
  {
    teamName: { type: String, required: true },
    teamMember: [{ type: Schema.Types.ObjectId, ref: "User" }],
    taskNumber: Number,
  },
  {
    // when have vitual property(Field that is not stored in database but calculated using some other value).
    // So, want this to also show up whenever there is an output. toJSON: { virtuals: true } is also added "id" to data but not stored in database.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teamSchema.virtual("tasks", {
  ref: "Task",
  foreignField: "team",
  localField: "_id",
});

// Schema.pre -> .pre is QUERY MIDDLEWARE, then use regular expression means populate data before find*
// teamSchema.pre(/^find/, function (next) {
//   this.populate([
//     {
//       path: "teamMember",
//       select: "name image role",
//     },
//   ]);

//   next();
// });

const TeamModel = mongoose.model<Team>("Team", teamSchema);

export { TeamModel, Team };
