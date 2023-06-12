import mongoose, { Document, Schema, Types } from 'mongoose';

interface Task extends Document {
  team: Types.ObjectId;
  participant: Types.ObjectId[];
  title: string;
  description: string;
  status: string;
  priority: string;
  createAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema<Task>(
  {
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    participant: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    title: String,
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Backlog', 'In Progress', 'Review', 'Complete'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low Priority', 'Med Priority', 'High Priority'],
      required: true,
    },
    createAt: { type: Date, default: Date.now() },
    updatedAt: Date,
  },
  {
    // when have vitual property(Field that is not stored in database but calculated using some other value).
    // So, want this to also show up whenever there is an output.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskSchema.pre(/^find/, function (next) {
  this.populate({ path: 'team', select: 'teamName' });
  next();
});

taskSchema.pre(/^find/, function (next) {
  this.populate({ path: 'participant', select: 'name image email' });
  next();
});

const TaskModel = mongoose.model<Task>('Task', taskSchema);

export { TaskModel, Task };
