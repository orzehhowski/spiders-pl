import { Request, Response, NextFunction } from 'express';

import Family from "../models/family";
import err from "../util/errorclg";

export default {
  getHome: (req: Request, res: Response, next: NextFunction) => {
    Family.findAll()
      .then((families) => {
        res.render("main/home", {
          families,
          title: "Polskie Pająki",
          header: "Rodziny",
        });
      })
      .catch(err);
  }
}