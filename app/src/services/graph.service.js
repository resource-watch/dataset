const logger = require('logger');
const axios = require('axios');

class GraphService {

    static async createDataset(id) {
        logger.debug('[GraphService]: Creating dataset in graph');
        try {
            return await axios({
                url: `${process.env.CT_URL}/v1/graph/dataset/${id}`,
                method: 'POST'
            });
        } catch (e) {
            throw new Error(e.response.data.detail);
        }
    }

    static async associateTags(id, vocabularies) {
        logger.debug('[GraphService]: Associating tags in graph');
        try {
            let tags = [];
            Object.keys(vocabularies).map((key) => {
                tags = tags.concat(vocabularies[key].tags);
                return null;
            });
            return await axios({
                url: `${process.env.CT_URL}/v1/graph/dataset/${id}/associate`,
                method: 'POST',
                data: {
                    tags
                }
            });
        } catch (e) {
            logger.error(e.response.data.detail);
            throw new Error(e.response.data.detail);
        }
    }

}

module.exports = GraphService;
