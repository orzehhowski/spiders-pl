import { Request, Response, NextFunction } from "express";

import unlinkImg from "../util/unlinkImg";
import HttpError from "../errors/HttpError";
import Family from "../models/family";
import Spider from "../models/spider";
import User from "../models/user";

class FamilyController {
  // GET /family
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const families = await Family.findAll();

      res.status(200).json({ families });
    } catch (err) {
      next(err);
    }
  }

  // GET /family/:id
  async get(req: Request, res: Response, next: NextFunction) {
    const id: number = +req.params.id;

    try {
      const family = await Family.findByPk(id);

      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      const { name, latinName, appearanceDesc, behaviorDesc } = family;
      const resources = family.resources ? family.resources.split(" ") : [];

      // fetch species in family with images
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

  // POST /family
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
    try {
      // check if file provided
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }
      // set correct file path
      const src = req.file.path.replace("src/public/", "");

      // create and save family if user is admin
      if (req.isAdmin) {
        const newFamily = new Family({
          ...req.body,
          resources: resourcesStr,
          image: src,
          userId: req.userId,
        });
        await newFamily.save();
        res.status(201).json({
          message: "Family created.",
          family: { ...req.body, resources: resourcesStr, image: src },
        });
      }
      // else create and send suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (user) {
          const family = {
            ...req.body,
            resources: resourcesStr,
            image: src,
          };
          user.$create("suggestion", {
            ...family,
            userId: req.userId,
            isFamily: true,
            isNew: true,
          });
          res.status(200).json({
            message: "Create family suggestion sent.",
            family,
          });
        } else {
          throw new HttpError(404, "User not found.");
        }
      }
    } catch (err) {
      next(err);
    }
  }

  // PUT /family/:id
  async put(req: Request, res: Response, next: NextFunction) {
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

      // update family if user is admin
      if (req.isAdmin) {
        // change file if provided
        if (req.file) {
          family.image && unlinkImg(family.image);
          family.image = req.file.path.replace("src/public/", "");
        }

        // update family
        Object.assign(family, req.body, { resources: resourcesStr });

        await family.save();

        res.status(200).json({ message: "Family updated.", family });
      }
      // else send suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found.");
        }
        // check if image provided
        const image = req.file?.path.replace("src/public/", "") || null;
        user.$create("suggestion", {
          ...req.body,
          resources: resourcesStr,
          isNew: false,
          isFamily: true,
          resourceId: family.id,
          image,
        });

        res.status(200).json({ message: "Edit family suggestion sent." });
      }
    } catch (err) {
      next(err);
    }
  }

  // DELETE /family:id
  async delete(req: Request, res: Response, next: NextFunction) {
    if (!req.isAdmin) {
      return next(new HttpError(403, "Only admin can delete resources."));
    }
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

      // delete image
      family.image && unlinkImg(family.image);

      await family.destroy();

      res.status(200).json({ message: "Family deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new FamilyController();
