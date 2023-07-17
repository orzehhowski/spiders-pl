import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";

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
        include: [Spider.associations.images, Spider.associations.sources],
      });
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }
      const sourcesStrings = spider.sources
        ? spider.sources.map((s) => s.source)
        : [];
      const { name, latinName, appearanceDesc, behaviorDesc, id, images } =
        spider;
      res.status(200).json({
        name,
        latinName,
        appearanceDesc,
        behaviorDesc,
        id,
        images,
        sources: sourcesStrings,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /spider
  // body: { image!: file, familyId!, latinName!, name?, behaviorDesc?, appearanceDesc?, imageAuthor?, sources? }
  async post(req: Request, res: Response, next: NextFunction) {
    const familyId = +req.body.familyId;

    try {
      const isLatinNameTaken = await Spider.findOne({
        where: { latinName: req.body.latinName },
      });
      if (isLatinNameTaken) {
        throw new HttpError(
          422,
          "Spider with this latin name allready exists."
        );
      }

      // check if image provided
      if (!req.file) {
        throw new HttpError(422, "Image is required.");
      }

      // correct image path
      const src = req.file?.path.replace("src/public/", "");

      // create image object
      const imageInfo = {
        src,
        author: req.body.imageAuthor,
      };

      const family = await Family.findByPk(familyId);
      if (!family) {
        throw new HttpError(404, "Family not found.");
      }
      // create spider if user is admin
      if (req.isAdmin) {
        const spider = await family.$create("spider", {
          ...req.body,
          userId: req.userId,
          adminId: req.userId,
        });

        await spider.$create("image", imageInfo);
        req.body.sources?.forEach(async (source: string) => {
          await spider.$create("source", { source });
        });
        res.status(201).json({
          message: "Spider created.",
          spider: {
            ...spider.dataValues,
            image: imageInfo,
            sources: req.body.sources || [],
          },
        });
      }
      // else send suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found");
        }

        const suggestion = await user.$create("suggestion", {
          ...req.body,
          isFamily: false,
          isNew: true,
        });

        await suggestion.$create("image", imageInfo);
        req.body.sources?.forEach(async (source: string) => {
          await suggestion.$create("source", { source });
        });
        res.status(200).json({
          message: "Create spider suggestion sent.",
          spider: {
            ...req.body,
            image: imageInfo,
          },
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // PUT /spider/:id
  // body: { latinName?, name?, behaviorDesc?, appearanceDesc?, sources? }
  async put(req: Request, res: Response, next: NextFunction) {
    const spiderId = +req.params.id;
    const latinName = req.body.latinName;
    try {
      // check if latin name is taken
      if (latinName) {
        const isNameTaken = await Spider.findOne({
          where: { latinName: latinName, id: { [Op.ne]: spiderId } },
        });
        if (isNameTaken) {
          throw new HttpError(
            422,
            "Spider with this latin name allready exists."
          );
        }
      }

      // find spider
      const spider = await Spider.findByPk(spiderId, {
        include: Spider.associations.sources,
      });
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }

      // if user is admin update spider
      if (req.isAdmin) {
        // if there are new sources...
        if (req.body.sources) {
          // delete these old
          if (spider.sources) {
            await Promise.all(
              spider.sources.map(async (source) => {
                await source.destroy();
              })
            );
          }
          // and create new
          await Promise.all(
            req.body.sources.map(async (source: string) => {
              await spider.$create("source", { source });
            })
          );
        }
        Object.assign(spider, req.body);
        await spider.save();

        res.status(200).json({ message: "Spider updated.", spider: spider });
      }
      // if not create a suggestion
      else {
        const user = await User.findByPk(req.userId);
        if (!user) {
          throw new HttpError(401, "User not found.");
        }
        const suggestion = await user.$create("suggestion", {
          ...req.body,
          isFamily: false,
          isNew: false,
          resourceId: spider.id,
        });

        if (req.body.sources) {
          req.body.sources.forEach(async (source: string) => {
            await suggestion.$create("source", { source });
          });
        }

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
      return next(new HttpError(403, "Only admin can delete sources."));
    }

    const id = +req.params.id;
    // check if images should be deleted too
    const includeImages: boolean = req.query.includeImages !== undefined;

    try {
      const include = [Spider.associations.sources];
      if (includeImages) {
        include.push(Spider.associations.sources);
      }
      const spider = await Spider.findByPk(id, {
        include,
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

      if (spider.sources) {
        spider.sources.forEach(async (source) => {
          source.destroy();
        });
      }
      await spider.destroy();

      res.status(200).json({ message: "Spider deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new SpiderController();
