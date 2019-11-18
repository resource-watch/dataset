/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./test.constants');
const { createDataset, deserializeDataset } = require('./utils');
const { getTestServer } = require('./test-server');

const should = chai.should();

const requester = getTestServer();
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Dataset clone tests', () => {

    before(() => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        nock.cleanAll();
    });

    beforeEach(async () => {
        await Dataset.deleteMany({}).exec();
    });

    it('Clone a dataset as an ADMIN should be successful', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.CT_URL)
            .post(/v1\/graph\/dataset\/(\w|-)*$/)
            .once()
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        nock(process.env.CT_URL)
            .post('/v1/doc-datasets/json', (request) => {
                const expected = {
                    connectorType: 'document',
                    provider: 'json',
                    userId: '1a10d7c6e0a37126611fd7a7',
                    layerRelevantProps: [],
                    widgetRelevantProps: [],
                    clonedHost: {
                        hostProvider: 'cartodb',
                        hostUrl: 'http://other.dataset.url',
                        hostId: cartoFakeDataset._id,
                        hostType: 'rest',
                        hostPath: cartoFakeDataset.tableName
                    },
                    legend: {
                        binary: [],
                        boolean: [],
                        byte: [],
                        country: [],
                        date: [],
                        double: [],
                        float: [],
                        half_float: [],
                        integer: [],
                        keyword: [],
                        nested: [],
                        region: [],
                        scaled_float: [],
                        short: [],
                        text: []
                    },
                    taskId: null,
                    protected: false,
                    geoInfo: false,
                    env: 'production',
                    published: true,
                    mainDateField: null,
                    errorMessage: null,
                    verified: false,
                    overwrite: true,
                    status: 'pending',
                    tableName: cartoFakeDataset.tableName,
                    connectorUrl: `${process.env.CT_URL}http://other.dataset.url`,
                    attributesPath: cartoFakeDataset.attributesPath,
                    dataPath: 'data',
                    application: ['gfw', 'rw'],
                    subtitle: cartoFakeDataset.subtitle,
                    type: null,
                    connector_url: `${process.env.CT_URL}undefined`,
                    attributes_path: cartoFakeDataset.attributesPath,
                    data_path: 'data',
                    table_name: cartoFakeDataset.tableName
                };

                request.connector.should.deep.include(expected);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .send({
                datasetUrl: 'http://other.dataset.url',
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        dataset.should.have.property('name').and.not.equal(cartoFakeDataset.name);
        response.body.data.should.have.property('id').and.not.equal(cartoFakeDataset._id);

        dataset.should.have.property('application').and.deep.equal(['gfw', 'rw']);
        dataset.should.have.property('connectorType').and.equal('document');
        dataset.should.have.property('provider').and.equal('json');
        dataset.should.have.property('connectorUrl').and.equal('http://other.dataset.url');
        dataset.should.have.property('tableName').and.equal(cartoFakeDataset.tableName);
        dataset.should.have.property('applicationConfig').and.deep.equal(cartoFakeDataset.applicationConfig);
        dataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        dataset.should.have.property('status').and.equal('pending');
        dataset.should.have.property('overwrite').and.equal(true);
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
