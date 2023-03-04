// This middleware should be used only after isAuth verification

import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import User from "../models/user";

export default async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByPk(req.userId);
  if (!user) {
    return next(new HttpError(401, "Authorization failed."));
  }
  if (!user.isAdmin) {
    return next(new HttpError(403, "Admin rights are required."));
  }
  next();
};
