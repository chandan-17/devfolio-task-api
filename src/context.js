const jwt = require('jsonwebtoken');
const { secrets } = require('./utils/config');
const logger = require('./utils/logger');
const { accessControl, priviledgedRoles } = require('./utils/accessControl');

const provideContext = async (req, res, next, db) => {
  const context = {
    db,
    logger,
    accessControl,
    accountType: null,
    userEmail: null,
    isAuthenticated: false,
    isPrivileged: false,
  };

  const authorizationHeader = null || req.headers.authorization;
  if (authorizationHeader) {
    const token = authorizationHeader.replace('Bearer ', '').replace('bearer ', '');
    try {
      const decoded = await jwt.verify(token, secrets.jwt);
      Object.assign(context, decoded);

      context.isAuthenticated = true;
      if (priviledgedRoles.includes(context.accountType)) {
        context.isPrivileged = true;
      }
    } catch (error) {
      // Return 401 if required
      logger({ type: `ERROR` }, 'Error at JWT Verification: ', error);
    }
  }

  req.context = context;
  next();
};

module.exports = provideContext;
