import { Request, Response, NextFunction } from "express";
import unlinkImg from "../util/unlinkImg";

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.file) {
    unlinkImg(req.file.path.replace("src/public/", ""));
  }
  next();
};
