import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import Suggestion from "../models/suggestion";

const checkAdmin = (req: Request, next: NextFunction): void => {
  if (!req.isAdmin) {
    next(new HttpError(403, "User is not admin."));
  }
};

class adminController {
  // GET /admin/suggestion
  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    checkAdmin(req, next);
    try {
      const suggestions = (await Suggestion.findAll()) || [];
      res.status(200).json({ message: "Suggestions received.", suggestions });
    } catch (err) {
      next(err);
    }
  }

  async getSuggestionById(req: Request, res: Response, next: NextFunction) {
    checkAdmin(req, next);
    const id = +req.params.id;
    try {
      const suggestion = await Suggestion.findByPk(id);
      if (!suggestion) {
        next(new HttpError(404, "Suggestion not found."));
      }
      res.status(200).json({ message: "Suggestion received.", suggestion });
    } catch (err) {
      next(err);
    }
  }
}

export default new adminController();
