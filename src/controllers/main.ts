import { Request, Response } from "express";

import Family from "../models/family";
import err from "../util/errorclg";

export default {
  getHome: (req: Request, res: Response) => {
    Family.findAll()
      .then((families) => {
        res.render("main/home", {
          families,
          title: "Polskie Pająki",
          header: "Rodziny",
        });
      })
      .catch(err);
  },
};
