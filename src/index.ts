import {preload} from "./preload";
import * as Koa from 'koa';
import * as koaBodyparser from 'koa-bodyparser';
import {config} from "./config";
import {initMongo} from "./model/danmuSchema";
import {routerV3} from "./route/routerV3";

preload();


console.info('🎉🎉🎉🎉 DPlayer---TS start! Cheers! 🎉🎉🎉🎉🎉');
console.info('🎉🎉🎉🎉 DPlayer---TS start! Cheers! 🎉🎉🎉🎉🎉');
console.info('🎉🎉🎉🎉 DPlayer---TS start! Cheers! 🎉🎉🎉🎉🎉');


async function main() {

    const app = new Koa();
    app.proxy = true;

    // 初始化mongo
    let DanModel = await initMongo();
    app.context.mongodb = DanModel;
    // 初始化redis （选填）
    // app.context.redis = redis;

    app.use(koaBodyparser());
    app.use(async (ctx, next) => {
        console.info(`${ctx.url}, user IP: ${ctx.ips[0] || ctx.ip}`);
        ctx.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild',
            'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS',
            'Content-Type': 'application/json; charset=UTF-8',
            'Cache-Control': 'no-cache',
        });
        await next();
    });
    const blacklist = config.black_list || []
    const whitelist = config.white_list || []
    app.use(async (ctx, next) => {
        const ip = ctx.ips[0] || ctx.ip;
        const referer = ctx.request.headers.referer;

        const refererAllowed = (whitelist && whitelist.indexOf(referer) !== -1) || blacklist.indexOf(referer) === -1;
        const ipAllowed = (whitelist && whitelist.indexOf(ip) !== -1) || blacklist.indexOf(ip) === -1;

        if (refererAllowed && ipAllowed) {
            await next();
        } else {
            ctx.response.status = 403;

            ctx.body = JSON.stringify({
                code: 1,
                msg: `${!refererAllowed ? '该站点' : '你的 IP '}没有访问权限`,
            });
        }
    });
    app.use(routerV3.routes()).use(routerV3.allowedMethods());
    app.listen(config.port);
    console.info('Listening Port ' + config.port);


}

main()
