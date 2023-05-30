import {htmlEncode} from "../utils/dan_util";
const Router = require('koa-router');
const cheerio = require('cheerio')
const fetch = require('node-fetch');
export const routerV3 = new Router();

routerV3.get('/v3', async (ctx, next) => {
    const {id, limit} = ctx.request.query;

    let data = await ctx.redis?.get(`danmaku${id}`);
    if (data) {
        data = JSON.parse(data);
        if (limit) {
            data = data.slice(-1 * parseInt(limit));
        }
        ctx.response.set('X-Koa-Redis', 'true');
    } else {
        data = await ctx.mongodb.find({player: id}) || [];
        // ctx.redis.set(`danmaku${id}`, JSON.stringify(data));
        if (limit) {
            data = data.slice(-1 * parseInt(limit));
        }
        ctx.response.set('X-Koa-Mongodb', 'true');
    }
    ctx.body = JSON.stringify({
        code: 0,
        data: data.map((item) => [item.time || 0, item.type || 0, item.color || 16777215, htmlEncode(item.author) || 'DPlayer', htmlEncode(item.text) || '']),
    });
});
routerV3.post('/v3', async (ctx, next) => {
    const body = ctx.request.body;
    body.ip = ctx.ips[0] || ctx.ip
    body.referer = ctx.headers.referer
    body.date = +new Date()
    const dan = new ctx.mongodb(body);
    try {
        const data = await dan.save();
        ctx.body = JSON.stringify({
            code: 0,
            data,
        });
        ctx.redis.del(`danmaku${data.player}`);
    } catch (err) {
        console.error(err);
        ctx.body = JSON.stringify({
            code: 1,
            msg: `Database error: ${err}`,
        });
    }
});
routerV3.get('/v3/bilibili', async (ctx, next) => {
    const bvid = ctx.request.query.bvid;
    let cid = ctx.request.query.cid;

    if (!cid && bvid) {
        cid = await ctx.redis?.get(`v3bilibiliaid2cid${bvid}`);
        if (!cid) {
            const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`);
            const result = await res.json();
            cid = result.data.cid;
            ctx.redis?.set(`v3bilibiliaid2cid${bvid}`, cid);
        }
    }
    let data = await ctx.redis?.get(`v3bilibilicid2dan${cid}`);
    if (data) {
        ctx.response.set('X-Koa-Redis', 'true');
        data = JSON.parse(data);
    } else {
        const res = await fetch(`https://api.bilibili.com/x/v1/dm/list.so?oid=${cid}`);
        const result = await res.text();
        const $ = cheerio.load(result.replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, ''), {
            xmlMode: true
        });
        data = $('d').map((i, el) => {
            const item = $(el);
            const p = item.attr('p').split(',');
            let type = 0;
            if (p[1] === '4') {
                type = 2;
            }
            else if (p[1] === '5') {
                type = 1;
            }
            return [[parseFloat(p[0]), type, parseInt(p[3]), p[6], item.text()]];
        }).get();
        ctx.redis?.set(`v3bilibilicid2dan${cid}`, JSON.stringify(data), 10 * 60);
        ctx.response.set('X-Koa-Origin', 'true');
    }
    ctx.body = JSON.stringify({
        code: 0,
        data: data,
    });
});


