const { default: logger } = require('logger');
const { RWAPIMicroservice } = require('rw-api-microservice-node');

const getUserById = async (userId, apiKey) => {
    const body = await RWAPIMicroservice.requestToMicroservice({
        uri: `/auth/user/${userId}`,
        method: 'GET',
        json: true,
        version: false,
        headers: {
            'x-api-key': apiKey,
        }
    });
    logger.debug('User by id', body.data);
    return body.data;
}

class UserService {

    static async getUsersWithRole(role, apiKey) {
        const body = await RWAPIMicroservice.requestToMicroservice({
            uri: `/auth/user/ids/${role}`,
            method: 'GET',
            json: true,
            version: false,
            headers: {
                'x-api-key': apiKey,
            }
        });
        logger.debug('User ids', body.data);
        return body.data;
    }

    static async getUserById(userId, apiKey) {
        const body = await RWAPIMicroservice.requestToMicroservice({
            uri: `/auth/user/${userId}`,
            method: 'GET',
            json: true,
            version: false,
            headers: {
                'x-api-key': apiKey,
            }
        });
        logger.debug('User by id', body.data);
        return body.data;
    }

}

module.exports = UserService;
