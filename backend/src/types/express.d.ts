declare namespace Express {
  export interface Request {
    userId?: number;
    isAdmin?: boolean;
    isOwner?: boolean;
  }
}