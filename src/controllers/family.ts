import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

import unlinkImg from "../util/unlinkImg";
import HttpError from "../errors/HttpError";
import Family from "../models/family";
import Spider from "../models/spider";
import User from "../models/user";

class FamilyController {
  // GET /family
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const families = await Family.findAll({
        include: Family.associations.image,
      });

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
  // body: { image!: file, latinName!, name?, behaviorDesc?, appearanceDesc?, imageAuthor?, resources? }
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
        const newFamily = await Family.create({
          ...req.body,
          resources: resourcesStr,
          userId: req.userId,
          adminId: req.userId,
        });
        await newFamily.$create("image", {
          src,
          author: req.body.imageAuthor,
        });

        res.status(201).json({
          message: "Family created.",
          family: {
            ...newFamily.dataValues,
            image: { src, author: req.body.imageAuthor },
          },
        });
      }
      // else create and send suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (user) {
          const family = {
            ...req.body,
            resources: resourcesStr,
          };
          const suggestion = await user.$create("suggestion", {
            ...family,
            isFamily: true,
            isNew: true,
          });
          await suggestion.$create("image", {
            src,
            author: req.body.imageAuthor,
          });
          res.status(200).json({
            message: "Create family suggestion sent.",
            family: {
              ...family,
              image: {
                src,
                author: req.body.imageAuthor,
              },
            },
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
  // body: { image?: file, latinName?, name?, behaviorDesc?, appearanceDesc?, imageAuthor?, resources? }
  async put(req: Request, res: Response, next: NextFunction) {
    try {
      const family = await Family.findByPk(+req.params.id, {
        include: Family.associations.image,
      });
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      const latinName = req.body.latinName;

      if (latinName) {
        const isNameTaken = await Spider.findOne({
          where: { latinName: latinName, id: { [Op.ne]: +req.params.id } },
        });
        if (isNameTaken) {
          throw new HttpError(
            422,
            "Family with this latin name allready exists."
          );
        }
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
          family.image && unlinkImg(family.image.src);
          family.image.src = req.file.path.replace("src/public/", "");
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
        const src = req.file?.path.replace("src/public/", "") || null;

        const newFamily = Object.assign(req.body, { resources: resourcesStr });
        const suggestion = await user.$create("suggestion", {
          ...newFamily,
          isNew: false,
          isFamily: true,
          resourceId: family.id,
        });

        // attach image if provided
        if (src) {
          suggestion.$create("image", {
            src,
            author: req.body.imageAuthor,
          });
        }

        res.status(200).json({
          message: "Edit family suggestion sent.",
          family: {
            ...newFamily,
            image: { src, author: req.body.imageAuthor },
          },
        });
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
        include: [Family.associations.spiders, Family.associations.image],
      });
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      if (family.spiders && family.spiders?.length > 0) {
        throw new HttpError(422, "You can't delete family containing spiders!");
      }

      // delete image
      family.image && unlinkImg(family.image.src);

      await family.image.destroy();
      await family.destroy();

      res.status(200).json({ message: "Family deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new FamilyController();
