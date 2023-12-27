const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
// const db = require("../db");
const User = require("../db/models/user");
const Company = require("../db/models/company");
// const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.status(401).send({ message: "Unauthorized!" });
}

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  User.find(
    {
      _id: { $in: req.userId }
    },
    (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      // console.log(user[0].role.length)
      for (let i = 0; i < user[0].role.length; i++) {
        if (user[i]?.role == "admin") {
          next();
          return;
        }
      }
      res.status(403).send({ message: "Require Admin Role!" });
      return;
    }
  );
};

const isCompany = (req, res, next) => {
  Company.find(
    {
      _id: { $in: req.userId }
    },
    (err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user.length == 1) {
        next();
        return;
      }
      res.status(403).send({ message: "Company is not found!" });
      return;
    }
  );
};

const isModerator = (req, res, next) => {
  User.findById(req.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles }
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};


const authJwt = {
  verifyToken,
  isAdmin,
  isCompany,
  isModerator
};
module.exports = authJwt;