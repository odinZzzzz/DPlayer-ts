export let config = {
    port: 1207,
    prefix: "v3",
    db: {
        mongo: {
            host: "127.0.0.1",
            port: 27017,
            username: null,
            password: null,
            rs_name: null,
        },
        redis: {
            host: "127.0.0.1",
            port: 6379,
            password: null,
        }
    },
    logLevel: "info",
    white_list: [],
    black_list: []
}
