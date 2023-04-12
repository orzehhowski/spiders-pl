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
      const sources = family.sources ? family.sources.split(" ") : [];

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
        sources,
        spiders,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /family
  // body: { image!: file, latinName!, name?, behaviorDesc?, appearanceDesc?, imageAuthor?, sources? }
  async post(req: Request, res: Response, next: NextFunction) {
    // restore sources to string
    let sourcesStr: string | null;
    if (typeof req.body.sources === "string") {
      sourcesStr = req.body.sources;
    } else if (req.body.sources == null) {
      sourcesStr = null;
    } else {
      sourcesStr = "";
      req.body.sources.forEach((source: string) => {
        sourcesStr += source + " ";
      });
    }
    try {
      // check if file provided
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }

      // check if latin name is taken
      const isNameTaken = await Family.findOne({
        where: { latinName: req.body.latinName },
      });
      if (isNameTaken) {
        throw new HttpError(
          422,
          "Family with this latin name allready exists."
        );
      }

      // set correct file path
      const src = req.file.path.replace("src/public/", "");

      // create and save family if user is admin
      if (req.isAdmin) {
        const newFamily = await Family.create({
          ...req.body,
          sources: sourcesStr,
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
            sources: sourcesStr,
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
  // body: { image?: file, latinName?, name?, behaviorDesc?, appearanceDesc?, imageAuthor?, sources? }
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
        const isNameTaken = await Family.findOne({
          where: { latinName: latinName, id: { [Op.ne]: +req.params.id } },
        });
        if (isNameTaken) {
          throw new HttpError(
            422,
            "Family with this latin name allready exists."
          );
        }
      }

      // restore sources to string
      let sourcesStr: string | null | undefined;
      if (typeof req.body.sources === "string") {
        sourcesStr = req.body.sources;
      } else if (req.body.sources === undefined) {
        sourcesStr = family.sources;
      } else if (req.body.sources == null) {
        sourcesStr = null;
      } else {
        sourcesStr = "";
        req.body.sources.forEach((source: string) => {
          sourcesStr += source + " ";
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
        Object.assign(family, req.body, { sources: sourcesStr });

        if (req.body.imageAuthor) {
          family.image.author = req.body.imageAuthor;
        } else {
          if (req.file) {
            family.image.author = "";
          }
        }

        await family.save();
        await family.image.save();

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

        const newFamily = Object.assign(req.body, { sources: sourcesStr });
        const suggestion = await user.$create("suggestion", {
          ...newFamily,
          isNew: false,
          isFamily: true,
          resourceId: family.id,
        });

        // attach image if provided
        if (src) {
          await suggestion.$create("image", {
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
      return next(new HttpError(403, "Only admin can delete sources."));
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
