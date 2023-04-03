// This middleware should be used only after isAuth verification

import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import User from "../models/user";

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.userId, { attributes: ["isAdmin"] });
    if (!user) {
      return next(new HttpError(401, "Authorization failed."));
    }
    req.isAdmin = !!user.isAdmin;
    next();
  } catch (err) {
    next(err);
  }
};
