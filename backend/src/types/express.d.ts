// this file adds to express Request object fields that helps with user authorization

declare namespace Express {
  export interface Request {
    userId?: number;
    isAdmin?: boolean;
    isOwner?: boolean;
  }
}
