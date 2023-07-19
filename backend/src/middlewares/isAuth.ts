// middleware that checks user authentication and authorization
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import HttpError from "../errors/HttpError";
import User from "../models/user";

type Token = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

export default async (req: Request, res: Response, next: NextFunction) => {
  // read JWT from request
  let token = req.get("Authorization");

  // check if Authorization header was provided
  if (!token) {
    return next(new HttpError(401, "Authorization failed - no JWT provided."));
  }

  // extract secret key from process env
  const SECRET_KEY = process.env.SECRET_KEY;
  if (!SECRET_KEY) {
    return next(new Error("Process environment error - no secret key."));
  }

  //extract token from "Bearer {token}"
  token = token.split(" ")[1];
  if (!token) {
    return next(
      new HttpError(401, "Authorization failed - wrong Bearer token structure.")
    );
  }

  // decode token
  let decodedToken: Token;
  try {
    decodedToken = jwt.verify(token, SECRET_KEY) as Token;
  } catch (err) {
    return next(new HttpError(401, "Authorization failed - wrong JWT Token."));
  }
  if (!decodedToken) {
    return next(new HttpError(401, "Authorization failed - wrong JWT Token."));
  }

  // check if userId is a number
  if (Number.isNaN(+decodedToken.userId)) {
    return next(new HttpError(401, "Authorization failed - wrong User ID."));
  }

  // get user data required for authentication
  const user = await User.findByPk(+decodedToken.userId, {
    attributes: ["isAdmin", "isBanned", "isOwner"],
  });

  // check if user is banned
  if (user) {
    if (user.isBanned) {
      return next(new HttpError(401, "Authorization failed - User is banned."));
    }
    // set appropiate fields
    req.userId = +decodedToken.userId;
    req.isAdmin = !!user.isAdmin;
    req.isOwner = !!user.isOwner;
  } else {
    return next(new HttpError(401, "Authorization failed - User not found."));
  }

  // and go to actual request handler
  next();
};
