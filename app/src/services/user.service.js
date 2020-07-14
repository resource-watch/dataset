const logger = require('logger');
const axios = require('axios');

class UserService {

    static async getUsersWithRole(role) {
        const response = await axios({
            url: `${process.env.CT_URL}/auth/user/ids/${role}`,
            method: 'GET'
        });
        logger.debug('User ids', response.data.data);
        return response.data.data;
    }

}

module.exports = UserService;
