const Protected = (req, res, app) => {
  try {
    res.send("Protected route accessed successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  Protected: Protected,
};
