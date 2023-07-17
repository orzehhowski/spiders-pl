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
      const suggestion = await Suggestion.findByPk(id, {
        include: Suggestion.associations.sources,
      });
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
      const id = +req.params.id;
      checkAdmin(req);
      const suggestion = await Suggestion.findByPk(id, {
        include: [
          Suggestion.associations.image,
          Suggestion.associations.sources,
        ],
      });
      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }

      if (suggestion.accepted || suggestion.rejected) {
        return next(new HttpError(400, "Suggestion outdated."));
      }

      const fieldNames = [
        "name",
        "latinName",
        "appearanceDesc",
        "behaviorDesc",
        "sources",
        "familyId",
      ];

      const suggestionData: data = {
        name: suggestion.name,
        latinName: suggestion.latinName,
        appearanceDesc: suggestion.appearanceDesc,
        behaviorDesc: suggestion.behaviorDesc,
        sources: suggestion.sources?.map((s) => s.source),
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

      const mergedData: data = {};
      const nonUndefinedData: data = {};

      fieldNames.forEach((field) => {
        mergedData[field] =
          bodyData[field] ?? suggestionData[field] ?? undefined;
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

        await resource.update(nonUndefinedData);
        if (nonUndefinedData.sources) {
          if (resource.sources) {
            resource.sources.forEach(async (source) => {
              await source.destroy();
            });
          }
          if (typeof nonUndefinedData.sources == "string") {
            nonUndefinedData.sources = [nonUndefinedData.sources];
          }
          nonUndefinedData.sources.forEach((source) => {
            resource?.$create("source", { source });
          });
        }

        if (req.userId) {
          suggestion.adminId = req.userId;
        }
        suggestion.accepted = true;
        await suggestion.save();

        return res.status(200).json({ message: "Resource updated." });
      }
      // or create new resource
      else {
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
        if (mergedData.sources) {
          if (typeof mergedData.sources == "string") {
            mergedData.sources = [mergedData.sources];
          }
          mergedData.sources.forEach(async (source) => {
            await resource.$create("source", { source });
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
      next(err);
    }
  }

  // POST /admin/reject/:id
  async rejectSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      checkAdmin(req);
      const id = +req.params.id;

      const suggestion = await Suggestion.findByPk(id);

      if (!suggestion) {
        return next(new HttpError(404, "Suggestion not found."));
      }

      if (suggestion.accepted || suggestion.rejected) {
        return next(new HttpError(400, "Suggestion outdated."));
      }

      suggestion.rejected = true;
      if (req.userId) {
        suggestion.adminId = req.userId;
      }
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
      const id = +req.params.id;
      const user = await User.findByPk(id);
      const undo = req.query.undo !== undefined;

      if (!user) {
        return next(new HttpError(404, "User not found."));
      }

      if (user.isAdmin) {
        return next(new HttpError(400, "Admin can't be banned."));
      }

      if (undo) {
        if (!user.isBanned) {
          return next(new HttpError(400, "User is not banned."));
        }
        user.isBanned = false;
      } else {
        user.isBanned = true;
      }

      await user.save();
      return res
        .status(200)
        .json({ message: undo ? "User unbanned." : "User banned." });
    } catch (err) {
      next(err);
    }
  }

  // PUT /admin/set-admin/:id?undo
  //   async setAdmin(req: Request, res: Response, next: NextFunction) {
  //     if (!req.isAdmin) {
  //       return next(new HttpError(403, "Admin rights required."));
  //     }

  //     const email = req.params.email;
  //     const undo = req.query.undo !== undefined;

  //     try {
  //       const user = await User.findOne({ where: { email } });
  //       if (!user) {
  //         return next(new HttpError(404, "User not found."));
  //       }

  //       user.isAdmin = !undo;
  //       await user.save();
  //       res.status(200).json({ message: "User admin rights changed." });
  //     } catch (err) {
  //       next(err);
  //     }
  //   }
}

export default new adminController();
