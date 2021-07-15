const { default: logger } = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');
const { INCLUDES } = require('app.constants');
const { compact, uniq } = require('lodash');
const InvalidRequest = require('errors/invalidRequest.error');

const serializeObjToQuery = (obj) => Object.keys(obj).reduce((a, k) => {
    a.push(`${k}=${encodeURIComponent(obj[k])}`);
    return a;
}, []).join('&');

class RelationshipsService {

    /**
     * - Clones the query object
     * - Strips a few things that should not be passed over to other MSs
     * - Encodes query into a URL param format
     *
     * @TODO: rawQuery is passed by reference, so we should evaluate cloning at an earlier point
     *
     * @param rawQuery
     * @returns {string}
     */
    static prepareAndFormatQuery(rawQuery) {
        const query = { ...rawQuery };
        if (!query.application && query.app) {
            query.application = query.app;
        }
        const filterIncludesByEnv = query.filterIncludesByEnv ? query.filterIncludesByEnv : false;
        if (!filterIncludesByEnv) {
            delete query.env
        }
        delete query.filterIncludesByEnv;
        delete query.includes;
        delete query['user.role'];
        return serializeObjToQuery(query);
    }

    static async getResources(ids, includes, query = '', users = [], isAdmin = false) {
        logger.info(`Getting resources of ids: ${ids}`);
        delete query.ids;
        delete query.usersRole;
        let resources = includes.map(async (include) => {
            const obj = {};
            if (INCLUDES.indexOf(include) >= 0) {
                let uri = '/v1';
                let payload = {
                    ids
                };
                let version = true;
                if (include === 'layer' || include === 'widget' || include === 'graph') {
                    const apps = query.application || query.app;
                    if (apps) {
                        payload.app = apps;
                    }
                }
                if (include === 'vocabulary' || include === 'metadata') {
                    uri = '/v1/dataset';
                }
                if (include === 'user') {
                    payload = {
                        ids: compact(uniq(users))
                    };
                    version = false;
                    uri = '/auth';
                }

                let uriQuery = RelationshipsService.prepareAndFormatQuery(query);

                if (uriQuery.length > 0) {
                    uriQuery = `?${uriQuery}`;
                }

                try {
                    logger.debug('test uriQuery => ', `${uri}/${include}/find-by-ids?${uriQuery}`);
                    logger.debug('test payload length => ', ((payload || {}).ids || []).length);
                    obj[include] = await RWAPIMicroservice.requestToMicroservice({
                        uri: `${uri}/${include}/find-by-ids${uriQuery}`,
                        method: 'POST',
                        json: true,
                        body: payload,
                        version
                    });
                } catch (e) {
                    logger.error(`Error loading '${include}' resources for dataset: ${e}`);
                    throw new Error(`Error loading '${include}' resources for dataset: ${e}`);
                }
            }
            return obj;
        });
        resources = (await Promise.all(resources)); // [array of promises]
        resources.unshift({});
        resources = resources.reduce((acc, val) => {
            const key = Object.keys(val)[0];
            acc[key] = val[key];
            return acc;
        }); // object with include as keys
        includes.forEach((include) => {
            if (resources[include]) {
                const { data } = resources[include];
                const result = {};
                if (data && data.length > 0) {
                    data.forEach((el) => {
                        if (include === 'vocabulary') { // particular case of vocabulary. it changes the matching attr
                            if (Object.keys(result).indexOf(el.attributes.resource.id) < 0) {
                                result[el.attributes.resource.id] = [el];
                            } else {
                                result[el.attributes.resource.id].push(el);
                            }
                        } else if (include === 'user') {
                            if (isAdmin) {
                                result[el._id] = el;
                            }
                        } else if (Object.keys(result).indexOf(el.attributes.dataset) < 0) {
                            result[el.attributes.dataset] = [el];
                        } else {
                            result[el.attributes.dataset].push(el);
                        }
                    });
                }
                resources[include].data = result;
            }
        }); // into each include data shouldn't be an array but a object id:ARRAY
        return resources;
    }

    static async getRelationships(datasets, includes, query = '', isAdmin = false) {
        logger.info(`Getting relationships of datasets`, isAdmin);
        datasets.unshift({});
        const map = datasets.reduce((acc, val) => {
            acc[val._id] = val;
            return acc;
        });
        const users = datasets.map((el) => el.userId);
        const ids = Object.keys(map);
        const resources = await RelationshipsService.getResources(ids, includes, query, users, isAdmin);
        ids.forEach((id) => {
            includes.forEach((include) => {
                if (include !== 'user') {
                    if (resources[include] && resources[include].data[id]) {
                        map[id][include] = resources[include].data[id];
                    } else {
                        map[id][include] = [];
                    }
                } else {
                    const datasetUserId = map[id].userId;
                    if (resources[include].data[datasetUserId] && isAdmin) {
                        map[id][include] = {
                            name: resources[include].data[datasetUserId].name,
                            email: resources[include].data[datasetUserId].email,
                            role: resources[include].data[datasetUserId].role
                        };
                    } else {
                        map[id][include] = {};
                    }
                }
            });
        });
        const relationships = Object.keys(map).map((key) => map[key]);
        return relationships;
    }

    static async createVocabularies(id, vocabularies) {
        try {
            return await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/dataset/${id}/vocabulary`,
                method: 'POST',
                json: true,
                body: vocabularies
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async filterByVocabularyTag(query) {
        logger.info(`Getting resources for vocabulary-tag query`);
        let vocabularyQuery = '?';
        Object.keys(query).forEach(((key) => {
            if (key.indexOf('vocabulary[') >= 0) {
                vocabularyQuery += `${key.split('vocabulary[')[1].split(']')[0]}=${encodeURIComponent(query[key])}&`;
            }
        }));
        vocabularyQuery = vocabularyQuery.substring(0, vocabularyQuery.length - 1);
        logger.debug(vocabularyQuery);
        const result = await RWAPIMicroservice.requestToMicroservice({
            uri: `/v1/dataset/vocabulary/find${vocabularyQuery}`,
            method: 'GET',
            json: true,
        });
        let ids = ' ';
        if (result.data.length > 0) {
            const idsArray = result.data[0].attributes.resources.map((el) => el.id);
            ids = idsArray.reduce((acc, next) => `${acc}, ${next}`);
        }
        return ids;
    }

    static async cloneVocabularies(oldId, newId) {
        try {
            return await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/dataset/${oldId}/vocabulary/clone/dataset`,
                method: 'POST',
                json: true,
                body: {
                    newDataset: newId
                }
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async cloneMetadatas(oldId, newId) {
        try {
            return await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/dataset/${oldId}/metadata/clone`,
                method: 'POST',
                json: true,
                body: {
                    newDataset: newId
                }
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getCollections(ids, userId) {
        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/collection/find-by-ids`,
                method: 'POST',
                json: true,
                body: {
                    ids,
                    userId
                }
            });
            return result.data.map((col) => col.attributes.resources.filter((res) => res.type === 'dataset')).reduce((pre, cur) => pre.concat(cur)).map((el) => el.id);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async getFavorites(app, userId) {
        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/favourite/find-by-user`,
                method: 'POST',
                json: true,
                body: {
                    app,
                    userId
                }
            });
            logger.debug(result);
            return result.data.filter((fav) => fav.attributes.resourceType === 'dataset').map((el) => el.attributes.resourceId);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async filterByMetadata(search, sort) {
        let uri = `/v1/metadata?search=${search}`;

        if (sort !== null) {
            uri = `${uri}&sort=${sort}`;
        }

        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri,
                method: 'GET',
                json: true
            });
            logger.debug(result);
            return result.data.map((m) => m.attributes.dataset);
        } catch (e) {
            if (e.statusCode === 400) {
                throw new InvalidRequest(e.message);
            }
            throw new Error(e);
        }
    }

    static async sortByMetadata(sign, query) {
        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/metadata?sort=${sign}name&type=dataset&${query}`,
                method: 'GET',
                json: true
            });
            logger.debug(result);
            return result.data.map((m) => m.attributes.dataset);
        } catch (e) {
            throw new Error(e);
        }
    }

    static async filterByConcepts(query) {
        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/graph/query/search-datasets-ids?${serializeObjToQuery(query)}`,
                method: 'GET',
                json: true
            });
            return result.data;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async searchBySynonyms(query) {
        try {
            const result = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/graph/query/search-by-label-synonyms?${RelationshipsService.prepareAndFormatQuery(query)}`,
                method: 'GET',
                json: true
            });
            return result.data;
        } catch (e) {
            throw new Error(`Error searching by label synonyms: ${e}`);
        }
    }

    static async getUsersInfoByIds(ids) {
        logger.debug('Fetching all users\' information');
        const body = await RWAPIMicroservice.requestToMicroservice({
            uri: `/auth/user/find-by-ids`,
            method: 'POST',
            json: true,
            version: false,
            body: { ids }
        });

        return body.data;
    }

}

module.exports = RelationshipsService;
