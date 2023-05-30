import {configure, getLogger} from "log4js";
import {config} from "./config";


/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
export function preload() {
    initLog4js();

    // 自动解析ts的sourcemap
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });


    // 捕获普通异常
    process.on('uncaughtException', function (err) {
        console.warn(err?.message);
        console.warn(err?.stack);
        // App.SDKUtils.sendTextToDingBot(`
        //      ${App.startParam.id+ 'Caught exception: ' + err.stack}
        // `);
    });

    // 捕获async异常
    process.on('unhandledRejection', (reason: any, p) => {
        console.warn(reason?.message);
        console.warn(reason?.stack);
    });
}
function initLog4js(){
    configure({
        appenders: {
            fileout: { type: "file", filename: `./logs/info.log`
                ,
                "maxLogSize": 1048576*4,
                "backups": 7,
                layout: {
                    type: "pattern",
                    pattern: `%[[%f{1},%l,%o] [%d] [%p]%] %m`,
                    // pattern: `%[[${serverId}] [%f{1},%l,%o] [%d] [%p]%] %m`,
                },

            },
            datafileout: {
                type: "stdout",
                layout: {
                    type: "pattern",
                    pattern: `%[[%f{1}] [%d] [%p]%] %m`,
                },
            },
            consoleout: { type: "console" },
        },
        categories: {
            default: { appenders: ["fileout", "datafileout"],level: config.logLevel ,enableCallStack: true},

        },
    });


    const logger = getLogger( "console");
    console.debug = logger.debug.bind(logger);
    console.log = logger.debug.bind(logger);
    console.info = logger.info.bind(logger);
    console.warn = logger.warn.bind(logger);
    console.error = logger.error.bind(logger);
    console.trace = logger.trace.bind(logger);


}
