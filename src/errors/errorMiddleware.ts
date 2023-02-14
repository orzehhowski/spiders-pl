import { NextFunction, Request, Response } from "express";
import HttpError from "./HttpError";

export default (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.log(error);
  let status = 500;
  if (error instanceof HttpError) {
    status = error.status;
  }
  res.status(status).json({ message: error.message });
};
