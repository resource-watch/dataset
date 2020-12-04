const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, deserializeDataset } = require('./utils/helpers');
const { getTestServer } = require('./utils/test-server');

chai.should();

const requester = getTestServer();
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Dataset clone tests', () => {

    before(() => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
    });

    beforeEach(async () => {
        await Dataset.deleteMany({}).exec();
    });

    it('Clone a dataset that does not exist should return a 404 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const response = await requester
            .post(`/api/v1/dataset/1234/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '1234' doesn't exist`);
    });

    it('Clone a dataset without being logged in should return a 401 error', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });

        response.status.should.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal(`Unauthorized`);
    });

    it('Clone a dataset while being logged in as a USER should return a 403 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.USER);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Clone a dataset while being logged in as a MANAGER and not being the dataset owner should return a 403 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.MANAGER);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Clone a dataset while not having access to the target application should return a 403 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['potato']
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden - User does not have access to this dataset's application`);
    });

    it('Clone a dataset while being logged in as a MANAGER and being the dataset owner should be successful (happy case)', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.MANAGER);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();

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
                    userId: USERS.MANAGER.id,
                    layerRelevantProps: [],
                    widgetRelevantProps: [],
                    clonedHost: {
                        hostProvider: 'cartodb',
                        hostUrl: '/query/123456?sql=select * from data',
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
                    published: false,
                    mainDateField: null,
                    errorMessage: null,
                    overwrite: true,
                    status: 'pending',
                    tableName: cartoFakeDataset.tableName,
                    connectorUrl: `${process.env.CT_URL}/query/123456?sql=select * from data`,
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
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        dataset.should.have.property('name').and.not.equal(cartoFakeDataset.name);
        response.body.data.should.have.property('id').and.not.equal(cartoFakeDataset._id);

        dataset.should.have.property('application').and.deep.equal(['gfw', 'rw']);
        dataset.should.have.property('connectorType').and.equal('document');
        dataset.should.have.property('provider').and.equal('json');
        dataset.should.have.property('connectorUrl').and.equal('/query/123456?sql=select * from data');
        dataset.should.have.property('tableName').and.equal(cartoFakeDataset.tableName);
        dataset.should.have.property('applicationConfig').and.deep.equal(cartoFakeDataset.applicationConfig);
        dataset.should.have.property('userId').and.equal(USERS.MANAGER.id);
        dataset.should.have.property('status').and.equal('pending');
        dataset.should.have.property('overwrite').and.equal(true);
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Clone a dataset without application should return a 400 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data'
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- application: application can not be empty. - `);
    });

    it('Clone a dataset with an invalid application value should return a 400 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: 'rw',
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- application: must be a non-empty array - `);
    });

    it('Clone a dataset without datasetUrl should return a 400 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .post(`/api/v1/dataset/${cartoFakeDataset._id}/clone`)
            .set('Authorization', `Bearer abcd`)
            .send({
                application: ['gfw', 'rw'],
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- datasetUrl: datasetUrl can not be empty. - `);
    });

    it('Clone a dataset as an ADMIN should be successful (happy case)', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

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
                    userId: USERS.ADMIN.id,
                    layerRelevantProps: [],
                    widgetRelevantProps: [],
                    clonedHost: {
                        hostProvider: 'cartodb',
                        hostUrl: '/query/123456?sql=select * from data',
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
                    overwrite: true,
                    status: 'pending',
                    tableName: cartoFakeDataset.tableName,
                    connectorUrl: `${process.env.CT_URL}/query/123456?sql=select * from data`,
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
            .set('Authorization', `Bearer abcd`)
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw'],
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        dataset.should.have.property('name').and.not.equal(cartoFakeDataset.name);
        response.body.data.should.have.property('id').and.not.equal(cartoFakeDataset._id);

        dataset.should.have.property('application').and.deep.equal(['gfw', 'rw']);
        dataset.should.have.property('connectorType').and.equal('document');
        dataset.should.have.property('provider').and.equal('json');
        dataset.should.have.property('connectorUrl').and.equal('/query/123456?sql=select * from data');
        dataset.should.have.property('tableName').and.equal(cartoFakeDataset.tableName);
        dataset.should.have.property('applicationConfig').and.deep.equal(cartoFakeDataset.applicationConfig);
        dataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        dataset.should.have.property('status').and.equal('pending');
        dataset.should.have.property('overwrite').and.equal(true);
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Clone a dataset as an ADMIN with full cloning set to true should be successful (happy case)', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.CT_URL)
            .post(/v1\/graph\/dataset\/(\w|-)*$/)
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        nock(process.env.CT_URL)
            .post(`/v1/dataset/${cartoFakeDataset._id}/vocabulary/clone/dataset`, (request) => {
                // eslint-disable-next-line no-unused-expressions
                request.should.have.property('newDataset').and.not.be.empty;
                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });


        nock(process.env.CT_URL)
            .post(`/v1/dataset/${cartoFakeDataset._id}/metadata/clone`, (request) => {
                // eslint-disable-next-line no-unused-expressions
                request.should.have.property('newDataset').and.not.be.empty;
                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        nock(process.env.CT_URL)
            .post('/v1/doc-datasets/json', (request) => {
                const expected = {
                    connectorType: 'document',
                    provider: 'json',
                    userId: USERS.ADMIN.id,
                    layerRelevantProps: [],
                    widgetRelevantProps: [],
                    clonedHost: {
                        hostProvider: 'cartodb',
                        hostUrl: '/query/123456?sql=select * from data',
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
                    overwrite: true,
                    status: 'pending',
                    tableName: cartoFakeDataset.tableName,
                    connectorUrl: `${process.env.CT_URL}/query/123456?sql=select * from data`,
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
            .set('Authorization', `Bearer abcd`)
            .query({
                full: true
            })
            .send({
                datasetUrl: '/query/123456?sql=select * from data',
                application: ['gfw', 'rw']
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');

        dataset.should.have.property('name').and.not.equal(cartoFakeDataset.name);
        response.body.data.should.have.property('id').and.not.equal(cartoFakeDataset._id);

        dataset.should.have.property('application').and.deep.equal(['gfw', 'rw']);
        dataset.should.have.property('connectorType').and.equal('document');
        dataset.should.have.property('provider').and.equal('json');
        dataset.should.have.property('connectorUrl').and.equal('/query/123456?sql=select * from data');
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
