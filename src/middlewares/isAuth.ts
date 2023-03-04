import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import HttpError from "../errors/HttpError";

type Token = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export default (req: Request, res: Response, next: NextFunction) => {
  let token = req.get("Authorization");

  if (!token) {
    return next(new HttpError(401, "Authorization failed - no JWT provided."));
  }
  const SECRET_KEY = process.env.SECRET_KEY;
  if (!SECRET_KEY) {
    return next(new Error("Process environment error - no secret key."));
  }

  //extract from "Bearer {token}"
  token = token.split(" ")[1];

  const decodedToken = jwt.verify(token, SECRET_KEY) as Token;

  if (!decodedToken) {
    next(new HttpError(401, "Authorization failed - wrong JWT Token."));
  }
  if (!decodedToken.userId) {
    next(new HttpError(401, "Authorization failed - wrong JWT Token."));
  }
  req.userId = +decodedToken.userId;
  next();
};
