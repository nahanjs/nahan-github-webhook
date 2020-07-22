'use strict';

const crypto = require("crypto");

function getReqBody(req) {
    return new Promise((resolve, reject) => { // GET body
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => { resolve(data); });
    });
}

function Webhook(secret) {

    return async (ctx, next) => {

        let flag = false;
        let brach_name = 'master';

        if (ctx.req.headers['x-github-event'] === 'push') { // post from github hook

            const signature = ctx.req.headers['x-hub-signature']; // extract signature from post

            if (signature) {

                const data = ctx.github_webhook || await getReqBody(ctx.req);
                ctx.github_webhook = data;

                const json = JSON.parse(data);
                const ref = json.ref;

                if (ref.split('/')[2] === brach_name) {

                    let hash = 'sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex'); //HmacSHA1 decode

                    if (signature === hash) {
                        // Validation successful
                        flag = true;
                    }
                }
            }
        }

        if (flag)
            await next(true);
        else
            await next(false);
    };
}

module.exports = Webhook;
