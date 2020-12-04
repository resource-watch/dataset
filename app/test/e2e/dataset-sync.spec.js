const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { getTestServer } = require('./utils/test-server');
const { createDataset, deserializeDataset } = require('./utils/helpers');

chai.should();
chai.use(require('chai-datetime'));

const requester = getTestServer();
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Dataset sync tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.deleteMany({}).exec();
    });

    it('Create a document dataset with empty sync data should return a 400 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const timestamp = new Date();
        const dataset = {
            name: `JSON Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            applicationConfig: {
                'forest-atlas': {
                    foo: 'bar',
                },
                rw: {
                    foo: 'bar',
                }
            },
            connectorType: 'document',
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString(),
            data: {
                data: [
                    {
                        a: 1,
                        b: 2
                    },
                    {
                        a: 2,
                        b: 1
                    },
                ]
            },
            sync: {}
        };

        const response = await requester
            .post(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .send({
                dataset,
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- sync: not valid - `);
    });

    it('Create a document dataset with valid sync data should return a 200 (happy case)', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const timestamp = new Date();
        const dataset = {
            name: `JSON Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            applicationConfig: {
                'forest-atlas': {
                    foo: 'bar',
                },
                rw: {
                    foo: 'bar',
                }
            },
            connectorType: 'document',
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString(),
            data: {
                data: [
                    {
                        a: 1,
                        b: 2
                    },
                    {
                        a: 2,
                        b: 1
                    },
                ]
            },
            sync: {
                cronPattern: '0 * * * * *',
                action: 'concat',
                url: 'http://google.com'
            }
        };

        nock(process.env.CT_URL)
            .post('/v1/task/sync-dataset', (body) => {
                body.should.have.property('datasetId');
                body.should.have.property('provider').and.equal('json');
                body.should.have.property('dataPath').and.equal('data');
                body.should.have.property('legend');
                body.should.have.property('cronPattern').and.equal(dataset.sync.cronPattern);
                body.should.have.property('action').and.equal(dataset.sync.action);
                body.should.have.property('url').and.equal(dataset.sync.url);

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        nock(process.env.CT_URL)
            .post('/v1/doc-datasets/json')
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester
            .post(`/api/v1/dataset`)
            .set('Authorization', `Bearer abcd`)
            .send({
                dataset
            });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`JSON Dataset - ${timestamp.getTime()}`);
        createdDataset.should.have.property('connectorType').and.equal('document');
        createdDataset.should.have.property('provider').and.equal('json');
        createdDataset.should.have.property('connectorUrl').and.equal(null);
        createdDataset.should.have.property('tableName');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(false);
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('dataLastUpdated').and.equal(timestamp.toISOString());
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Update a document dataset with empty sync data should return a 400 error', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .set('Authorization', `Bearer abcd`)
            .send({
                name: 'other name',
                application: ['gfw', 'rw'],
                sync: {}
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- sync: not valid - `);
    });

    it('Update a document dataset with valid sync data should return a 200 (happy case)', async () => {
        nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
            .get('/auth/user/me')
            .reply(200, USERS.ADMIN);

        const fakeDataset = await new Dataset(createDataset('json')).save();

        nock(process.env.CT_URL)
            .put('/v1/task/sync-dataset/by-dataset', (body) => {
                body.should.have.property('datasetId');
                body.should.have.property('provider').and.equal('json');
                body.should.have.property('dataPath').and.equal(fakeDataset.dataPath);
                body.should.have.property('legend');
                body.should.have.property('cronPattern').and.equal('0 * * * * *');
                body.should.have.property('action').and.equal('concat');
                body.should.have.property('url').and.equal('http://google.com');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .set('Authorization', `Bearer abcd`)
            .send({
                name: 'other name',
                application: ['gfw', 'rw'],
                sync: {
                    cronPattern: '0 * * * * *',
                    action: 'concat',
                    url: 'http://google.com'
                }
            });

        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('name').and.equal('other name');
        dataset.should.have.property('connectorType').and.equal('document');
        dataset.should.have.property('provider').and.equal('json');
        dataset.should.have.property('connectorUrl').and.equal(fakeDataset.connectorUrl);
        dataset.should.have.property('tableName').and.equal(fakeDataset.tableName);
        dataset.should.have.property('userId').and.equal(fakeDataset.userId);
        dataset.should.have.property('applicationConfig').and.deep.equal(fakeDataset.applicationConfig);
        dataset.should.have.property('status').and.equal('saved');
        dataset.should.have.property('overwrite').and.equal(true);
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
    });

    // TODO: delete sync tests, once deleting a dataset actually cleans up after itself on delete

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(async () => {
        await Dataset.deleteMany({}).exec();
    });
});
