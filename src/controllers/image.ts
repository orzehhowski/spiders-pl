import { Request, Response, NextFunction } from "express";

import HttpError from "../errors/HttpError";
import Image from "../models/image";
import Spider from "../models/spider";
import unlinkImg from "../util/unlinkImg";

class imageController {
  async get(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "image not found");
      }

      res.status(200).json(image);
    } catch (err) {
      next(err);
    }
  }

  async post(req: Request, res: Response, next: NextFunction) {
    //add validation
    try {
      if (!req.file) {
        throw new HttpError(422, "image not provided");
      }

      const src = req.file.path.replace("src/public/", "");
      const { author, spiderId } = req.body;

      const spider = await Spider.findByPk(spiderId);
      if (!spider) {
        throw new HttpError(404, "spider not found");
      }

      await spider.createImage({ src, author });

      res
        .status(201)
        .json({ message: "image created", image: { src, author, spiderId } });
    } catch (err) {
      next(err);
    }
  }

  async put(req: Request, res: Response, next: NextFunction) {
    //add validation
    //check if spider exists

    const id = +req.params.id;

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "Image not found");
      }

      if (req.file) {
        unlinkImg(image.src);
        image.src = req.file.path.replace("src/public/", "");
      }

      Object.assign(image, req.body);

      await image.save();

      res.status(200).json({ message: "image updated", image });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const image = await Image.findByPk(id);

      if (!image) {
        throw new HttpError(404, "image not found");
      }
      console.log(image.src);
      unlinkImg(image.src);
      await image.destroy();
      res.status(200).json({ message: "image deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export default new imageController();
