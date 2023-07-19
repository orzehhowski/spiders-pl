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
      // receive families from db
      const families = await Family.findAll({
        include: Family.associations.image,
      });

      // send response
      res.status(200).json({ families });
    } catch (err) {
      next(err);
    }
  }

  // GET /family/:id
  async get(req: Request, res: Response, next: NextFunction) {
    // read id from request
    const id: number = +req.params.id;

    try {
      // fetch family from db
      const family = await Family.findByPk(id, {
        include: Family.associations.sources,
      });

      // check if family exists
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      // receive data from family object
      const { name, latinName, appearanceDesc, behaviorDesc } = family;
      // set sources correctly
      const sources = family.sources ? family.sources.map((s) => s.source) : [];
      // fetch species in family with images
      const spiders = await Spider.findAll({
        attributes: ["latinName", "name", "id"],
        where: { familyId: family.id },
        include: Spider.associations.images,
      });

      // send response
      res.status(200).json({
        name,
        latinName,
        appearanceDesc,
        behaviorDesc,
        sources,
        spiders,
        id,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /family
  // body: { image!: file, latinName!: string, name?: string, behaviorDesc?: string, appearanceDesc?: string , imageAuthor?: string, sources?: string[] }
  async post(req: Request, res: Response, next: NextFunction) {
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
          userId: req.userId,
          adminId: req.userId,
        });
        // save path to image in db
        await newFamily.$create("image", {
          src,
          author: req.body.imageAuthor,
        });
        // save sources correctly
        if (req.body.sources) {
          req.body.sources.forEach(async (source: string) => {
            await newFamily.$create("source", {
              source,
            });
          });
        }

        // send response
        res.status(201).json({
          message: "Family created.",
          family: {
            ...newFamily.dataValues,
            image: { src, author: req.body.imageAuthor },
            sources: req.body.sources,
          },
        });
      }
      // if user is not admin, send suggestion
      else {
        // fetch user data
        const user = await User.findByPk(req.userId);
        if (user) {
          const family = {
            ...req.body,
          };
          // create suggestion depending on request body
          const suggestion = await user.$create("suggestion", {
            ...family,
            isFamily: true,
            isNew: true,
          });
          // save path to image in db
          await suggestion.$create("image", {
            src,
            author: req.body.imageAuthor,
          });
          // save sources correctly
          if (family.sources) {
            family.sources.forEach(async (source: string) => {
              await suggestion.$create("source", {
                source,
              });
            });
          }
          // send response
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
  // body: { image?: file, latinName?: string, name?: string, behaviorDesc?: string, appearanceDesc?: string, imageAuthor?: string, sources?: string[] }
  async put(req: Request, res: Response, next: NextFunction) {
    try {
      // fetch family from db
      const family = await Family.findByPk(+req.params.id, {
        include: [Family.associations.image, Family.associations.sources],
      });
      // check if family exists
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }

      // check if latin name is taken
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

      // update family if user is admin
      if (req.isAdmin) {
        // change family file if provided
        if (req.file) {
          family.image && unlinkImg(family.image.src);
          family.image.src = req.file.path.replace("src/public/", "");
        }

        // if there are new sources...
        if (req.body.sources) {
          // delete these old
          if (family.sources) {
            family.sources.forEach(async (source) => {
              await source.destroy();
            });
          }
          // and create new
          req.body.sources.forEach(async (source: string) => {
            await family.$create("source", { source });
          });
        }
        // update family
        Object.assign(family, req.body);

        // set image author correctly
        if (req.body.imageAuthor) {
          family.image.author = req.body.imageAuthor;
        } else {
          if (req.file) {
            family.image.author = "";
          }
        }

        // save changes
        await family.save();
        await family.image.save();

        // send response
        res.status(200).json({ message: "Family updated.", family });
      }

      // if user is not admin, then send suggestion
      else {
        // fetch user from db
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found.");
        }
        // check if image provided
        const src = req.file?.path.replace("src/public/", "") || null;

        // create suggestion
        const newFamily = Object.assign(req.body);
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
        // save sources correctly if provided
        if (newFamily.sources) {
          newFamily.sources.forEach(async (source: string) => {
            await suggestion.$create("source", { source });
          });
        }

        // send response
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
    // check if user is admin
    if (!req.isAdmin) {
      return next(new HttpError(403, "Only admin can delete resources."));
    }
    // read id from request
    const id = +req.params.id;

    try {
      // fetch family and resources attached to it
      const family = await Family.findByPk(id, {
        include: [
          Family.associations.spiders,
          Family.associations.image,
          Family.associations.sources,
        ],
      });

      // bunch of checks
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      if (family.spiders && family.spiders?.length > 0) {
        throw new HttpError(422, "You can't delete family containing spiders!");
      }

      // delete image
      family.image && unlinkImg(family.image.src);
      await family.image.destroy();

      // delete sources
      family.sources?.forEach(async (source) => {
        await source.destroy();
      });

      // and finally delete family
      await family.destroy();

      // send response
      res.status(200).json({ message: "Family deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new FamilyController();
