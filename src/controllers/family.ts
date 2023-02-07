import { Request, Response, NextFunction } from 'express';

import Family from "../models/family";
import Species from "../models/spider";
import Image from "../models/image";
import err from "../util/errorclg";

export default {

  getAbout: (req: Request, res: Response, next: NextFunction) => {
    const id: number = +req.params.id;
  let header: string;
  let latinName: string;
  let appearanceDesc: string;
  let lifestyleDesc: string;
  let resources: string;
  Family.findByPk(id)
    .then((family) => {
      if (!family) {
        next();
      }
      header = family.name;
      latinName = family.latinName;
      appearanceDesc = family.appearanceDesc;
      lifestyleDesc = family.lifestyleDesc;
      resources = family.resources ? family.resources.split(" ") : [];
      return Species.findAll({
        where: { familyId: family.id },
        include: Image,
      }).then((species) => {
        res.render("main/familyPage", {
          header,
          latinName,
          appearanceDesc,
          lifestyleDesc,
          resources,
          species,
        });
      });
    })
    .catch(err);
};

}