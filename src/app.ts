import Koa from 'koa';
import logger from 'logger';
import koaLogger from 'koa-logger';
import mongoose, { ConnectionOptions } from 'mongoose';
import config from 'config';
// @ts-ignore
import loader from 'loader';
import { Server } from "http";
// @ts-ignore
import koaSimpleHealthCheck from 'koa-simple-healthcheck';
import { RWAPIMicroservice } from 'rw-api-microservice-node';
// @ts-ignore
import ErrorSerializer from 'serializers/error.serializer';
import sleep from 'sleep';
// @ts-ignore
import koaValidate from 'koa-validate';
import koaBody from 'koa-body';

import mongooseDefaultOptions from '../config/mongoose';

const mongoUri: string = process.env.MONGO_URI || `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.database')}`;

let retries: number = 10;
let mongooseOptions: ConnectionOptions = { ...mongooseDefaultOptions };

// KUBE CLUSTER
// @ts-ignore
if (mongoUri.indexOf('replicaSet') > -1) {
    mongooseOptions = {
        ...mongooseOptions,
        // @ts-ignore
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

interface IInit {
    server: Server;
    app: Koa;
}

const init: () => Promise<IInit> = async (): Promise<IInit> => {
    return new Promise((resolve, reject) => {
        async function onDbReady(err: Error): Promise<void> {
            if (err) {
                if (retries >= 0) {
                    retries--;
                    logger.error(`Failed to connect to MongoDB uri ${mongoUri}, retrying...`);
                    sleep.sleep(5);
                    await mongoose.connect(mongoUri, mongooseOptions, onDbReady);
                } else {
                    logger.error('MongoURI', mongoUri);
                    logger.error(err);
                    reject(new Error(err.message));
                }

                return;
            }

            logger.info(`Connection to MongoDB successful`);

            const app: Koa = new Koa();

            app.use(koaBody({
                multipart: true,
                jsonLimit: '50mb',
                formLimit: '50mb',
                textLimit: '50mb'
            }));
            app.use(koaSimpleHealthCheck());

            app.use(async (ctx: { status: number; response: { type: string; }; body: any; }, next: () => any) => {
                try {
                    await next();
                } catch (error) {
                    ctx.status = error.status || ctx.status || 500;

                    if (ctx.status >= 500) {
                        logger.error(error);
                    } else {
                        logger.info(error);
                    }

                    if (process.env.NODE_ENV === 'prod' && ctx.status === 500) {
                        ctx.response.type = 'application/vnd.api+json';
                        ctx.body = ErrorSerializer.serializeError(ctx.status, 'Unexpected error');
                        return;
                    }

                    ctx.response.type = 'application/vnd.api+json';
                    ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
                }
            });

            app.use(koaLogger());

            app.use(RWAPIMicroservice.bootstrap({
                name: 'dataset',
                info: require('../microservice/register.json'),
                swagger: require('../microservice/public-swagger.json'),
                logger,
                baseURL: process.env.CT_URL,
                url: process.env.LOCAL_URL,
                token: process.env.CT_TOKEN,
                fastlyServiceId: process.env.FASTLY_SERVICEID,
                fastlyAPIKey: process.env.FASTLY_APIKEY
            }));

            koaValidate(app);

            loader.loadRoutes(app);

            const port: string = process.env.PORT || '3000';

            const server: Server = app.listen(port, () => {
                if (process.env.CT_REGISTER_MODE === 'auto') {
                    RWAPIMicroservice.register().then(() => {
                        logger.info('CT registration process started');
                    }, (error) => {
                        logger.error(error);
                        process.exit(1);
                    });
                }

                logger.info('Server started in ', port);
                resolve({ app, server });
            });
        }

        logger.info(`Connecting to MongoDB URL ${mongoUri}`);
        mongoose.connect(mongoUri, mongooseOptions, onDbReady);
    });
};

export { init };
