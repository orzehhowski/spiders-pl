import { Request, Response, NextFunction } from 'express';

import Spider from "../models/spider";
import Image from "../models/image";

export default {
  getAbout: (req: Request, res: Response, next: NextFunction) => {

    Spider.findByPk(+req.params.id, { include: Spider.associations.images }).then((spider: Spider | null) => {
      if (!spider) {
        return next();
      }
      res.render("main/spiderPage", {
        title: spider.name || spider.latinName,
        header: spider.name,
        latinName: spider.latinName,
        appearanceDesc: spider.appearanceDesc,
        behaviorDesc: spider.behaviorDesc,
        resources: spider.resources ? spider.resources.split(" ") : [],
        gallery: spider.images,
      });
    });
  }
}
