import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";

import Family from "../models/family";
import Spider from "../models/spider";

class FamilyController {
  get(req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;
    Family.findByPk(id)
      .then((family: Family | null) => {
        if (!family) {
          throw new HttpError(404, "family not found");
        }
        const name = family.name;
        const latinName = family.latinName;
        const appearanceDesc = family.appearanceDesc;
        const behaviorDesc = family.behaviorDesc;
        const resources = family.resources ? family.resources.split(" ") : [];

        return Spider.findAll({
          where: { familyId: family.id },
          include: Spider.associations.images,
        }).then((spiders) => {
          res.status(200).json({
            name,
            latinName,
            appearanceDesc,
            behaviorDesc,
            resources,
            spiders,
          });
        });
      })
      .catch((err) => {
        next(err);
      });
  }
}

export default new FamilyController();
