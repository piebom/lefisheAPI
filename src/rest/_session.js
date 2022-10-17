const Joi = require('joi');
const Router = require('@koa/router');
const validate = require('./_validation');
const { requireAuthentication, makeRequireRole } = require('../core/auth');
const sessionService = require('../service/session');
const Role = require('../core/roles');

const findAllSessions = async (ctx) => {
    const sessions = await sessionService.findAllSessions();
    ctx.body = sessions;
}

const findSessionByID = async (ctx) => {
    const { sessionID } = ctx.params;
    const session = await sessionService.findSessionByID(sessionID);
    ctx.body = session;
}
findSessionByID.validationScheme = {
    params: Joi.object({
        sessionID: Joi.number().required(),
    }),
};

const createSession = async (ctx) => {
    const { name, location, date } = ctx.request.body;
    const session = await sessionService.createSession(name, location, date);
    ctx.body = session;
}
createSession.validationScheme = {
    body: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        date: Joi.string().required(),
    }),
};

const updateSession = async (ctx) => {
    const { sessionID } = ctx.params;
    const { name, location, date } = ctx.request.body;
    const session = await sessionService.updateSession(sessionID, name, location, date);
    ctx.body = session;
}
updateSession.validationScheme = {
    params: Joi.object({
        sessionID: Joi.number().required(),
    }),
    body: Joi.object({
        name: Joi.string().required(),
        location: Joi.string().required(),
        date: Joi.string().required(),
    }),
};

const deleteSession = async (ctx) => {
    const { sessionID } = ctx.params;
    const session = await sessionService.deleteSession(sessionID);
    ctx.body = session;
}
deleteSession.validationScheme = {
    params: Joi.object({
        sessionID: Joi.number().required(),
    }),
};

module.exports = function installUserRoutes(app) {
    const requireAdmin = makeRequireRole(Role.ADMIN);
  
    const router = new Router({
        prefix: '/session',
    });

    router.get('/', requireAuthentication, findAllSessions);
    router.get('/:sessionID',requireAuthentication, validate(findSessionByID.validationScheme), findSessionByID);
    router.post('/',requireAuthentication, validate(createSession.validationScheme), createSession);
    router.put('/:sessionID', requireAuthentication, validate(updateSession.validationScheme), updateSession);
    router.delete('/:sessionID', requireAuthentication, validate(deleteSession.validationScheme), deleteSession);

    app.use(router.routes()).use(router.allowedMethods());
}