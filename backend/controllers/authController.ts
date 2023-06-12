import { Request, Response, NextFunction } from 'express';
import util from 'util';
import crypto from 'crypto';
import { User, UserModel } from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
const jwt = require('jsonwebtoken');
// const Email = require("../utils/email");

const signToken = (id: string) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (
  user: User,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({ email: req.body.email });
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    // Check email was used or not.
    if (user) {
      return next(
        new AppError(`This email already exist, Please use another email`, 404)
      );
    }

    // Check password length
    if (password.length < 8) {
      return next(new AppError(`Password need more than 8 characters`, 404));
    }

    // Check password and confirm password are the same.
    if (password !== passwordConfirm) {
      return next(
        new AppError(`Password and Confirm Password are not the same`, 400)
      );
    }

    // Create new User.
    const newUser = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    // const url = `${req.protocol}://${req.get("host")}/me`;
    // await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, req, res);
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await UserModel.findOne({ email })
      .select('+password')
      .populate([
        {
          path: 'tasks',
          select: '-__v',
        },
        { path: 'teams', select: 'teamName' },
      ]);

    // await user.correctPassword(password, user.password); --> use to compare password with encrypt password.
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  }
);

// To Logout user --> We can delete the cookies from localstorage because we set {httpOnly: true} when create cookes.
// So, we create very simple route that send back a new cookie with the exact same name but without the token.
// when request send along to the browser, the browser cannot indentify user.
export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 10000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's exist
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(
        new AppError('You are not logged In! Please log in to get access.', 401)
      );
    }

    // 2) Verification token
    const decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 3) Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was created.
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

// Only for rendered pages, no errors!
export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.cookies.jwt) {
      // 1) verify token
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was created.
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // There is a LOGGED IN user
      res.locals.user = currentUser; // Every pug templates can access to res.locals.{variable}
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // roles ['admin', 'team-lead']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get User based on Posted email
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address', 404));
    }

    // 2) Generate the random reset email
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // validateBeforeSave use to set ALL validate to false.

    // 3) Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      // await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
  }
);

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user from collection
    const user: User | null = await UserModel.findById(req.user.id).select(
      '+password'
    );

    if (!user) {
      return next(new AppError('Cannot found this user', 404));
    }

    // 2) Check if Posted current password is correct
    if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended.

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  }
);
