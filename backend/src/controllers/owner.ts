// Owner is status required only for adding/deleting admins - all other actions are allowed from admin level

import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import User from "../models/user";

class ownerController {
  // POST /sudo/set-admin/:id?undo
  async setAdmin(req: Request, res: Response, next: NextFunction) {
    // check permissions
    if (!req.isOwner) {
      return next(new HttpError(403, "Only Owner can edit Admin rights."));
    }

    // retrieve data from request
    const id = +req.params.id;
    const undo = req.query.undo !== undefined;

    try {
      // fetch user from db
      const user = await User.findByPk(id);
      // bunch of checks
      if (!user) {
        return next(new HttpError(404, "User not found."));
      }
      if (undo && !user.isAdmin) {
        return next(new HttpError(400, "This user isn't admin."));
      }
      if (!undo && user.isAdmin) {
        return next(new HttpError(400, "This user allready is admin."));
      }

      // change permissions and save it
      user.isAdmin = !undo;
      await user.save();

      // send response
      res.status(200).json({ message: "User admin rights changed." });
    } catch (err) {
      next(err);
    }
  }
}

export default new ownerController();
