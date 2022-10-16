const Router = require('@koa/router');
const installUserRoutes = require('./_user');
module.exports = (app) => {
    const router = new Router({
        prefix: '/api',
    });

    installUserRoutes(router);

    app.use(router.routes()).use(router.allowedMethods());
};