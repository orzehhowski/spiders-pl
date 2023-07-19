import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";
import Suggestion from "../models/suggestion";
import Family from "../models/family";
import Spider from "../models/spider";
import { Op } from "sequelize";
import User from "../models/user";

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

      // fetch suggestions from db
      const suggestions = (await Suggestion.findAll()) || [];

      // send response
      res.status(200).json({ message: "Suggestions received.", suggestions });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/suggestion/:id
  async getSuggestionById(req: Request, res: Response, next: NextFunction) {
    // receive suggestion id
    const id = +req.params.id;
    try {
      checkAdmin(req);

      // fetch suggestion drom db
      const suggestion = await Suggestion.findByPk(id, {
        include: Suggestion.associations.sources,
      });

      // check if suggestion exists
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }

      // send response
      res.status(200).json({ message: "Suggestion received.", suggestion });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/accept/:id
  // body: {name?: string, latinName?: string, appearanceDesc?: string, behaviorDesc?: string, sources?: string[], familyId?: number}
  async acceptSuggestion(req: Request, res: Response, next: NextFunction) {
    // create interface for suggestion data
    interface data {
      // syntax required to allow iteration through values
      [key: string]: string | string[] | number | undefined;
      name?: string;
      latinName?: string;
      appearanceDesc?: string;
      behaviorDesc?: string;
      sources?: string[];
      familyId?: number;
      userId?: number;
    }
    try {
      // receive suggestion ID
      const id = +req.params.id;
      checkAdmin(req);

      // fetch suggestion from db
      const suggestion = await Suggestion.findByPk(id, {
        include: [
          Suggestion.associations.image,
          Suggestion.associations.sources,
        ],
      });

      // check if suggestion exists and is acceptable
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }

      if (suggestion.accepted || suggestion.rejected) {
        return next(new HttpError(400, "Suggestion outdated."));
      }

      // list of "data" interface field names to iterate
      const fieldNames = [
        "name",
        "latinName",
        "appearanceDesc",
        "behaviorDesc",
        "sources",
        "familyId",
      ];

      // data from the suggestion
      const suggestionData: data = {
        name: suggestion.name,
        latinName: suggestion.latinName,
        appearanceDesc: suggestion.appearanceDesc,
        behaviorDesc: suggestion.behaviorDesc,
        sources: suggestion.sources?.map((s) => s.source),
        familyId: suggestion.familyId,
        userId: suggestion.userId,
      };

      // data from the body - it should override suggestion data
      const bodyData: data = {
        name: req.body.name,
        latinName: req.body.latinName,
        appearanceDesc: req.body.appearanceDesc,
        behaviorDesc: req.body.behaviorDesc,
        sources: req.body.sources,
        familyId: req.body.familyId,
      };

      // merged data from suggestion and body
      const mergedData: data = {};
      const nonUndefinedData: data = {};

      // merging suggestion and body data
      fieldNames.forEach((field) => {
        // firstly field from body, then from suggestion, then undefined
        mergedData[field] =
          bodyData[field] ?? suggestionData[field] ?? undefined;
        // nonUndefinedData contains only fields that are not udefined
        if (mergedData[field] !== undefined) {
          nonUndefinedData[field] = mergedData[field];
        }
      });

      // check if latin name is taken
      const latinName = bodyData.latinName || suggestionData.latinName || null;
      // mmmm 4 ifs nested
      if (latinName) {
        if (suggestion.isNew) {
          if (suggestion.isFamily) {
            if (await Family.findOne({ where: { latinName } })) {
              return next(new HttpError(422, "Latin name is taken."));
            }
          } else {
            if (await Spider.findOne({ where: { latinName } })) {
              return next(new HttpError(422, "Latin name is taken."));
            }
          }
        } else {
          if (suggestion.isFamily) {
            if (
              await Family.findOne({
                where: { latinName, id: { [Op.ne]: suggestion.resourceId } },
              })
            ) {
              return next(new HttpError(422, "Latin name is taken."));
            }
          } else {
            if (
              await Spider.findOne({
                where: { latinName, id: { [Op.ne]: suggestion.resourceId } },
              })
            ) {
              return next(new HttpError(422, "Latin name is taken."));
            }
          }
        }
      }

      // update existing resource

      // if suggestion is about existing resource, update it
      if (!suggestion.isNew) {
        let resource: Family | Spider | null;

        // fetch spider or family from db
        if (suggestion.isFamily) {
          resource = await Family.findByPk(suggestion.resourceId);
        } else {
          resource = await Spider.findByPk(suggestion.resourceId);
        }

        // check if resource exists
        if (!resource) {
          return next(
            new HttpError(
              422,
              "Wrong suggestion data - resource to edit doesn't exist."
            )
          );
        }

        // update resource using data from suggestion and body
        await resource.update(nonUndefinedData);

        // update sources attached to resource if provided
        if (nonUndefinedData.sources) {
          // delete these old
          if (resource.sources) {
            resource.sources.forEach(async (source) => {
              await source.destroy();
            });
          }
          // and create these new
          // sometimes one-element array in request is converted to just string
          if (typeof nonUndefinedData.sources == "string") {
            nonUndefinedData.sources = [nonUndefinedData.sources];
          }
          nonUndefinedData.sources.forEach((source) => {
            resource?.$create("source", { source });
          });
        }

        // save id of admin that accepted this suggestion
        if (req.userId) {
          suggestion.adminId = req.userId;
        }

        // mark suggestion as accepted and save it
        suggestion.accepted = true;
        await suggestion.save();

        // send response
        return res.status(200).json({ message: "Resource updated." });
      }

      // if suggestion is about new resource, create it
      else {
        // create spider or family using merged data and store it variable
        let resource: Spider | Family;
        if (suggestion.isFamily) {
          resource = await Family.create({
            ...mergedData,
            userId: suggestionData.userId,
            adminId: req.userId,
          });
        } else {
          resource = await Spider.create({
            ...mergedData,
            userId: suggestionData.userId,
            adminId: req.userId,
          });
        }
        // create sources if attached
        if (mergedData.sources) {
          // sometimes one-element array in request is converted to just string
          if (typeof mergedData.sources == "string") {
            mergedData.sources = [mergedData.sources];
          }
          mergedData.sources.forEach(async (source) => {
            await resource.$create("source", { source });
          });
        }

        // attach image from suggestion to spider/family
        if (suggestion.image) {
          resource.$create("image", {
            src: suggestion.image.src,
            author: suggestion.image.author,
          });
        }

        // save id of admin that accepted this suggestion
        if (req.userId) {
          suggestion.adminId = req.userId;
        }

        // mark as accepted and save
        suggestion.accepted = true;
        await suggestion.save();

        // send response
        return res.status(201).json({ message: "Resource created." });
      }
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/reject/:id
  async rejectSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      checkAdmin(req);

      // fetch id from request
      const id = +req.params.id;

      // fetch suggestion from database
      const suggestion = await Suggestion.findByPk(id);

      // check if suggestion exists and is acceptable
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }

      if (suggestion.accepted || suggestion.rejected) {
        return next(new HttpError(400, "Suggestion outdated."));
      }

      // mark as rejected and save id of admin that rejected it
      suggestion.rejected = true;
      if (req.userId) {
        suggestion.adminId = req.userId;
      }

      // save suggestion and send response
      await suggestion.save();
      return res.status(200).json({ message: "Suggestion rejected." });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/ban/:id?undo
  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      checkAdmin(req);

      // fetch user ID and user data
      const id = +req.params.id;
      const user = await User.findByPk(id);
      // check if user should be banned or unbanned
      const undo = req.query.undo !== undefined;

      // check if user is correct
      if (!user) {
        return next(new HttpError(404, "User not found."));
      }

      if (user.isAdmin) {
        return next(new HttpError(400, "Admin can't be banned."));
      }

      // ban/unban user
      if (undo) {
        if (!user.isBanned) {
          return next(new HttpError(400, "User is not banned."));
        }
        user.isBanned = false;
      } else {
        user.isBanned = true;
      }

      // save changes and send response
      await user.save();
      return res
        .status(200)
        .json({ message: undo ? "User unbanned." : "User banned." });
    } catch (err) {
      next(err);
    }
  }
}

export default new adminController();
