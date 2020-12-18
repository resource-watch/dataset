const { default: logger } = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');

class UserService {

    static async getUsersWithRole(role) {
        const body = await RWAPIMicroservice.requestToMicroservice({
            uri: `/auth/user/ids/${role}`,
            method: 'GET',
            json: true,
            version: false
        });
        logger.debug('User ids', body.data);
        return body.data;
    }

}

module.exports = UserService;
