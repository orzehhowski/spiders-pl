import { Request, Response, NextFunction } from "express";
import HttpError from "../errors/HttpError";

import Spider from "../models/spider";
import Family from "../models/family";

class SpiderController {
  getById(req: Request, res: Response, next: NextFunction) {
    Spider.findByPk(+req.params.id, {
      include: Spider.associations.images,
    })
      .then((spider: Spider | null) => {
        if (!spider) {
          throw new HttpError(404, "Spider not found");
        }
        res.status(200).json(spider);
      })
      .catch((err) => {
        next(err);
      });
  }

  post(req: Request, res: Response, next: NextFunction) {
    // add validation

    let resourcesStr = "";
    if (typeof req.body.resources === "string") {
      resourcesStr = req.body.resources;
    } else {
      req.body.resources.forEach((source: string) => {
        resourcesStr += source + " ";
      });
    }

    const familyId = +req.body.familyId;

    const spiderInfo = {
      name: req.body.name,
      latinName: req.body.latinName,
      appearanceDesc: req.body.appearanceDesc,
      behaviorDesc: req.body.behaviorDesc,
      resources: resourcesStr,
    };
    const src = req.file?.path.replace("src/public/", "") || "";

    const imageInfo = {
      src,
      author: req.body.imageAuthor,
    };
    if (imageInfo.src) {
      Family.findByPk(familyId)
        .then((family) => {
          if (family) {
            return family.createSpider(spiderInfo);
          } else {
            throw new HttpError(404, "family not found");
          }
        })
        .then((spider) => {
          return spider.createImage(imageInfo);
        })
        .then(() => {
          res.status(201).json({
            message: "Spider created",
            spider: { ...spiderInfo, image: imageInfo },
          });
        })
        .catch((err) => {
          next(err);
        });
    } else {
      next(new HttpError(422, "Image is required"));
    }
  }
}

export default new SpiderController();
