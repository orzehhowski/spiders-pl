import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import HttpError from "../errors/HttpError";

export default (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array()[0].msg;
    return next(new HttpError(422, message));
  }
  next();
};
