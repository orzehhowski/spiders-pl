import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

import HttpError from "../errors/HttpError";
import User from "../models/user";

// function generates JWT containing user's email and ID
const generateToken = (email: string, userId: number) => {
  return jwt.sign(
    { email, userId },
    process.env.SECRET_KEY || "killer-long-and-str0ng_SeCrEtKEYYYYYYYYY",
    { expiresIn: "12h" }
  );
};

class AuthController {
  // POST /auth/singup
  // body: {password: string, username?: string, email}
  async singup(req: Request, res: Response, next: NextFunction) {
    // read data from body
    const password: string = req.body.password;
    const username: string | undefined = req.body.username;
    const email: string = req.body.email;

    try {
      // check if email is taken
      const isEmailTaken = await User.findOne({ where: { email } });
      if (isEmailTaken) {
        return next(new HttpError(422, "User with this email already exists."));
      }

      // encrypt password
      const passwordHash = await hash(password, 12);
      if (!passwordHash) {
        return next(new HttpError(500, "Encrypting password error."));
      }

      // create user and generate it's token
      const newUser = await User.create({ passwordHash, username, email });

      const token = generateToken(email, newUser.id);

      // send response
      res.status(201).json({
        message: "Account created.",
        userId: newUser.id,
        username: newUser.username,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /auth/login
  // body: {email: string, password: string}
  async login(req: Request, res: Response, next: NextFunction) {
    // read data from body
    const { password, email } = req.body;
    try {
      // fetch user from db
      const user = await User.findOne({ where: { email } });

      // check if user exists
      if (!user) {
        return next(new HttpError(401, "Incorrect email or password."));
      }

      // check if password is correct
      const isPasswordCorrect = await compare(password, user.passwordHash);
      if (!isPasswordCorrect) {
        return next(new HttpError(401, "Incorrect email or password."));
      }

      // generate JWT
      const token = generateToken(email, user.id);

      // send response
      res.status(200).json({
        message: "User logged in.",
        userId: user.id,
        username: user.username,
        isAdmin: !!user.isAdmin,
        token,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
