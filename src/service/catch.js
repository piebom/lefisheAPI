const { getChildLogger } = require('../core/logging');
const { verifyPassword, hashPassword } = require('../core/password');
const { generateJWT, verifyJWT } = require('../core/jwt');
const Role = require('../core/roles');
const ServiceError = require('../core/serviceError');
const catchRepository = require('../repository/catch');

const debugLog = (message, meta = {}) => {
    if (!this.logger) this.logger = getChildLogger('catch-service');
    this.logger.debug(message, meta);
}

const makeExposedCatch = ({
    catchID,
    name,
    date,
    description,
    weight,
    fisher,
    imageURL,
    session,
}) => ({
    catchID,
    name,
    date,
    description,
    weight,
    fisher,
    imageURL,
    session,
});

const makeExposedCatchWithToken = (catchh, token) => ({
    ...makeExposedCatch(catchh),
    token,
});

const findAllCatches = async () => {
    debugLog('findAllCatches');
    const catches = await catchRepository.findAll();
    return catches.map(makeExposedCatch);
}

const findCatchByID = async (catchID) => {
    debugLog('findCatchByID', { catchID });
    const catchh = await catchRepository.findCatchByID(catchID);
    if (!catchh) throw new ServiceError('Catch not found', 404);
    return makeExposedCatch(catchh);
}

const createCatch = async (name, date, description, weight, fisher, imageURL, session) => {
    debugLog('createCatch', { name, date, description, weight, fisher, imageURL, session });
    const newCatch = await catchRepository.createCatch({
        name,
        date,
        description,
        weight,
        fisher,
        imageURL,
        session,
    });
    return makeExposedCatch(newCatch);
}

const updateCatch = async (catchID, name, date, description, weight, fisher, imageURL, session) => {
    debugLog('updateCatch', { catchID, name, date, description, weight, fisher, imageURL, session });
    const catchh = await catchRepository.findCatchByID(catchID);
    if (!catchh) throw new ServiceError('Catch not found', 404);
    const updatedCatch = await catchRepository.updateCatch(catchID, {
        name,
        date,
        description,
        weight,
        fisher,
        imageURL,
        session,
    });
    return makeExposedCatch(updatedCatch);
}

const deleteCatch = async (catchID) => {
    debugLog('deleteCatch', { catchID });
    const catchh = await catchRepository.findCatchByID(catchID);
    if (!catchh) throw new ServiceError('Catch not found', 404);
    await catchRepository.deleteCatch(catchID);
}

const checkAndParseSession = async (authHeader) => {
    if (!authHeader) {
      throw ServiceError.unauthorized('You need to be signed in');
    }
  
    if (!authHeader.startsWith('Bearer ')) {
      throw ServiceError.unauthorized('Invalid authentication token');
    }
  
    const authToken = authHeader.substr(7);
    try {
      const {
        roles, userId,
      } = await verifyJWT(authToken);
  
      return {
        userId,
        roles,
        authToken,
      };
    } catch (error) {
      const logger = getChildLogger('user-service');
      logger.error(error.message, { error });
      throw ServiceError.unauthorized(error.message);
    }
  };
  
  const checkRole = (role, roles) => {
    console.log('checkRole', role, roles);
    const hasPermission = roles.includes(role);
    if (!hasPermission) {
      throw ServiceError.forbidden('You are not allowed to view this part of the application');
    }
  };

module.exports = {
    findAllCatches,
    findCatchByID,
    createCatch,
    updateCatch,
    deleteCatch,
};


