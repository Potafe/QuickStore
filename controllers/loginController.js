exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("login");
};
