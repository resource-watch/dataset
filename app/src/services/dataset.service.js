const { URL } = require('url');
const logger = require('logger');
const Dataset = require('models/dataset.model');
const RelationshipsService = require('services/relationships.service');
const ctRegisterMicroservice = require('ct-register-microservice-node');
const SyncService = require('services/sync.service');
const FileDataService = require('services/fileDataService.service');
const DatasetNotFound = require('errors/datasetNotFound.error');
const DatasetProtected = require('errors/datasetProtected.error');
const ForbiddenRequest = require('errors/forbiddenRequest.error');
const MicroserviceConnection = require('errors/microserviceConnection.error');
const InvalidRequest = require('errors/invalidRequest.error');
const ConnectorUrlNotValid = require('errors/connectorUrlNotValid.error');
const SyncError = require('errors/sync.error');
const GraphService = require('services/graph.service');
const slug = require('slug');
const { STATUS } = require('app.constants');
const isUndefined = require('lodash/isUndefined');

const stage = process.env.NODE_ENV;

const manualSort = (array, sortedIds) => {
    const tempArray = [];
    sortedIds.forEach((id) => {
        const dataset = array.find(el => el._id === id);
        if (dataset) {
            tempArray.push(dataset);
        }
    });
    return tempArray;
};

const manualPaginate = (array, pageSize, pageNumber) => array.slice((pageNumber - 1) * pageSize, (pageNumber) * pageSize);

const manualSortAndPaginate = (array, sortedIds, size, page) => {
    const sortedArray = manualSort(array, sortedIds);
    const totalElements = sortedArray.length;
    return {
        total: totalElements,
        docs: manualPaginate(sortedArray, size, page)
    };
};

class DatasetService {

    // eslint-disable-next-line consistent-return
    static async getSlug(name) {
        const valid = false;
        let slugTemp = null;
        let i = 0;
        while (!valid) {
            slugTemp = slug(name);
            if (i > 0) {
                slugTemp += `_${i}`;
            }
            // eslint-disable-next-line no-await-in-loop
            const currentDataset = await Dataset.findOne({
                slug: slugTemp
            }).exec();
            if (!currentDataset) {
                return slugTemp;
            }
            i++;
        }
    }

    static getTableName(dataset) {
        try {
            if (dataset.provider === 'cartodb' && dataset.connectorUrl) {
                if (dataset.connectorUrl.indexOf('/tables/') >= 0) {
                    return new URL(dataset.connectorUrl).pathname.split('/tables/')[1].split('/')[0];
                }
                return decodeURI(new URL(dataset.connectorUrl)).toLowerCase().split('from ')[1].split(' ')[0];
            }
            if (dataset.provider === 'featureservice' && dataset.connectorUrl) {
                return new URL(dataset.connectorUrl).pathname.split(/services|FeatureServer/)[1].replace(/\//g, '');
            }
            if (dataset.provider === 'rwjson' && dataset.connectorUrl) {
                return 'data';
            }
            return dataset.tableName;
        } catch (err) {
            throw new ConnectorUrlNotValid('Invalid connectorUrl format');
        }
    }

    static getFilteredQuery(query, ids = []) {
        const { collection, favourite } = query;
        if (!query.application && query.app) {
            query.application = query.app;
            if (favourite) {
                delete query.application;
            }
        }
        if (!query.env) { // default value
            query.env = 'production';
        }
        // if (!query.published) { // default value
        //     query.published = true;
        // }
        if (query.userId) {
            query.userId = {
                $eq: query.userId
            };
        }
        const datasetAttributes = Object.keys(Dataset.schema.paths);
        logger.debug('Object.keys(query)', Object.keys(query));
        Object.keys(query).forEach((param) => {
            if (datasetAttributes.indexOf(param) < 0 && param !== 'usersRole') {
                delete query[param];
            } else if (param !== 'env' && param !== 'userId' && param !== 'usersRole' && param !== 'subscribable') {
                switch (Dataset.schema.paths[param].instance) {

                    case 'String':
                        query[param] = {
                            $regex: query[param],
                            $options: 'i'
                        };
                        break;
                    case 'Array':
                        if (query[param].indexOf('@') >= 0) {
                            query[param] = {
                                $all: query[param].split('@').map(elem => elem.trim())
                            };
                        } else {
                            query[param] = {
                                $in: query[param].split(',').map(elem => elem.trim())
                            };
                        }
                        break;
                    case 'Mixed':
                        query[param] = { $ne: null };
                        break;
                    case 'Date':
                        break;
                    default:

                }
            } else if (param === 'env') {
                query.env = {
                    $in: query[param].split(',')
                };
            } else if (param === 'usersRole') {
                logger.debug('Params users roles');
                query.userId = Object.assign({}, query.userId || {}, {
                    $in: query[param]
                });
                delete query.usersRole;
            } else if (param === 'userId') {
                logger.debug('params userid', query[param]);
                query.userId = Object.assign({}, query.userId || {}, query[param]);
            } else if (param === 'subscribable') {
                logger.debug('Applying subscribable filter', query[param]);
                if (query[param] === 'true') {
                    query.subscribable = { $exists: true, $nin: [null, false, {}] };
                } else if (query[param] === 'false') {
                    query.subscribable = { $in: [null, false, {}] };
                }
            }
        });
        if (ids.length > 0 || collection || favourite) {
            query._id = {
                $in: ids
            };
        }
        // if (search.length > 0) {
        //     const searchQuery = [
        //         { name: new RegExp(search.join('|'), 'i') },
        //         { subtitle: new RegExp(search.join('|'), 'i') }
        //     ];
        //     const tempQuery = {
        //         $and: [
        //             { $and: Object.keys(query).map((key) => {
        //                 const q = {};
        //                 q[key] = query[key];
        //                 return q;
        //             }) },
        //             { $or: searchQuery }
        //         ]
        //     };
        //     query = tempQuery;
        // }
        logger.debug(query);
        return query;
    }

    static getFilteredSort(sort) {
        const sortParams = sort.split(',');
        const filteredSort = {};
        const datasetAttributes = Object.keys(Dataset.schema.obj);
        sortParams.forEach((param) => {
            let sign = param.substr(0, 1);
            let realParam = param.substr(1);
            if (sign !== '-') {
                sign = '+';
                realParam = param;
            }
            if (datasetAttributes.indexOf(realParam) >= 0) {
                filteredSort[realParam] = parseInt(sign + 1, 10);
            }
        });
        return filteredSort;
    }

    static async get(id, query = {}, isAdmin = false) {
        logger.debug(`[DatasetService]: Getting dataset with id:  ${id}`);
        logger.info(`[DBACCESS-FIND]: dataset.id: ${id}`);
        let dataset = await Dataset.findById(id).exec() || await Dataset.findOne({
            slug: id
        }).exec();
        const includes = query.includes ? query.includes.split(',').map(elem => elem.trim()) : [];
        if (!dataset) {
            logger.info(`[DatasetService]: Dataset with id ${id} doesn't exist`);
            throw new DatasetNotFound(`Dataset with id '${id}' doesn't exist`);
        }
        if (includes.length > 0) {
            dataset = await RelationshipsService.getRelationships([dataset], includes, Object.assign({}, query), isAdmin);
        }
        return dataset;
    }

    static async create(dataset, user) {
        logger.debug(`[DatasetService]: Getting dataset with name:  ${dataset.name}`);
        logger.info(`[DBACCES-FIND]: dataset.name: ${dataset.name}`);
        const tempSlug = await DatasetService.getSlug(dataset.name);
        // Check if raw dataset
        if (dataset.connectorUrl && dataset.connectorUrl.indexOf('rw.dataset.raw') >= 0) {
            dataset.connectorUrl = await FileDataService.copyFile(dataset.connectorUrl);
        }
        logger.info(`[DBACCESS-SAVE]: dataset.name: ${dataset.name}`);
        let newDataset = await new Dataset({
            name: dataset.name,
            slug: tempSlug,
            type: dataset.type,
            subtitle: dataset.subtitle,
            application: dataset.application,
            dataPath: dataset.dataPath,
            attributesPath: dataset.attributesPath,
            applicationConfig: dataset.applicationConfig,
            connectorType: dataset.connectorType,
            provider: dataset.provider,
            userId: user.id,
            env: dataset.env || 'production',
            geoInfo: dataset.geoInfo || false,
            connectorUrl: dataset.connectorUrl,
            sources: dataset.sources,
            tableName: DatasetService.getTableName(dataset),
            overwrite: dataset.overwrite || dataset.dataOverwrite,
            status: dataset.connectorType === 'wms' ? 'saved' : 'pending',
            published: user.role === 'ADMIN' ? dataset.published : false,
            subscribable: dataset.subscribable,
            mainDateField: dataset.mainDateField,
            protected: dataset.protected,
            verified: dataset.verified,
            legend: dataset.legend,
            clonedHost: dataset.clonedHost,
            widgetRelevantProps: dataset.widgetRelevantProps,
            layerRelevantProps: dataset.layerRelevantProps,
            dataLastUpdated: dataset.dataLastUpdated
        }).save();
        logger.debug('[DatasetService]: Creating in graph');
        if (stage !== 'staging') {
            try {
                await GraphService.createDataset(newDataset._id);
            } catch (err) {
                newDataset.errorMessage = err.message;
                const result = await DatasetService.update(newDataset._id, newDataset, {
                    id: 'microservice'
                });
                [newDataset] = result;
            }
        }
        // if vocabularies
        if (dataset.vocabularies) {
            if (stage !== 'staging') {
                try {
                    logger.debug('[DatasetService]: Creating relations in graph');
                    await GraphService.associateTags(newDataset._id, dataset.vocabularies);
                } catch (err) {
                    newDataset.errorMessage = err.message;
                    const result = await DatasetService.update(newDataset._id, newDataset, {
                        id: 'microservice'
                    });
                    [newDataset] = result;
                }
            }
            try {
                await RelationshipsService.createVocabularies(newDataset._id, dataset.vocabularies);
            } catch (err) {
                newDataset.errorMessage = err.message;
                const result = await DatasetService.update(newDataset._id, newDataset, {
                    id: 'microservice'
                });
                [newDataset] = result;
            }
        }
        if (dataset.sync && dataset.connectorType === 'document') {
            try {
                await SyncService.create(Object.assign(newDataset, dataset));
            } catch (err) {
                if (err instanceof SyncError) {
                    newDataset.status = 'failed';
                    newDataset.errorMessage = 'Error synchronizing dataset';
                    logger.info(`[DBACCESS-SAVE]: dataset`);
                    newDataset = await newDataset.save();
                } else {
                    logger.error(err.message);
                }
            }
        }
        return newDataset;
    }

    static async updateEnv(datasetId, env) {
        logger.debug('Updating env of all resources of dataset', datasetId, 'with env ', env);
        try {
            logger.debug('Updating widgets');
            await ctRegisterMicroservice.requestToMicroservice({
                uri: `/widget/change-environment/${datasetId}/${env}`,
                method: 'PATCH',
                json: true
            });
        } catch (err) {
            logger.error('Error updating widgets', err);
        }
        try {
            logger.debug('Updating layers');
            await ctRegisterMicroservice.requestToMicroservice({
                uri: `/layer/change-environment/${datasetId}/${env}`,
                method: 'PATCH',
                json: true
            });
        } catch (err) {
            logger.error('Error updating layers', err);
        }
    }

    static async update(id, dataset, user) {
        logger.debug(`[DatasetService]: Getting dataset with id:  ${id}`);
        logger.info(`[DBACCESS-FIND]: dataset.id: ${id}`);

        const currentDataset = await Dataset.findById(id).exec() || await Dataset.findOne({
            slug: id
        }).exec();
        if (!currentDataset) {
            logger.error(`[DatasetService]: Dataset with id ${id} doesn't exist`);
            throw new DatasetNotFound(`Dataset with id '${id}' doesn't exist`);
        }

        if (typeof dataset.status !== 'undefined') {
            if (user.role !== 'ADMIN' && user.id !== 'microservice') {
                logger.info(`[DatasetService]: User ${user.id} does not have permission to update status on dataset with id ${id}`);
                throw new ForbiddenRequest(`User does not have permission to update status on dataset with id ${id}`);
            }

            if (typeof dataset.status === 'string' && STATUS.includes(dataset.status)) {
                currentDataset.status = dataset.status;
            } else if (Number.isInteger(dataset.status) && typeof STATUS[dataset.status] !== 'undefined') {
                currentDataset.status = STATUS[dataset.status];
            } else {
                logger.info(`[DatasetService]: Invalid status '${dataset.status}' for update to dataset with id ${id}`);
                throw new InvalidRequest(`Invalid status '${dataset.status}' for update to dataset with id ${id}`);
            }
        }
        if (dataset.connectorUrl && dataset.connectorUrl.indexOf('rw.dataset.raw') >= 0) {
            dataset.connectorUrl = await FileDataService.uploadFileToS3(dataset.connectorUrl);
        }
        let updateEnv = false;
        if (dataset.env && currentDataset.env !== dataset.env) {
            updateEnv = true;
        }
        const tableName = DatasetService.getTableName(dataset);
        currentDataset.name = dataset.name || currentDataset.name;
        currentDataset.subtitle = dataset.subtitle || currentDataset.subtitle;
        currentDataset.application = dataset.application || currentDataset.application;
        currentDataset.dataPath = dataset.dataPath || currentDataset.dataPath;
        currentDataset.attributesPath = dataset.attributesPath || currentDataset.attributesPath;
        currentDataset.connectorType = dataset.connectorType || currentDataset.connectorType;
        currentDataset.provider = dataset.provider || currentDataset.provider;
        currentDataset.connectorUrl = isUndefined(dataset.connectorUrl) ? currentDataset.connectorUrl : dataset.connectorUrl;
        currentDataset.sources = isUndefined(dataset.sources) ? currentDataset.sources : dataset.sources;
        currentDataset.applicationConfig = dataset.applicationConfig || currentDataset.applicationConfig;
        currentDataset.tableName = tableName || currentDataset.tableName;
        currentDataset.mainDateField = dataset.mainDateField || currentDataset.mainDateField;
        currentDataset.type = dataset.type || currentDataset.type;
        currentDataset.env = dataset.env || currentDataset.env;
        if (dataset.geoInfo !== undefined) {
            currentDataset.geoInfo = dataset.geoInfo;
        }
        if (dataset.overwrite === false || dataset.overwrite === true) {
            currentDataset.overwrite = dataset.overwrite;
        } else if (dataset.dataOverwrite === false || dataset.dataOverwrite === true) {
            currentDataset.overwrite = dataset.dataOverwrite;
        }
        if ((dataset.published === false || dataset.published === true) && user.role === 'ADMIN') {
            currentDataset.published = dataset.published;
        }
        if ((dataset.verified === false || dataset.verified === true)) {
            currentDataset.verified = dataset.verified;
        }
        if ((dataset.protected === false || dataset.protected === true)) {
            currentDataset.protected = dataset.protected;
        }
        currentDataset.subscribable = dataset.subscribable || currentDataset.subscribable;
        currentDataset.legend = dataset.legend || currentDataset.legend;
        currentDataset.clonedHost = dataset.clonedHost || currentDataset.clonedHost;
        currentDataset.widgetRelevantProps = dataset.widgetRelevantProps || currentDataset.widgetRelevantProps;
        currentDataset.layerRelevantProps = dataset.layerRelevantProps || currentDataset.layerRelevantProps;
        currentDataset.updatedAt = new Date();
        currentDataset.dataLastUpdated = dataset.dataLastUpdated || currentDataset.dataLastUpdated;
        const oldStatus = currentDataset.status;
        if (user.id === 'microservice' && (dataset.status === 0 || dataset.status === 1 || dataset.status === 2)) {
            if (dataset.status === 0) {
                currentDataset.status = 'pending';
                currentDataset.errorMessage = '';
            } else if (dataset.status === 1) {
                currentDataset.status = 'saved';
                currentDataset.errorMessage = '';
            } else {
                currentDataset.status = 'failed';
                currentDataset.errorMessage = dataset.errorMessage;
            }
        }
        if (user.id === 'microservice' && dataset.blockchain && dataset.blockchain.id && dataset.blockchain.hash) {
            currentDataset.blockchain = dataset.blockchain;
        }
        if (user.id === 'microservice' && dataset.taskId) {
            currentDataset.taskId = dataset.taskId;
        }
        if (user.id === 'microservice' && !isUndefined(dataset.errorMessage)) {
            currentDataset.errorMessage = dataset.errorMessage;
        }
        logger.info(`[DBACCESS-SAVE]: dataset`);
        let newDataset = await currentDataset.save();
        if (updateEnv) {
            logger.debug('Updating env in all resources');
            await DatasetService.updateEnv(currentDataset._id, currentDataset.env);
        }
        if (dataset.sync && newDataset.connectorType === 'document') {
            try {
                await SyncService.update(Object.assign(newDataset, dataset));
            } catch (err) {
                if (err instanceof SyncError) {
                    newDataset.status = 'failed';
                    newDataset.errorMessage = 'Error synchronizing dataset';
                    logger.info(`[DBACCESS-SAVE]: dataset`);
                    newDataset = await newDataset.save();
                } else {
                    logger.error(err.message);
                }
            }
        }
        return [newDataset, newDataset.status !== oldStatus];
    }

    static async deleteWidgets(datasetId) {
        logger.info('Deleting widgets of dataset', datasetId);
        await ctRegisterMicroservice.requestToMicroservice({
            uri: `/dataset/${datasetId}/widget`,
            method: 'DELETE'
        });
    }

    static async deleteLayers(datasetId) {
        logger.info('Deleting layers of dataset', datasetId);
        await ctRegisterMicroservice.requestToMicroservice({
            uri: `/dataset/${datasetId}/layer`,
            method: 'DELETE'
        });
    }

    static async deleteMetadata(datasetId) {
        logger.info('Deleting metadata of dataset', datasetId);
        await ctRegisterMicroservice.requestToMicroservice({
            uri: `/dataset/${datasetId}/metadata`,
            method: 'DELETE'
        });
    }

    static async deleteVocabularies(datasetId) {
        logger.info('Deleting vocabularies of dataset', datasetId);
        await ctRegisterMicroservice.requestToMicroservice({
            uri: `/dataset/${datasetId}/vocabulary`,
            method: 'DELETE'
        });
    }

    static async deleteKnowledgeGraphVocabulary(datasetId, application) {
        logger.info('Deleting knowledge graph of dataset', datasetId);
        await ctRegisterMicroservice.requestToMicroservice({
            uri: `/dataset/${datasetId}/vocabulary/knowledge_graph?application=${application}`,
            method: 'DELETE'
        });
    }

    static async checkSecureDeleteResources(id) {
        logger.info('Checking if it is safe to delete the associated resources (layer, widget) of the dataset');
        try {
            const layers = await ctRegisterMicroservice.requestToMicroservice({
                uri: `/dataset/${id}/layer?protected=true`,
                method: 'GET',
                json: true
            });
            logger.debug(layers);
            if (layers && layers.data.length > 0) {
                throw new DatasetProtected('There are protected layers associated with the dataset');
            }
        } catch (err) {
            logger.error('Error obtaining protected layers of the dataset');
            throw new MicroserviceConnection(`Error obtaining protected layers of the dataset: ${err.message}`);
        }
        try {
            const widgets = await ctRegisterMicroservice.requestToMicroservice({
                uri: `/dataset/${id}/widget?protected=true`,
                method: 'GET',
                json: true
            });
            if (widgets && widgets.data.length > 0) {
                throw new DatasetProtected('There are widgets layers associated with the dataset');
            }
        } catch (err) {
            logger.error('Error obtaining protected widgets for the dataset');
            throw new MicroserviceConnection(`Error obtaining protected widgets of the dataset: ${err.message}`);
        }
    }

    static async delete(id, user) {
        logger.debug(`[DatasetService]: Getting dataset with id:  ${id}`);
        logger.info(`[DBACCESS-FIND]: dataset.id: ${id}`);
        const currentDataset = await Dataset.findById(id).exec() || await Dataset.findOne({
            slug: id
        }).exec();
        if (!currentDataset) {
            logger.error(`[DatasetService]: Dataset with id ${id} doesn't exist`);
            throw new DatasetNotFound(`Dataset with id '${id}' doesn't exist`);
        }
        if (currentDataset.protected) {
            logger.error(`[DatasetService]: Dataset with id ${id} is protected`);
            throw new DatasetProtected(`Dataset is protected`);
        }
        await DatasetService.checkSecureDeleteResources(id);

        logger.info('Checking user apps');
        user.extraUserData.apps.forEach(async (app) => {
            const idx = currentDataset.application.indexOf(app);
            if (idx > -1) {
                currentDataset.application.splice(idx, 1);
                try {
                    await DatasetService.deleteKnowledgeGraphVocabulary(id, app);
                } catch (err) {
                    logger.error(err);
                }
            }
        });
        let deletedDataset;
        if (currentDataset.application.length > 0) {
            logger.info(`[DBACCESS-SAVE]: dataset.id: ${id}`);
            deletedDataset = await currentDataset.save();
        } else {
            logger.info(`[DBACCESS-DELETE]: dataset.id: ${id}`);
            logger.debug('[DatasetService]: Deleting layers');
            try {
                await DatasetService.deleteLayers(id);
            } catch (err) {
                logger.error('Error removing layers of the dataset', err);
            }

            logger.debug('[DatasetService]: Deleting widgets');
            try {
                await DatasetService.deleteWidgets(id);
            } catch (err) {
                logger.error('Error removing widgets', err);
            }

            logger.debug('[DatasetService]: Deleting metadata');
            try {
                await DatasetService.deleteMetadata(id);
            } catch (err) {
                logger.error('Error removing metadata', err);
            }

            logger.debug('[DatasetService]: Deleting vocabularies');
            try {
                await DatasetService.deleteVocabularies(id);
            } catch (err) {
                logger.error('Error removing vocabularies', err);
            }
            // remove the dataset at the end
            deletedDataset = await currentDataset.remove();
        }
        return deletedDataset;
    }

    static async getAll(query = {}, isAdmin = false) {
        logger.debug(`[DatasetService]: Getting all datasets`);
        const sort = query.sort || '';
        const page = query['page[number]'] ? parseInt(query['page[number]'], 10) : 1;
        const limit = query['page[size]'] ? parseInt(query['page[size]'], 10) : 10;
        const ids = query.ids ? query.ids.split(',').map(elem => elem.trim()) : [];
        const includes = query.includes ? query.includes.split(',').map(elem => elem.trim()) : [];
        const filteredQuery = DatasetService.getFilteredQuery(Object.assign({}, query), ids);
        const filteredSort = DatasetService.getFilteredSort(sort);
        const options = {
            page,
            limit,
            sort: filteredSort
        };
        if (
            sort.indexOf('most-favorited') >= 0
            || sort.indexOf('most-viewed') >= 0
            || sort.indexOf('relevance') >= 0
            || sort.indexOf('metadata') >= 0
        ) {
            options.limit = 999999;
            options.page = 1;
        }
        logger.info(`[DBACCESS-FIND]: dataset`);
        let pages = await Dataset.paginate(filteredQuery, options);
        pages = Object.assign({}, pages);
        if (
            sort.indexOf('most-favorited') >= 0
            || sort.indexOf('most-viewed') >= 0
            || sort.indexOf('relevance') >= 0
            || sort.indexOf('metadata') >= 0
        ) {
            const sortedAndPaginated = manualSortAndPaginate(pages.docs, ids, limit, page); // array, ids, size, page
            // original values
            pages.docs = sortedAndPaginated.docs;
            pages.total = sortedAndPaginated.total;
            pages.limit = limit;
            pages.page = page;
            pages.pages = Math.ceil(pages.total / pages.limit);
        }
        if (includes.length > 0) {
            pages.docs = await RelationshipsService.getRelationships(pages.docs, includes, Object.assign({}, query), isAdmin);
        }
        return pages;
    }

    static async clone(id, dataset, user, fullCloning = false) {
        logger.debug(`[DatasetService]: Getting dataset with id:  ${id}`);
        logger.info(`[DBACCESS-FIND]: dataset.id: ${id}`);
        const currentDataset = await Dataset.findById(id).exec() || await Dataset.findOne({
            slug: id
        }).exec();
        if (!currentDataset) {
            logger.error(`[DatasetService]: Dataset with id ${id} doesn't exist`);
            throw new DatasetNotFound(`Dataset with id '${id}' doesn't exist`);
        }
        const newDataset = {};
        newDataset.name = `${currentDataset.name} - ${new Date().getTime()}`;
        newDataset.subtitle = currentDataset.subtitle;
        newDataset.application = dataset.application;
        newDataset.dataPath = 'data';
        newDataset.attributesPath = currentDataset.attributesPath;
        newDataset.connectorType = 'document';
        newDataset.provider = 'json';
        newDataset.connectorUrl = dataset.datasetUrl;
        newDataset.tableName = currentDataset.tableName;
        newDataset.dataLastUpdated = currentDataset.dataLastUpdated;
        newDataset.overwrite = currentDataset.overwrite || currentDataset.dataOverwrite;
        newDataset.applicationConfig = dataset.applicationConfig || currentDataset.applicationConfig;
        newDataset.published = user.role === 'ADMIN' ? dataset.published || currentDataset.published : false;
        newDataset.legend = dataset.legend;
        newDataset.clonedHost = {
            hostProvider: currentDataset.provider,
            hostUrl: dataset.datasetUrl,
            hostId: currentDataset._id,
            hostType: currentDataset.connectorType,
            hostPath: currentDataset.tableName
        };
        const createdDataset = await DatasetService.create(newDataset, user);

        if (fullCloning) {
            RelationshipsService.cloneVocabularies(id, createdDataset.toObject()._id);
            RelationshipsService.cloneMetadatas(id, createdDataset.toObject()._id);
        }
        return createdDataset;
    }

    static validateAppPermission(user, datasetApps) {
        return datasetApps.find(datasetApp => user.extraUserData.apps.find(app => app === datasetApp));
    }

    static async hasPermission(id, user, datasetApps) {
        let permission = true;
        if (datasetApps && datasetApps.length > 0 && !DatasetService.validateAppPermission(user, datasetApps)) {
            permission = false;
        }

        const dataset = await DatasetService.get(id);
        if ((user.role === 'MANAGER') && (!dataset.userId || dataset.userId !== user.id)) {
            permission = false;
        }

        return permission;
    }

    static async getDatasetIdsBySearch(search) {
        // are we sure?
        const searchQuery = [
            { name: new RegExp(search.map(w => `(?=.*${w})`).join(''), 'i') },
            { subtitle: new RegExp(search.map(w => `(?=.*${w})`).join(''), 'i') }
        ];
        const query = { $or: searchQuery };
        const datasets = await Dataset.find(query);
        const datasetIds = datasets.map(el => el._id);
        return datasetIds;
    }

    static async recover(id) {
        const currentDataset = await Dataset.findById(id).exec() || await Dataset.findOne({
            slug: id
        }).exec();
        if (!currentDataset) {
            logger.error(`[DatasetService]: Dataset with id ${id} doesn't exist`);
            throw new DatasetNotFound(`Dataset with id '${id}' doesn't exist`);
        }
        currentDataset.status = 'saved';
        currentDataset.errorMessage = '';
        return currentDataset.save();
    }

}

module.exports = DatasetService;
