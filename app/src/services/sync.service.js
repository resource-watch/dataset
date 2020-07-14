const logger = require('logger');
const axios = require('axios');
const SyncError = require('errors/sync.error');

class SyncService {

    static async create(dataset) {
        logger.debug('Sync creation');
        try {
            const response = await axios({
                url: `${process.env.API_URL}/v1/task/sync-dataset`,
                method: 'POST',
                data: {
                    datasetId: dataset._id,
                    provider: dataset.provider,
                    dataPath: dataset.dataPath,
                    legend: dataset.legend,
                    cronPattern: dataset.sync.cronPattern,
                    action: dataset.sync.action,
                    url: dataset.sync.url
                }
            });
            return response.data.data;
        } catch (err) {
            throw new SyncError(JSON.stringify(err.response.data));
        }
    }

    static async update(dataset) {
        logger.debug('Sync update');
        try {
            const response = await axios({
                url: `${process.env.API_URL}/v1/task/sync-dataset`,
                method: 'PUT',
                data: {
                    datasetId: dataset._id,
                    provider: dataset.provider,
                    dataPath: dataset.dataPath,
                    legend: dataset.legend,
                    cronPattern: dataset.sync.cronPattern,
                    action: dataset.sync.action,
                    url: dataset.sync.url
                }
            });
            return response.data.data;
        } catch (err) {
            throw new SyncError(JSON.stringify(err.response.data));
        }
    }

    static async delete(id) {
        logger.debug('Sync deletion');
        try {
            const response = await axios({
                url: `${process.env.API_URL}/v1/task/sync-dataset/by-dataset/${id}`,
                method: 'DELETE'
            });
            return response.data.data;
        } catch (err) {
            throw new SyncError(JSON.stringify(err.response.data));
        }
    }

}

module.exports = SyncService;
