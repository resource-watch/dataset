const nock = require('nock');
const intersection = require('lodash/intersection');

const createMockUser = (users) => {
    nock(process.env.CT_URL)
        .post(
            '/auth/user/find-by-ids',
            body => intersection(body.ids, users.map(e => e.id)).length === body.ids.length
        )
        .query(() => true)
        .reply(200, { data: users });
};

module.exports = { createMockUser };
