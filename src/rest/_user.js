const Joi = require('joi');
const Router = require('@koa/router');
const validate = require('./_validation');
const { requireAuthentication, makeRequireRole } = require('../core/auth');
const userService = require('../service/user');
const Role = require('../core/roles');

const login = async (ctx) => {
    const { email, password } = ctx.request.body;
    const user = await userService.login(email, password);
    ctx.body = user;
};
login.validationScheme = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

const register = async (ctx) => {
    const { name, lastname, email, password } = ctx.request.body;
    const user = await userService.register(name, lastname, email, password);
    ctx.body = user;
}
register.validationScheme = {
    body: Joi.object({
        name: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

const getAllUsers = async (ctx) => {
    const users = await userService.getAllUsers();
    ctx.body = users;
}

const getUserById = async (ctx) => {
    const { id } = ctx.params;
    const user = await userService.getUserById(id);
    ctx.body = user;
}
getUserById.validationScheme = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
};

const updateUser = async (ctx) => {
    const { id } = ctx.params;
    const { name, lastname, email, password } = ctx.request.body;
    const user = await userService.updateUser(id, name, lastname, email, password);
    ctx.body = user;
}
updateUser.validationScheme = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
    body: Joi.object({
        name: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

const deleteUser = async (ctx) => {
    const { id } = ctx.params;
    await userService.deleteUser(id);
    ctx.status = 204;
}
deleteUser.validationScheme = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
};

module.exports = function installUserRoutes(app) {
  const requireAdmin = makeRequireRole(Role.ADMIN);

  const router = new Router({
      prefix: '/user',
  });
  
  router.post('/login', validate(login.validationScheme), login);
  router.post('/register', validate(register.validationScheme), register);
  router.get('/', requireAuthentication, requireAdmin, getAllUsers);
  router.get('/:id', requireAuthentication, requireAdmin, validate(getUserById.validationScheme), getUserById);
  router.put('/:id', requireAuthentication, requireAdmin, validate(updateUser.validationScheme), updateUser);
  router.delete('/:id', requireAuthentication, requireAdmin, validate(deleteUser.validationScheme), deleteUser);

  app.use(router.routes()).use(router.allowedMethods());
};