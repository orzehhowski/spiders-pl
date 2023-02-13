import { Request, Response } from "express";

class ErrorController {
  error404(req: Request, res: Response) {
    res.render("errors/404", {
      title: "Page not found",
    });
  }
}

export default new ErrorController();
