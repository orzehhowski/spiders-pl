import {Request, Response, NextFunction} from 'express';

export default {
  error404: (req: Request, res: Response, next: NextFunction) => {
    res.render("errors/404", {
      title: "Page not found",
    });
  }
}
