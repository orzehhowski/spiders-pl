module.exports.error404 = (req, res, next) => {
  res.render("errors/404", {
    title: "Page not found",
  });
};
