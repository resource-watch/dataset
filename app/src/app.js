const Koa = require('koa');
const logger = require('logger');
const koaLogger = require('koa-logger');
const mongoose = require('mongoose');
const config = require('config');
const loader = require('loader');
const koaSimpleHealthCheck = require('koa-simple-healthcheck');
const { RWAPIMicroservice } = require('rw-api-microservice-node');
const ErrorSerializer = require('serializers/error.serializer');
const sleep = require('sleep');
const koaValidate = require('koa-validate');
const koaBody = require('koa-body');

let mongooseOptions = require('../../config/mongoose');

const mongoUri = process.env.MONGO_URI || `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.database')}`;

let retries = 10;

// KUBE CLUSTER
if (mongoUri.indexOf('replicaSet') > -1) {
    mongooseOptions = {
        ...mongooseOptions,
        db: { native_parser: true },
        replset: {
            auto_reconnect: false,
            poolSize: 10,
            socketOptions: {
                keepAlive: 1000,
                connectTimeoutMS: 30000
            }
        },
        server: {
            poolSize: 5,
            socketOptions: {
                keepAlive: 1000,
                connectTimeoutMS: 30000
            }
        }
    };
}

const onDbReady = (err) => {
    if (err) {
        if (retries >= 0) {
            retries--;
            logger.error(`Failed to connect to MongoDB uri ${mongoUri} with error message "${err.message}", retrying...`);
            sleep.sleep(5);
            mongoose.connect(mongoUri, mongooseOptions, onDbReady);
        } else {
            logger.error('MongoURI', mongoUri);
            logger.error(err);
            throw new Error(err);
        }
    }
};

mongoose.connect(mongoUri, mongooseOptions, onDbReady);

const app = new Koa();

app.use(koaBody({
    multipart: true,
    jsonLimit: '50mb',
    formLimit: '50mb',
    textLimit: '50mb'
}));
app.use(koaSimpleHealthCheck());

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (inErr) {
        let error = inErr;
        try {
            error = JSON.parse(inErr);
        } catch (e) {
            logger.debug('Could not parse error message - is it JSON?: ', inErr);
            error = inErr;
        }
        ctx.status = error.status || ctx.status || 500;
        if (ctx.status >= 500) {
            logger.error(error);
        } else {
            logger.info(error);
        }

        ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
        if (process.env.NODE_ENV === 'prod' && ctx.status === 500) {
            ctx.body = 'Unexpected error';
        }
        ctx.response.type = 'application/vnd.api+json';
    }
});

app.use(koaLogger());

koaValidate(app);

RWAPIMicroservice.register({
    info: require('../microservice/register.json'),
    swagger: require('../microservice/public-swagger.json'),
    mode: (process.env.CT_REGISTER_MODE && process.env.CT_REGISTER_MODE === 'auto') ? RWAPIMicroservice.MODE_AUTOREGISTER : RWAPIMicroservice.MODE_NORMAL,
    framework: RWAPIMicroservice.KOA2,
    app,
    logger,
    name: config.get('service.name'),
    baseURL: process.env.CT_URL,
    url: process.env.LOCAL_URL,
    token: process.env.CT_TOKEN,
    active: true
});

loader.loadRoutes(app);

const server = app.listen(process.env.PORT);

logger.info('Server started in ', process.env.PORT);

module.exports = server;
