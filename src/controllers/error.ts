import { Request, Response } from "express";

export default {
  error404: (req: Request, res: Response) => {
    res.render("errors/404", {
      title: "Page not found",
    });
  },
};
