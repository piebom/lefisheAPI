const { getChildLogger } = require('../core/logging');
const { verifyPassword, hashPassword } = require('../core/password');
const { generateJWT, verifyJWT } = require('../core/jwt');
const Role = require('../core/roles');
const ServiceError = require('../core/serviceError');
const userRepository = require('../repository/user');

const debugLog = (message, meta = {}) => {
  if (!this.logger) this.logger = getChildLogger('user-service');
  this.logger.debug(message, meta);
};

const makeExposedUser = ({
  userID,
  name,
  lastname,
  email,
  roles,
}) => ({
  userID,
  name,
  lastname,
  email,
  roles,
});

const makeExposedUserWithToken = (user, token) => ({
  ...makeExposedUser(user),
  token,
});

const login = async (email, password) => {
  debugLog('login', { email, password });
  const user = await userRepository.findUserByEmail(email);
  if (!user) throw new ServiceError('Invalid credentials', 401);
  const passwordMatches = await verifyPassword(password, user.password);
  if (!passwordMatches) throw new ServiceError('Invalid credentials', 401);
  const token = await generateJWT(user);
  return makeExposedUserWithToken(user, token);
}

const register = async (name, lastname, email, password) => {
  debugLog('register', { name, lastname, email, password });
  const user = await userRepository.findUserByEmail(email);
  if (user) throw new ServiceError('User already exists', 409);
  const hashedPassword = await hashPassword(password);
  const newUser = await userRepository.createUser({
    name,
    lastname,
    email,
    password: hashedPassword,
    roles: [Role.USER],
  });
  const token = await generateJWT(newUser);
  return makeExposedUserWithToken(newUser, token);
}

const getAllUsers = async () => {
  debugLog('getAllUsers');
  const users = await userRepository.findAll();
  return users.map(makeExposedUser);
}

const getUserById = async (id) => {
  debugLog('getUserById', { id });
  const user = await userRepository.findUserById(id);
  if (!user) throw new ServiceError('User not found', 404);
  return makeExposedUser(user);
}

const updateUser = async (id, data) => {
  debugLog('updateUser', { id, data });
  const user = await userRepository.findUserById(id);
  if (!user) throw new ServiceError('User not found', 404);
  const updatedUser = await userRepository.updateUser(id, data);
  return makeExposedUser(updatedUser);
}

const deleteUser = async (id) => {
  debugLog('deleteUser', { id });
  const user = await userRepository.findUserById(id);
  if (!user) throw new ServiceError('User not found', 404);
  const deletedUser = await userRepository.deleteUser(id);
  return makeExposedUser(deletedUser);
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
  const hasPermission = roles.includes(role);
  if (!hasPermission) {
    throw ServiceError.forbidden('You are not allowed to view this part of the application');
  }
};

module.exports = {
  login,
  register,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  checkAndParseSession,
  checkRole,
};