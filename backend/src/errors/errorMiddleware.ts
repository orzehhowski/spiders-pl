// classic express error middleware - every catch block pushes request here
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
  // if error is created by me, so is instance of HttpError, send error message to user, else send default message (I don't want to share my mistakes with user..)
  let status = 500;
  let message = "Server error.";
  if (error instanceof HttpError) {
    status = error.status;
    message = error.message;
  }
  // just in case, if request is incorrect, I don't want to save image coming from it
  if (req.file) {
    unlinkImg(req.file.path.replace("src/public/", ""));
  }
  // send response
  res.status(status).json({ message });
};
