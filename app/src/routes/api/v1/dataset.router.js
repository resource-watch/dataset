const Router = require('koa-router');
const koaMulter = require('koa-multer');
const logger = require('logger');
const xor = require('lodash/xor');
const DatasetService = require('services/dataset.service');
const RelationshipsService = require('services/relationships.service');
const UserService = require('services/user.service');
const FileDataService = require('services/fileDataService.service');
const DatasetValidator = require('validators/dataset.validator');
const DatasetSerializer = require('serializers/dataset.serializer');
const DatasetDuplicated = require('errors/datasetDuplicated.error');
const DatasetNotFound = require('errors/datasetNotFound.error');
const DatasetProtected = require('errors/datasetProtected.error');
const MicroserviceConnection = require('errors/microserviceConnection.error');
const DatasetNotValid = require('errors/datasetNotValid.error');
const ConnectorUrlNotValid = require('errors/connectorUrlNotValid.error');
const ctRegisterMicroservice = require('ct-register-microservice-node');
const { USER_ROLES } = require('app.constants');
const InvalidRequest = require('errors/invalidRequest.error');
const ForbiddenRequest = require('errors/forbiddenRequest.error');
const DatasetModel = require('models/dataset.model');

const router = new Router({
    prefix: '/dataset',
});

koaMulter({ dest: 'uploads/' });

const serializeObjToQuery = obj => Object.keys(obj).reduce((a, k) => {
    a.push(`${k}=${encodeURIComponent(obj[k])}`);
    return a;
}, []).join('&');

const arrayIntersection = (arr1, arr2) => arr1.filter(n => arr2.indexOf(n) !== -1);

class DatasetRouter {

    /**
     * Fetch the applications being manipulated in the current request.
     * In the case of POST, PUT, GET or DELETE, the applications being manipulated are the ones provided in the request.
     * In the case of PATCH, the applications manipulated are the concat of the added and removed applications.
     *
     * Example: I am an admin who managers application 'A'. An existing dataset is assigned to applications ['A', 'B', 'C'].
     * I want to remove my application ('A') from array of applications of the dataset. So I provide ['B', 'C'] in the body
     * of the request. In this case, the return from this function is ['A'], the only application being manipulated.
     *
     * Returns an array with the applications that should be considered for permission management.
     */
    static async getDatasetApplications(ctx) {
        const requestApps = ctx.request.query.application ? ctx.request.query.application : ctx.request.body.application;
        if (requestApps && ctx.request.method === 'PATCH') {
            const dataset = await DatasetService.get(ctx.params.dataset);
            return xor(dataset.application || [], requestApps);
        }

        return requestApps;
    }

    static getUser(ctx) {
        const { query, body } = ctx.request;

        let user = Object.assign({}, query.loggedUser ? JSON.parse(query.loggedUser) : {}, ctx.request.body.loggedUser);
        if (body.fields && body.fields.loggedUser) {
            user = Object.assign(user, JSON.parse(body.fields.loggedUser));
        }
        return user;
    }

    static async notifyAdapter(ctx, dataset) {
        const { connectorType, provider } = dataset;
        const clonedDataset = Object.assign({}, dataset.toObject());
        clonedDataset.id = dataset._id;
        clonedDataset.connector_url = dataset.connectorUrl;
        clonedDataset.attributes_path = dataset.attributesPath;
        clonedDataset.data_columns = dataset.datasetAttributes;
        clonedDataset.data_path = dataset.dataPath;
        clonedDataset.table_name = dataset.tableName;
        clonedDataset.data = ctx.request.body.data;

        let uri = '';
        if (connectorType === 'rest') {
            uri += `/rest-datasets/${provider}`;
        } else if (connectorType === 'document') {
            if (ctx.request.path.indexOf('clone') >= 0) {
                clonedDataset.connector_url = process.env.CT_URL + dataset.connector_url;
                clonedDataset.connectorUrl = process.env.CT_URL + dataset.connectorUrl;
            }
            uri += `/doc-datasets/${provider}`;
        }

        if (ctx.request.method === 'DELETE') {
            uri += `/${dataset.id}`;
        }

        const method = ctx.request.method === 'DELETE' ? 'DELETE' : 'POST';

        try {
            return await ctRegisterMicroservice.requestToMicroservice({
                uri,
                method,
                json: true,
                body: { connector: clonedDataset }
            });
        } catch (err) {
            logger.error('Error connecting to dataset adapter');
            throw new MicroserviceConnection(`Error connecting to dataset adapter: ${err.message}`);
        }
    }

    static async notifyAdapterCreate(ctx, dataset) {
        const { connectorType, provider } = dataset;
        const clonedDataset = Object.assign({}, dataset.toObject());

        clonedDataset.id = dataset._id;
        clonedDataset.connector_url = dataset.connectorUrl;
        clonedDataset.attributes_path = dataset.attributesPath;
        clonedDataset.data_columns = dataset.datasetAttributes;
        clonedDataset.data_path = dataset.dataPath;
        clonedDataset.table_name = dataset.tableName;
        clonedDataset.data = ctx.request.body.data;

        let uri = '';
        if (connectorType === 'rest') {
            uri += `/rest-datasets/${provider}`;
        } else if (connectorType === 'document') {
            uri += `/doc-datasets/${provider}`;
            if (!clonedDataset.sources || !clonedDataset.sources.length) {
                if (clonedDataset.connectorUrl) {
                    clonedDataset.sources = [clonedDataset.connectorUrl];
                } else {
                    clonedDataset.sources = [];
                }
            }
            delete clonedDataset.connector_url;
            delete clonedDataset.connectorUrl;
        }

        return ctRegisterMicroservice.requestToMicroservice({
            uri,
            method: 'POST',
            json: true,
            body: { connector: clonedDataset }
        });
    }

    static async get(ctx) {
        const id = ctx.params.dataset;
        logger.info(`[DatasetRouter] Getting dataset with id: ${id}`);
        const user = DatasetRouter.getUser(ctx);
        const { query } = ctx;
        delete query.loggedUser;
        try {
            const dataset = await DatasetService.get(id, query, user && user.role === 'ADMIN');
            const includes = ctx.query.includes ? ctx.query.includes.split(',').map(elem => elem.trim()) : [];
            const datasetId = dataset.id || dataset[0].id;
            const datasetSlug = dataset.slug || dataset[0].slug;
            ctx.set('cache', `${datasetId} ${includes.map(el => `${datasetId}-${el.trim()}`).join(' ')} ${datasetSlug} ${includes.map(el => `${datasetSlug}-${el.trim()}`).join(' ')}`);
            ctx.body = DatasetSerializer.serialize(dataset);
        } catch (err) {
            if (err instanceof DatasetNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            throw err;
        }
    }

    static async create(ctx) {
        logger.info(`[DatasetRouter] Creating dataset with name: ${ctx.request.body.name}`);
        try {
            const user = DatasetRouter.getUser(ctx);
            const dataset = await DatasetService.create(ctx.request.body, user);
            try {
                DatasetRouter.notifyAdapterCreate(ctx, dataset);
            } catch (error) {
                // do nothing
                logger.error(error);
            }
            ctx.set('uncache', 'dataset graph-dataset');
            ctx.body = DatasetSerializer.serialize(dataset);
        } catch (err) {
            if (err instanceof DatasetDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            if (err instanceof ConnectorUrlNotValid) {
                ctx.throw(400, err.message);
            }
            throw err;
        }
    }

    static async update(ctx) {
        const id = ctx.params.dataset;
        logger.info(`[DatasetRouter] Updating dataset with id: ${id}`);
        try {
            const user = DatasetRouter.getUser(ctx);
            const result = await DatasetService.update(id, ctx.request.body, user);
            const dataset = result[0];
            const uncache = [`dataset`, `${dataset.id} ${dataset.slug}`];
            if (result[1]) {
                uncache.push(`${dataset.id}-fields`);
                uncache.push(`${dataset.slug}-fields`);
                uncache.push(`${dataset.id}-query`);
                uncache.push(`${dataset.slug}-query`);
            }
            ctx.set('uncache', uncache.join(' '));
            ctx.body = DatasetSerializer.serialize(dataset);
        } catch (err) {
            if (err instanceof DatasetNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            if (err instanceof ForbiddenRequest) {
                ctx.throw(403, err.message);
                return;
            }
            if (err instanceof InvalidRequest) {
                ctx.throw(400, err.message);
                return;
            }
            if (err instanceof DatasetDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static async delete(ctx) {
        const id = ctx.params.dataset;
        logger.info(`[DatasetRouter] Deleting dataset with id: ${id}`);
        try {
            const dataset = await DatasetService.get(id);

            // Delete adapter-specific things before deleting the actual dataset. If adapter fails, bail
            await DatasetRouter.notifyAdapter(ctx, dataset);

            const user = DatasetRouter.getUser(ctx);
            await DatasetService.delete(id, user);

            ctx.set('uncache', `dataset ${dataset.id} ${dataset.slug}`);
            ctx.body = DatasetSerializer.serialize(dataset);
        } catch (err) {
            if (err instanceof DatasetNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            if (err instanceof DatasetProtected) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static async findByIds(ctx) {
        logger.info(`[DatasetRouter] Getting all datasets with ids`, ctx.request.body);
        if (ctx.request && ctx.request.body && ctx.request.body && ctx.request.body.ids.length > 0) {
            ctx.query.ids = ctx.request.body.ids.join(',');
            await DatasetRouter.getAll(ctx);
        } else {
            ctx.body = {
                data: []
            };
        }

    }

    static async getAll(ctx) {
        logger.info(`[DatasetRouter] Getting all datasets`);
        const user = DatasetRouter.getUser(ctx);
        const { query } = ctx;
        const { search } = query;
        const sort = ctx.query.sort || '';
        const userId = ctx.query.loggedUser && ctx.query.loggedUser !== 'null' ? JSON.parse(ctx.query.loggedUser).id : null;
        delete query.loggedUser;

        if (!search && sort.indexOf('relevance') >= 0) {
            ctx.throw(400, 'Cannot sort by relevance without search criteria');
            return;
        }

        try {
            if (query.sort && (query.sort.includes('user.role') || query.sort.includes('user.name'))) {
                logger.debug('Detected sorting by user role or name');
                const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user && user.role);
                if (!user || !isAdmin) {
                    ctx.throw(403, 'Sorting by user name or role not authorized.');
                    return;
                }

                // Reset all datasets' sorting columns
                await DatasetModel.updateMany({}, { userRole: '', userName: '' });

                // Fetch info to sort again
                const ids = await DatasetService.getAllDatasetUserIds();
                const users = await RelationshipsService.getUsersInfoByIds(ids);
                await Promise.all(users.map(u => DatasetModel.updateMany(
                    { userId: u._id },
                    {
                        userRole: u.role ? u.role.toLowerCase() : '',
                        userName: u.name ? u.name.toLowerCase() : '',
                    },
                )));
            }

            /**
             * We'll want to limit the maximum page size in the future
             * However, as this will cause a production BC break, we can't enforce it just now
             */
            // if (query['page[size]'] && query['page[size]'] > 100) {
            //     ctx.throw(400, 'Invalid page size');
            // }

            if (Object.keys(query).find(el => el.indexOf('vocabulary[') >= 0)) {
                ctx.query.ids = await RelationshipsService.filterByVocabularyTag(query);
                logger.debug('Ids from vocabulary-tag', ctx.query.ids);
            }
            if (Object.keys(query).find(el => el.indexOf('user.role') >= 0) && user && user.role === 'ADMIN') {
                logger.debug('Obtaining users with role');
                ctx.query.usersRole = await UserService.getUsersWithRole(ctx.query['user.role']);
                logger.debug('Ids from users with role', ctx.query.usersRole);
            }
            if (Object.keys(query).find(el => el.indexOf('collection') >= 0)) {
                if (!userId) {
                    ctx.throw(403, 'Collection filter not authorized');
                    return;
                }
                ctx.query.ids = await RelationshipsService.getCollections(ctx.query.collection, userId);
                ctx.query.ids = ctx.query.ids.length > 0 ? ctx.query.ids.join(',') : '';
                logger.debug('Ids from collections', ctx.query.ids);
            }
            if (Object.keys(query).find(el => el.indexOf('favourite') >= 0)) {
                if (!userId) {
                    ctx.throw(403, 'Fav filter not authorized');
                    return;
                }
                const app = ctx.query.app || ctx.query.application || 'rw';
                ctx.query.ids = await RelationshipsService.getFavorites(app, userId);
                ctx.query.ids = ctx.query.ids.length > 0 ? ctx.query.ids.join(',') : '';
                logger.debug('Ids from collections', ctx.query.ids);
            }
            if (
                search
                || serializeObjToQuery(query).indexOf('concepts[0][0]') >= 0
                || sort.indexOf('most-favorited') >= 0
                || sort.indexOf('most-viewed') >= 0
                || sort.indexOf('relevance') >= 0
                || sort.indexOf('metadata') >= 0
            ) {
                let searchIds = null;
                let conceptIds = null;

                if (search) {
                    let metadataSort = null;
                    if (
                        sort.indexOf('metadata') >= 0
                        || sort.indexOf('relevance') >= 0
                    ) {
                        metadataSort = sort;
                    }

                    const metadataIds = await RelationshipsService.filterByMetadata(search, metadataSort);
                    const searchBySynonymsIds = await RelationshipsService.searchBySynonyms(serializeObjToQuery(query));
                    const datasetBySearchIds = await DatasetService.getDatasetIdsBySearch(search.split(' '));
                    searchIds = metadataIds.concat(searchBySynonymsIds).concat(datasetBySearchIds);
                }
                if (
                    serializeObjToQuery(query).indexOf('concepts[0][0]') >= 0
                    || sort.indexOf('most-favorited') >= 0
                    || sort.indexOf('most-viewed') >= 0
                ) {
                    conceptIds = await RelationshipsService.filterByConcepts(serializeObjToQuery(query));
                }
                if ((searchIds && searchIds.length === 0) || (conceptIds && conceptIds.length === 0)) {
                    ctx.body = DatasetSerializer.serialize([], null);
                    return;
                }
                const finalIds = searchIds && conceptIds ? arrayIntersection(conceptIds, searchIds) : searchIds || conceptIds;
                const uniqueIds = new Set([...finalIds]); // Intersect and unique
                ctx.query.ids = [...uniqueIds].join(); // it has to be string
            }
            // Links creation
            const clonedQuery = Object.assign({}, query);
            delete clonedQuery['page[size]'];
            delete clonedQuery['page[number]'];
            delete clonedQuery.ids;
            delete clonedQuery.usersRole;
            const serializedQuery = serializeObjToQuery(clonedQuery) ? `?${serializeObjToQuery(clonedQuery)}&` : '?';
            const apiVersion = ctx.mountPath.split('/')[ctx.mountPath.split('/').length - 1];
            const link = `${ctx.request.protocol}://${ctx.request.host}/${apiVersion}${ctx.request.path}${serializedQuery}`;
            const datasets = await DatasetService.getAll(query, user && user.role === 'ADMIN');
            ctx.set('cache', `dataset ${query.includes ? query.includes.split(',').map(elem => elem.trim()).join(' ') : ''}`);
            ctx.body = DatasetSerializer.serialize(datasets, link);
        } catch (err) {
            if (err instanceof InvalidRequest) {
                ctx.throw(400, err);
            }
            ctx.throw(500, err);
        }
    }

    static async clone(ctx) {
        const id = ctx.params.dataset;
        logger.info(`[DatasetRouter] Cloning dataset with id: ${id}`);
        try {
            const user = DatasetRouter.getUser(ctx);
            const fullCloning = ctx.query.full === 'true';
            const dataset = await DatasetService.clone(id, ctx.request.body, user, fullCloning);
            try {
                DatasetRouter.notifyAdapter(ctx, dataset);
            } catch (error) {
                // do nothing
            }
            ctx.set('uncache', 'dataset graph-dataset');
            ctx.body = DatasetSerializer.serialize(dataset);
        } catch (err) {
            if (err instanceof DatasetDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static async upload(ctx) {
        logger.info(`[DatasetRouter] Uploading new file`);
        try {
            const filename = `${Date.now()}_${ctx.request.body.files.dataset.name}`;
            await FileDataService.uploadFileToS3(ctx.request.body.files.dataset.path, filename, true);
            const fields = await FileDataService.getFields(ctx.request.body.files.dataset.path, ctx.request.body.fields.provider);
            ctx.body = {
                connectorUrl: `rw.dataset.raw/${filename}`,
                fields
            };
        } catch (err) {
            logger.error('Error uploading file', err);
            ctx.throw(500, 'Error uploading file');
        }
    }

    static async recover(ctx) {
        logger.info(`[DatasetRouter] Recovering dataset status`);
        try {
            await DatasetService.recover(ctx.params.dataset);
            ctx.body = 'OK';
        } catch (err) {
            if (err instanceof DatasetNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            ctx.throw(500, 'Error recovering dataset status');
        }
    }

    static async flushDataset(ctx) {
        const datasetId = ctx.params.dataset;
        const dataset = await DatasetService.get(datasetId);
        ctx.set('uncache', `${dataset._id} ${dataset.slug} query-${dataset._id} query-${dataset.slug} fields-${dataset._id} fields-${dataset.slug}`);
        ctx.body = 'OK';
    }

}

const validationMiddleware = async (ctx, next) => {
    logger.info(`[DatasetRouter] Validating`);
    if (ctx.request.body.dataset) {
        ctx.request.body = Object.assign(ctx.request.body, ctx.request.body.dataset);
        delete ctx.request.body.dataset;
    }
    try {
        const newDatasetCreation = ctx.request.path === '/dataset' && ctx.request.method === 'POST';
        if (newDatasetCreation) {
            await DatasetValidator.validateCreation(ctx);
        } else if (ctx.request.path.indexOf('clone') >= 0) {
            await DatasetValidator.validateCloning(ctx);
        } else if (ctx.request.path.indexOf('upload') >= 0) {
            await DatasetValidator.validateUpload(ctx);
        } else if (ctx.request.path.indexOf('find-by-ids') >= 0) {
            await DatasetValidator.validateFindByIDS(ctx);
        } else {
            await DatasetValidator.validateUpdate(ctx);
        }
    } catch (err) {
        if (err instanceof DatasetNotValid) {
            ctx.throw(400, err.getMessages());
            return;
        }
        throw err;
    }
    await next();
};

const authorizationMiddleware = async (ctx, next) => {
    logger.info(`[DatasetRouter] Checking authorization`);
    // Get user from query (delete) or body (post-patch)
    const newDatasetCreation = ctx.request.path === '/dataset' && ctx.request.method === 'POST';
    const uploadDataset = ctx.request.path.indexOf('upload') >= 0 && ctx.request.method === 'POST';
    const user = DatasetRouter.getUser(ctx);
    if (ctx.request.path.endsWith('flush') && user.role === 'ADMIN') {
        await next();
        return;
    }
    if (user.id === 'microservice') {
        await next();
        return;
    }
    if (!user || USER_ROLES.indexOf(user.role) === -1) {
        ctx.throw(401, 'Unauthorized'); // if not logged or invalid ROLE -> out
        return;
    }
    if (user.role === 'USER') {
        if (!newDatasetCreation && !uploadDataset) {
            ctx.throw(403, 'Forbidden'); // if user is USER -> out
            return;
        }
    }

    const datasetApps = await DatasetRouter.getDatasetApplications(ctx);
    if (datasetApps && datasetApps.length > 0 && !DatasetService.validateAppPermission(user, datasetApps)) {
        ctx.throw(403, 'Forbidden - User does not have access to this dataset\'s application'); // if manager or admin but no application -> out
        return;
    }

    const allowedOperations = newDatasetCreation || uploadDataset;
    if ((user.role === 'MANAGER' || user.role === 'ADMIN') && !allowedOperations) {
        try {
            const permission = await DatasetService.hasPermission(ctx.params.dataset, user, datasetApps);
            if (!permission) {
                ctx.throw(403, 'Forbidden');
                return;
            }
        } catch (err) {
            throw err;
        }
    }
    await next(); // SUPERADMIN is included here
};

const authorizationBigQuery = async (ctx, next) => {
    logger.info(`[DatasetRouter] Checking if bigquery dataset`);
    // Get user from query (delete) or body (post-patch)
    const user = DatasetRouter.getUser(ctx);
    if (ctx.request.body.provider === 'bigquery'
        && (
            user.email !== 'enrique.cornejo@vizzuality.com'
            && user.email !== 'tiago.garcia@vizzuality.com'
            && user.email !== 'alicia.arenzana@vizzuality.com'
        )
    ) {
        ctx.throw(401, 'Unauthorized'); // if not logged or invalid ROLE -> out
        return;
    }
    await next();
};

// const authorizationSubscribable = async (ctx, next) => {
//     logger.info(`[DatasetRouter] Checking if it can update the subscribable prop`);
//     if (ctx.request.body.subscribable) {
//         const user = DatasetRouter.getUser(ctx);
//         if (user.email !== 'sergio.gordillo@vizzuality.com' && user.email !== 'raul.requero@vizzuality.com' && user.email !== 'alicia.arenzana@vizzuality.com') {
//             ctx.throw(401, 'Unauthorized'); // if not logged or invalid ROLE -> out
//             return;
//         }
//     }
//     await next();
// };

const authorizationRecover = async (ctx, next) => {
    logger.info(`[DatasetRouter] Authorization for recovering`);
    const user = DatasetRouter.getUser(ctx);
    if (user.role !== 'ADMIN') {
        ctx.throw(401, 'Unauthorized'); // if not logged or invalid ROLE -> out
        return;
    }
    await next();
};

router.get('/', DatasetRouter.getAll);
router.post('/find-by-ids', validationMiddleware, DatasetRouter.findByIds);
router.post('/', validationMiddleware, authorizationMiddleware, authorizationBigQuery, DatasetRouter.create);
// router.post('/', validationMiddleware, authorizationMiddleware, authorizationBigQuery, authorizationSubscribable, DatasetRouter.create);
router.post('/upload', validationMiddleware, authorizationMiddleware, DatasetRouter.upload);
router.post('/:dataset/flush', authorizationMiddleware, DatasetRouter.flushDataset);
router.post('/:dataset/recover', authorizationRecover, DatasetRouter.recover);

router.get('/:dataset', DatasetRouter.get);
router.patch('/:dataset', validationMiddleware, authorizationMiddleware, DatasetRouter.update);
router.delete('/:dataset', authorizationMiddleware, DatasetRouter.delete);
router.post('/:dataset/clone', validationMiddleware, authorizationMiddleware, DatasetRouter.clone);

module.exports = router;
