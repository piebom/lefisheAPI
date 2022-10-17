const Router = require('@koa/router');
const installUserRoutes = require('./_user');
const installSessionRoutes = require('./_session');
module.exports = (app) => {
    const router = new Router({
        prefix: '/api',
    });

    installUserRoutes(router);
    installSessionRoutes(router);

    app.use(router.routes()).use(router.allowedMethods());
};