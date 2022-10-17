const { getChildLogger } = require('../core/logging');
const { verifyPassword, hashPassword } = require('../core/password');
const { generateJWT, verifyJWT } = require('../core/jwt');
const Role = require('../core/roles');
const ServiceError = require('../core/serviceError');
const sessionRepository = require('../repository/session');

const debugLog = (message, meta = {}) => {
    if (!this.logger) this.logger = getChildLogger('session-service');
    this.logger.debug(message, meta);
}

const makeExposedSession = ({
    sessionID,
    name,
    location,
    date,
}) => ({
    sessionID,
    name,
    location,
    date,
});

const makeExposedSessionWithToken = (session, token) => ({
    ...makeExposedSession(session),
    token,
});

const findAllSessions = async () => {
    debugLog('findAllSessions');
    const sessions = await sessionRepository.findAll();
    return sessions.map(makeExposedSession);
}

const findSessionByID = async (sessionID) => {
    debugLog('findSessionByID', { sessionID });
    const session = await sessionRepository.findSessionByID(sessionID);
    if (!session) throw new ServiceError('Session not found', 404);
    return makeExposedSession(session);
}

const createSession = async (name, location, date) => {
    debugLog('createSession', { name, location, date });
    const newSession = await sessionRepository.createSession({
        name,
        location,
        date,
    });
    return makeExposedSession(newSession);
}

const updateSession = async (sessionID, name, location, date) => {
    debugLog('updateSession', { sessionID, name, location, date });
    const session = await sessionRepository.findSessionByID(sessionID);
    if (!session) throw new ServiceError('Session not found', 404);
    const updatedSession = await sessionRepository.updateSession(sessionID, {
        name,
        location,
        date,
    });
    return makeExposedSession(updatedSession);
}

const deleteSession = async (sessionID) => {
    debugLog('deleteSession', { sessionID });
    const session = await sessionRepository.findSessionByID(sessionID);
    if (!session) throw new ServiceError('Session not found', 404);
    await sessionRepository.deleteSession(sessionID);
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
    findAllSessions,
    findSessionByID,
    createSession,
    updateSession,
    deleteSession,
};
