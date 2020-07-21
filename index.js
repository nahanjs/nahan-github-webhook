'use strict';

const fse = require('fs-extra');

function Webhook(secret) {

    return async (ctx, next) => {
        let flag = false;
        let brach_name = 'master';
        if(ctx.req.headers['x-github-event'] && ctx.req.headers['x-github-event'] === 'push'){//post from github hook 
            let signature = ctx.req.headers['x-hub-signature']; // extract signature from post
            if(signature){
                let data = await (req => {return new Promise((resolve, reject) => { // GET body
                    let data = '';
                    req.on('data', (chunk) => { data += chunk; });
                    req.on('end', () => { resolve(data); });
                })})(ctx.req);   

                if(data.slice(19,19+brach_name.length) === brach_name){
                    let crypto = require("crypto");
                    let hash='sha1=' + crypto.createHmac('sha1', secret).update(data).digest('hex'); //SHA1 decode
                    if(signature === hash){ 
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