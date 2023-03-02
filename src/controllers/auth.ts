import { Request, Response, NextFunction } from "express";
import { hash } from "bcryptjs";

import HttpError from "../errors/HttpError";
import User from "../models/user";

class AuthController {
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

      // login user !!!

      res.status(201).json({ message: "Account created!", user: newUser });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
