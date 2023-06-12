import mongoose, { Document, Schema, Types } from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
const validator = require('validator');

interface User extends Document {
  name: string;
  email: string;
  image: string;
  role: string;
  teams: Types.ObjectId;
  password: string | undefined;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;

  correctPassword: (
    candidatePassword: string,
    userPassword: string | undefined
  ) => Promise<boolean>;

  changedPasswordAfter: (JWTTimestamp: number) => boolean;

  createPasswordResetToken: () => string;
}

const userSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    image: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!
        validator: function (this: User, el: string): boolean {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    // when have vitual property(Field that is not stored in database but calculated using some other value).
    // So, want this to also show up whenever there is an output.
    toJSON: { virtuals: true }, // This create new "id" field (virtual) to data but not stored in database.
    toObject: { virtuals: true },
  }
);

userSchema.virtual('tasks', {
  ref: 'Task',
  foreignField: 'participant',
  localField: '_id',
});

userSchema.virtual('teams', {
  ref: 'Team',
  foreignField: 'teamMember',
  localField: '_id',
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12, bcrypt.hash(data, salt, cb) --> data is data, salt is random string add to data for hash before save to DB.
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field by set it to undefined
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = +this.passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < changedTimeStamp;
  }

  // False mean NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserModel = mongoose.model<User>('User', userSchema);

export { UserModel, User };
