import { Request, Response, NextFunction } from "express";

import unlinkImg from "../util/unlinkImg";
import HttpError from "../errors/HttpError";
import Family from "../models/family";
import Spider from "../models/spider";

class FamilyController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const families = await Family.findAll();

      res.status(200).json({ families });
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;

    try {
      const family = await Family.findByPk(id);

      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      const name = family.name;
      const latinName = family.latinName;
      const appearanceDesc = family.appearanceDesc;
      const behaviorDesc = family.behaviorDesc;
      const resources = family.resources ? family.resources.split(" ") : [];

      const spiders = await Spider.findAll({
        attributes: ["latinName", "name", "id"],
        where: { familyId: family.id },
        include: Spider.associations.images,
      });

      res.status(200).json({
        name,
        latinName,
        appearanceDesc,
        behaviorDesc,
        resources,
        spiders,
      });
    } catch (err) {
      next(err);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    //add validation

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

    try {
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }
      const src = req.file.path.replace("src/public/", "");

      const newFamily = new Family({
        ...req.body,
        resources: resourcesStr,
        image: src,
      });
      await newFamily.save();
      res.status(201).json({
        message: "Family created.",
        family: { ...req.body, resources: resourcesStr, image: src },
      });
    } catch (err) {
      next(err);
    }
  }

  async put(req: Request, res: Response, next: NextFunction) {
    //add validation

    try {
      const family = await Family.findByPk(+req.params.id);
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      // restore resources to string
      let resourcesStr: string | null | undefined;
      if (typeof req.body.resources === "string") {
        resourcesStr = req.body.resources;
      } else if (req.body.resources === undefined) {
        resourcesStr = family.resources;
      } else if (req.body.resources == null) {
        resourcesStr = null;
      } else {
        resourcesStr = "";
        req.body.resources.forEach((source: string) => {
          resourcesStr += source + " ";
        });
      }

      if (req.file) {
        family.image && unlinkImg(family.image);
        family.image = req.file.path.replace("src/public/", "");
      }

      Object.assign(family, req.body, { resources: resourcesStr });

      await family.save();

      res.status(200).json({ message: "Family updated.", family });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const family = await Family.findByPk(id, {
        include: Family.associations.spiders,
      });
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      if (family.spiders && family.spiders?.length > 0) {
        throw new HttpError(422, "You can't delete family containing spiders!");
      }

      family.image && unlinkImg(family.image);

      await family.destroy();

      res.status(200).json({ message: "Family deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new FamilyController();
