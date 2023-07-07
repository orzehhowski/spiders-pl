import { Request, Response, NextFunction } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

import HttpError from "../errors/HttpError";
import User from "../models/user";

const generateToken = (email: string, userId: number) => {
  return jwt.sign(
    { email, userId },
    process.env.SECRET_KEY || "killer-long-and-str0ng_SeCrEtKEYYYYYYYYY",
    { expiresIn: "12h" }
  );
};

class AuthController {
  // POST /auth/singup
  async singup(req: Request, res: Response, next: NextFunction) {
    const password: string = req.body.password;
    const username: string | undefined = req.body.username;
    const email: string = req.body.email;

    try {
      const isEmailTaken = await User.findOne({ where: { email } });
      if (isEmailTaken) {
        return next(new HttpError(422, "User with this email already exists."));
      }

      const passwordHash = await hash(password, 12);
      if (!passwordHash) {
        return next(new HttpError(500, "Encrypting password error."));
      }

      const newUser = await User.create({ passwordHash, username, email });

      const token = generateToken(email, newUser.id);

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
  async login(req: Request, res: Response, next: NextFunction) {
    const { password, email } = req.body;
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return next(new HttpError(401, "Incorrect email or password."));
      }

      const isPasswordCorrect = await compare(password, user.passwordHash);
      if (!isPasswordCorrect) {
        return next(new HttpError(401, "Incorrect email or password."));
      }

      const token = generateToken(email, user.id);

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
