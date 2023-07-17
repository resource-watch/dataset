const { default: logger } = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');
const SyncError = require('errors/sync.error');

class SyncService {

    static async create(dataset, apiKey) {
        logger.debug('Sync creation');
        try {
            const response = await RWAPIMicroservice.requestToMicroservice({
                uri: '/v1/task/sync-dataset',
                method: 'POST',
                json: true,
                body: {
                    datasetId: dataset._id,
                    provider: dataset.provider,
                    dataPath: dataset.dataPath,
                    legend: dataset.legend,
                    cronPattern: dataset.sync.cronPattern,
                    action: dataset.sync.action,
                    url: dataset.sync.url
                },
                headers: {
                    'x-api-key': apiKey,
                }
            });
            return response;
        } catch (err) {
            throw new SyncError(err.message);
        }
    }

    static async update(dataset, apiKey) {
        logger.debug('Sync update');
        try {
            const response = await RWAPIMicroservice.requestToMicroservice({
                uri: '/v1/task/sync-dataset/by-dataset',
                method: 'PUT',
                json: true,
                body: {
                    datasetId: dataset._id,
                    provider: dataset.provider,
                    dataPath: dataset.dataPath,
                    legend: dataset.legend,
                    cronPattern: dataset.sync.cronPattern,
                    action: dataset.sync.action,
                    url: dataset.sync.url
                },
                headers: {
                    'x-api-key': apiKey,
                }
            });
            return response;
        } catch (err) {
            throw new SyncError(err.message);
        }
    }

    static async delete(id) {
        logger.debug('Sync deletion');
        try {
            const response = await RWAPIMicroservice.requestToMicroservice({
                uri: `/v1/task/sync-dataset/by-dataset/${id}`,
                method: 'DELETE',
                json: true,
                headers: {
                    'x-api-key': apiKey,
                }
            });
            return response;
        } catch (err) {
            throw new SyncError(err.message);
        }
    }

}

module.exports = SyncService;
