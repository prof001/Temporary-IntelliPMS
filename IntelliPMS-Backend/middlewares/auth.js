const jwt = require('jsonwebtoken');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    const secret = 'intellPMSSecRet373838';

    const decoded = jwt.verify(token, secret);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Authentication Failed!' });
  }
};
