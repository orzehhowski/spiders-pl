import { Request, Response, NextFunction } from "express";

import HttpError from "../errors/HttpError";
import unlinkImg from "../util/unlinkImg";
import Spider from "../models/spider";
import Family from "../models/family";
import Image from "../models/image";
import User from "../models/user";

class SpiderController {
  // GET /spider/:id
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

  // POST /spider
  async post(req: Request, res: Response, next: NextFunction) {
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
      // check if image provided
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }

      // correct image path
      const src = req.file.path.replace("src/public/", "") || "";

      // create image object
      const imageInfo = {
        src,
        author: req.body.imageAuthor,
      };

      const family = await Family.findByPk(familyId);
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      // update spider if user is admin
      if (req.isAdmin) {
        const spider = await family.$create("spider", {
          ...req.body,
          resources: resourcesStr,
        });

        await spider.$create("image", imageInfo);

        res.status(201).json({
          message: "Spider created.",
          spider: { ...spider.dataValues, image: imageInfo },
        });
      }
      // else send suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found");
        }

        user.$create("suggestion", {
          ...req.body,
          resources: resourcesStr,
          isFamily: false,
          isNew: true,
          image: imageInfo.src,
          imageAuthor: imageInfo.author,
        });
        res.status(200).json({
          message: "Create spider suggestion sent.",
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // PUT /spider/:id
  async put(req: Request, res: Response, next: NextFunction) {
    const spiderId = +req.params.id;
    const latinName = req.body.latinName;
    try {
      // check if latin name is taken
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

      // find spider
      const spider = await Spider.findByPk(spiderId);
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }

      // restore resources to string
      let resourcesStr: string | null | undefined;
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

      // if user is admin update spider
      if (req.isAdmin) {
        Object.assign(spider, req.body, { resources: resourcesStr });
        await spider.save();

        res.status(200).json({ message: "Spider updated.", spider: spider });
      }
      // if not create a suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found.");
        }
        user.$create("suggestion", {
          ...req.body,
          resources: resourcesStr,
          isFamily: false,
          isNew: false,
          resourceId: spider.id,
        });

        res.status(200).json({ message: "Update spider suggestion sent." });
      }
    } catch (err) {
      next(err);
    }
  }

  // DELETE /spider/:id?inclugeImages
  async delete(req: Request, res: Response, next: NextFunction) {
    // check if user is admin
    if (!req.isAdmin) {
      return next(new HttpError(403, "Only admin can delete resources."));
    }

    const id = +req.params.id;
    // check if images should be deleted too
    const includeImages: boolean = req.query.includeImages !== undefined;

    try {
      const spider = await Spider.findByPk(id, {
        include: includeImages ? Spider.associations.images : undefined,
      });

      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }

      // delete images from filesystem and db
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
