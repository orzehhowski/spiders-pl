import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import Suggestion from "../models/suggestion";
import Family from "../models/family";
import Spider from "../models/spider";

const checkAdmin = (req: Request): void => {
  if (!req.isAdmin) {
    throw new HttpError(403, "User is not admin.");
  }
};

class adminController {
  // GET /admin/suggestion
  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      checkAdmin(req);
      const suggestions = (await Suggestion.findAll()) || [];
      res.status(200).json({ message: "Suggestions received.", suggestions });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/suggestion/:id
  async getSuggestionById(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;
    try {
      checkAdmin(req);
      const suggestion = await Suggestion.findByPk(id);
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }
      res.status(200).json({ message: "Suggestion received.", suggestion });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/accept/:id
  // body: {name?, latinName?, appearanceDesc?, behaviorDesc?, sources?, familyId?}
  async acceptSuggestion(req: Request, res: Response, next: NextFunction) {
    interface data {
      name?: string;
      latinName: string;
      appearanceDesc?: string;
      behaviorDesc?: string;
      sources?: string;
      familyId?: number;
      userId?: number;
    }
    try {
      const id = +req.params.id;
      checkAdmin(req);
      const suggestion = await Suggestion.findByPk(id, {
        include: Suggestion.associations.image,
      });
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }
      const suggestionData: data = {
        name: suggestion.name,
        latinName: suggestion.latinName,
        appearanceDesc: suggestion.appearanceDesc,
        behaviorDesc: suggestion.behaviorDesc,
        sources: suggestion.sources,
        familyId: suggestion.familyId,
        userId: suggestion.userId,
      };

      const bodyData: data = {
        name: req.body.name,
        latinName: req.body.latinName,
        appearanceDesc: req.body.appearanceDesc,
        behaviorDesc: req.body.behaviorDesc,
        sources: req.body.sources,
        familyId: req.body.familyId,
      };

      const mergedData: data = {
        name: bodyData.name || suggestionData.name,
        latinName: bodyData.latinName || suggestionData.latinName,
        appearanceDesc:
          bodyData.appearanceDesc || suggestionData.appearanceDesc,
        behaviorDesc: bodyData.behaviorDesc || suggestionData.behaviorDesc,
        sources: bodyData.sources || suggestionData.sources,
        familyId: bodyData.familyId || suggestionData.familyId,
        userId: suggestionData.userId,
      };

      // check if latin name is taken
      const latinName = bodyData.latinName || suggestionData.latinName || null;
      if (latinName) {
        if (suggestion.isFamily) {
          if (await Family.findOne({ where: { latinName } })) {
            return next(new HttpError(422, "Latin name is taken."));
          }
        } else {
          if (await Spider.findOne({ where: { latinName } })) {
            return next(new HttpError(422, "Latin name is taken."));
          }
        }
      }

      // update existing resource
      if (!suggestion.isNew) {
        let resource: Family | Spider | null;
        if (suggestion.isFamily) {
          resource = await Family.findByPk(suggestion.resourceId);
        } else {
          resource = await Spider.findByPk(suggestion.resourceId);
        }
        if (!resource) {
          return next(
            new HttpError(
              422,
              "Wrong suggestion data - resource to edit doesn't exist."
            )
          );
        }

        // TODO BO TO SIE WYKURWI
        Object.assign(resource, mergedData);
        await resource.save();

        if (req.userId) {
          suggestion.adminId = req.userId;
        }
        suggestion.accepted = true;
        await suggestion.save();

        return res.status(200).json({ message: "Resource updated." });
      }
      // or create new resource
      else {
        let resource;
        if (suggestion.isFamily) {
          resource = await Family.create({
            ...mergedData,
            adminId: req.userId,
          });
        } else {
          resource = await Spider.create({
            ...mergedData,
            adminId: req.userId,
          });
        }

        if (suggestion.image) {
          resource.$create("image", {
            src: suggestion.image.src,
            author: suggestion.image.author,
          });
        }

        if (req.userId) {
          suggestion.adminId = req.userId;
        }
        suggestion.accepted = true;
        await suggestion.save();

        return res.status(201).json({ message: "Resource created." });
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}

export default new adminController();
