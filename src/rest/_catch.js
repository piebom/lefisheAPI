const Joi = require('joi');
const Router = require('@koa/router');
const validate = require('./_validation');
const { requireAuthentication, makeRequireRole } = require('../core/auth');
const catchService = require('../service/catch');
const Role = require('../core/roles');

const findAllCatches = async (ctx) => {
    const catches = await catchService.findAllCatches();
    ctx.body = catches;
}

const findCatchByID = async (ctx) => {
    const { catchID } = ctx.params;
    const catchh = await catchService.findCatchByID(catchID);
    ctx.body = catchh;
}
findCatchByID.validationScheme = {
    params: Joi.object({
        catchID: Joi.number().required(),
    }),
};

const createCatch = async (ctx) => {
    const { name, date, description, weight, fisher, imageURL, session } = ctx.request.body;
    const catchh = await catchService.createCatch(name, date, description, weight, fisher, imageURL, session);
    ctx.body = catchh;
}
createCatch.validationScheme = {
    body: Joi.object({
        name: Joi.string().required(),
        date: Joi.string().required(),
        description: Joi.string().required(),
        weight: Joi.number().required(),
        fisher: Joi.number().required(),
        imageURL: Joi.string().required(),
        session: Joi.number().required(),
    }),
};

const updateCatch = async (ctx) => {
    const { catchID } = ctx.params;
    const { name, date, description, weight, fisher, imageURL, session } = ctx.request.body;
    const catchh = await catchService.updateCatch(catchID, name, date, description, weight, fisher, imageURL, session);
    ctx.body = catchh;
}
updateCatch.validationScheme = {
    params: Joi.object({
        catchID: Joi.number().required(),
    }),
    body: Joi.object({
        name: Joi.string().required(),
        date: Joi.string().required(),
        description: Joi.string().required(),
        weight: Joi.number().required(),
        fisher: Joi.number().required(),
        imageURL: Joi.string().required(),
        session: Joi.number().required(),
    }),
};

const deleteCatch = async (ctx) => {
    const { catchID } = ctx.params;
    const catchh = await catchService.deleteCatch(catchID);
    ctx.body = catchh;
}
deleteCatch.validationScheme = {
    params: Joi.object({
        catchID: Joi.number().required(),
    }),
};

module.exports = function installUserRoutes(app) {
    const requireAdmin = makeRequireRole(Role.ADMIN);
  
    const router = new Router({
        prefix: '/catch',
    });

    router.get('/', requireAuthentication, findAllCatches);
    router.get('/:catchID', requireAuthentication,validate(findCatchByID.validationScheme), findCatchByID);
    router.post('/', requireAuthentication, validate(createCatch.validationScheme), createCatch);
    router.put('/:catchID', requireAuthentication, validate(updateCatch.validationScheme), updateCatch);
    router.delete('/:catchID', requireAuthentication, validate(deleteCatch.validationScheme), deleteCatch);

    app.use(router.routes()).use(router.allowedMethods());
}