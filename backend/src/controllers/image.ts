import { Request, Response, NextFunction } from "express";

import HttpError from "../errors/HttpError";
import Image from "../models/image";
import Spider from "../models/spider";
import unlinkImg from "../util/unlinkImg";

class imageController {
  // GET /image/:id
  async get(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "Image not found.");
      }

      res.status(200).json(image);
    } catch (err) {
      next(err);
    }
  }

  // POST /image
  // image should be posted only for spider, cuz suggestion and family can contain only 1 image
  async post(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new HttpError(422, "Image not provided.");
      }

      const src = req.file.path.replace("src/public/", "");
      const { author, spiderId } = req.body;

      const spider = await Spider.findByPk(spiderId);
      if (!spider) {
        throw new HttpError(404, "Spider not found.");
      }
      await spider.$create("image", { src, author });

      res
        .status(201)
        .json({ message: "Image created.", image: { src, author, spiderId } });
    } catch (err) {
      next(err);
    }
  }

  // PUT /image/:id
  async put(req: Request, res: Response, next: NextFunction) {
    //add validation
    //check if spider exists

    if (!req.isAdmin) {
      throw new HttpError(403, "Only admin can edit existing images");
    }

    const id = +req.params.id;

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "Image not found.");
      }

      if (req.file) {
        unlinkImg(image.src);
        image.src = req.file.path.replace("src/public/", "");
      }

      Object.assign(image, req.body);

      await image.save();

      res.status(200).json({ message: "Image updated.", image });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /image/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;

    if (!req.isAdmin) {
      throw new HttpError(403, "Only admin can delete images");
    }

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "Image not found.");
      }

      unlinkImg(image.src);
      await image.destroy();
      res.status(200).json({ message: "Image deleted." });
    } catch (err) {
      next(err);
    }
  }
}

export default new imageController();
