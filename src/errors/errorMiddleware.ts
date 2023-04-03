import { NextFunction, Request, Response } from "express";
import unlinkImg from "../util/unlinkImg";
import HttpError from "./HttpError";

export default (
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let status = 500;
  let message = "Server error.";
  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  }
  if (req.file) {
    unlinkImg(req.file.path.replace("src/public/", ""));
  }
  res.status(status).json({ message });
};
