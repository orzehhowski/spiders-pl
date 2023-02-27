import { Request, Response, NextFunction } from "express";

import HttpError from "../errors/HttpError";
import unlinkImg from "../util/unlinkImg";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";

class SpiderController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const spider = await Spider.findByPk(+req.params.id, {
        include: Spider.associations.images,
      });
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }
      Object.assign(spider, {
        resources: spider.resources ? spider.resources.split(" ") : [],
      });
      res.status(200).json(spider);
    } catch (err) {
      next(err);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    // add validation

    // restore resources to string
    let resourcesStr: string | null;
    if (typeof req.body.resources === "string") {
      resourcesStr = req.body.resources;
    } else if (req.body.resources == null) {
      resourcesStr = null;
    } else {
      resourcesStr = "";
      req.body.resources.forEach((source: string) => {
        resourcesStr += source + " ";
      });
    }

    const familyId = +req.body.familyId;

    try {
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }

      const src = req.file.path.replace("src/public/", "") || "";

      const imageInfo = {
        src,
        author: req.body.imageAuthor,
      };
      const family = await Family.findByPk(familyId);
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      const spider = await family.createSpider({
        ...req.body,
        resources: resourcesStr,
      });

      await spider.createImage(imageInfo);

      res.status(201).json({
        message: "Spider created.",
        spider: { ...spider.dataValues, image: imageInfo },
      });
    } catch (err) {
      next(err);
    }
  }

  async put(req: Request, res: Response, next: NextFunction) {
    // add validation

    const spiderId = +req.params.id;
    const latinName = req.body.latinName;
    try {
      if (latinName) {
        const isNameTaken = await Spider.findOne({
          where: { latinName: latinName },
        });
        if (isNameTaken) {
          throw new HttpError(
            422,
            "Spider with this latin name allready exists."
          );
        }
      }
      const spider = await Spider.findByPk(spiderId);
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }

      // restore resources to string
      let resourcesStr: string | null;
      if (typeof req.body.resources === "string") {
        resourcesStr = req.body.resources;
      } else if (req.body.resources === undefined) {
        resourcesStr = spider.resources;
      } else if (req.body.resources == null) {
        resourcesStr = "";
      } else {
        resourcesStr = "";
        req.body.resources.forEach((source: string) => {
          resourcesStr += source + " ";
        });
      }

      Object.assign(spider, req.body, { resources: resourcesStr });
      await spider.save();

      res.status(200).json({ message: "Spider updated.", spider: spider });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;
    const includeImages: boolean = req.query.includeImages ? true : false;

    try {
      const spider = await Spider.findByPk(id, {
        include: includeImages ? Spider.associations.images : undefined,
      });

      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }

      if (includeImages) {
        spider.images?.forEach((img) => {
          unlinkImg(img.src);
        });
        await Image.destroy({ where: { spiderId: spider.id } });
      }

      await spider.destroy();

      res.status(200).json({ message: "Spider deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new SpiderController();
