import { Request, Response } from "express";
import HttpError from "./HttpError";

export default (error: HttpError | Error, req: Request, res: Response) => {
  console.log(error);
  let status = 500;
  if (error instanceof HttpError) {
    status = error.status;
  }
  res.status(status).json({ message: error.message });
};
