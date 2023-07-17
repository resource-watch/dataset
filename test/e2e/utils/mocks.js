const nock = require('nock');
const intersection = require('lodash/intersection');
const config = require('config');
const { USERS } = require('./test.constants');
const { mockValidateRequest, mockCloudWatchLogRequestsSequence } = require('rw-api-microservice-node/dist/test-mocks');

const createMockUser = (users) => {
    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .post(
            '/auth/user/find-by-ids',
            (body) => intersection(body.ids, users.map((e) => e._id.toString())).length === body.ids.length
        )
        .query(() => true)
        .reply(200, { data: users });
};

const APPLICATION = {
    data: {
        type: "applications",
        id: "649c4b204967792f3a4e52c9",
        attributes: {
            name: "grouchy-armpit",
            organization: null,
            user: null,
            apiKeyValue: "a1a9e4c3-bdff-4b6b-b5ff-7a60a0454e13",
            createdAt: "2023-06-28T15:00:48.149Z",
            updatedAt: "2023-06-28T15:00:48.149Z"
        }
    }
};

const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFhMTBkN2M2ZTBhMzcxMjY2MTFmZDdhNSIsIm5hbWUiOiJ0ZXN0IHVzZXIiLCJyb2xlIjoiVVNFUiIsInByb3ZpZGVyIjoibG9jYWwiLCJlbWFpbCI6InVzZXJAY29udHJvbC10b3dlci5vcmciLCJleHRyYVVzZXJEYXRhIjp7ImFwcHMiOlsicnciLCJnZnciLCJnZnctY2xpbWF0ZSIsInByZXAiLCJhcXVlZHVjdCIsImZvcmVzdC1hdGxhcyIsImRhdGE0c2RncyJdfX0.R_RT47-wVCLtXNmDyfy7KGhSASUayVBW6KKsdxtphPc';

const mockValidateRequestWithApiKey = ({
    apiKey = 'api-key-test',
    application = APPLICATION
}) => {
    mockValidateRequest({
        gatewayUrl: process.env.GATEWAY_URL,
        microserviceToken: process.env.MICROSERVICE_TOKEN,
        application,
        apiKey
    });
    mockCloudWatchLogRequestsSequence({
        application,
        awsRegion: process.env.AWS_REGION,
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
        logStreamName: config.get('service.name')
    });
};

const mockValidateRequestWithApiKeyAndUserToken = ({
    apiKey = 'api-key-test',
    token = 'abcd',
    application = APPLICATION,
    user = USERS.USER
}) => {
    mockValidateRequest({
        gatewayUrl: process.env.GATEWAY_URL,
        microserviceToken: process.env.MICROSERVICE_TOKEN,
        user,
        application,
        token,
        apiKey
    });
    mockCloudWatchLogRequestsSequence({
        user,
        application,
        awsRegion: process.env.AWS_REGION,
        logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
        logStreamName: config.get('service.name')
    });
};

module.exports = { createMockUser, mockValidateRequestWithApiKeyAndUserToken, mockValidateRequestWithApiKey };

