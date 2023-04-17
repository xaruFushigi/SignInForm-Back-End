const RootLink = (req, res, db) => {
        db.select('*')
          .from('users')
          .then(response => {
              res.json(response);
          })
          .catch(error => {
              res.status(400).json('there has been an error: ', error);
          });
};

module.exports = {
    RootLink: RootLink
};
