module.exports.getHome = (req, res, next) => {
  res.render("main/home", {
    title: "Polskie Pająki",
  });
};
