import { Request, Response, NextFunction } from 'express';

import Family from "../models/family";
import Spider from "../models/spider";
import Image from "../models/image";
import err from "../util/errorclg";

export default {

  getAbout: (req: Request, res: Response, next: NextFunction) => {
    const id: number = +req.params.id;
    let header: string | null;
    let latinName: string;
    let appearanceDesc: string | null;
    let behaviorDesc: string | null;
    let resources: Array<string>;
    Family.findByPk(id)
      .then((family: Family | null) => {
        if (!family) {
          return next();
        }
        header = family.name;
        latinName = family.latinName;
        appearanceDesc = family.appearanceDesc;
        behaviorDesc = family.behaviorDesc;
        resources = family.resources ? family.resources.split(" ") : [];

        return Spider.findAll({
          where: { familyId: family.id },
          include: Spider.associations.images,
        }).then((spiders) => {
          res.render("main/familyPage", {
            header,
            latinName,
            appearanceDesc,
            behaviorDesc,
            resources,
            spiders,
          });
        });
      })
      .catch(err);
  },

}