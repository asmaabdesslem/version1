const jwt = require('jsonwebtoken');
const User = require('../model/User')


const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, 'secret', (err, decodedToken) => {
      if (err) {
        res.status(200).json({
          message: "you must log in *"
        });
        next();

      } else {

        next();
      }
    });
  }else {
    console.log("There is no token ");
    res.status(200).json({
      message: "you must log in *"
    });
  }
};

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'secret', async (err, decodedToken) => {
      if (err) {
        res.status(200).json({
          message: "you must log in *"
        });
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        req.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    res.status(200).json({
      message: "you must log in *"
    });
  }
};

const notReqAuthentication = (req, res, next) => {
  // VERIFYING USER
  const token = req.cookies.jwt;
  // IF THERE IS A TOKEN NAME WITH JWT THEN IT IT WON'T LET USER GO SOME ROUTE
  if (token) {
    console.log("There is a token ");
    res.status(200).json({
      message: "you must log out *"
    });
    

  } else {
    // IF THERE IS NO TOKEN THEN USER ALLOW TO VISIT CERTAIN ROUTE
    console.log("There is no token ");
    next();
  }
}

module.exports = { requireAuth, checkUser, notReqAuthentication };