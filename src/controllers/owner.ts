import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import User from "../models/user";

class adminController {
  // POST /sudo/set-admin/:id?undo
  async setAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.isOwner) {
      return next(new HttpError(403, "Only Owner can edit Admin rights."));
    }

    const id = +req.params.id;
    const undo = req.query.undo !== undefined;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return next(new HttpError(404, "User not found."));
      }
      if (undo && !user.isAdmin) {
        return next(new HttpError(400, "This user isn't admin."));
      }
      if (!undo && user.isAdmin) {
        return next(new HttpError(400, "This user allready is admin."));
      }

      user.isAdmin = !undo;
      await user.save();
      res.status(200).json({ message: "User admin rights changed." });
    } catch (err) {
      next(err);
    }
  }
}

export default new adminController();
