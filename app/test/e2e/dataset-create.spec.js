/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./test.constants');
const { deserializeDataset } = require('./utils');
const { getTestServer } = require('./test-server');

const should = chai.should();
chai.use(require('chai-datetime'));

const requester = getTestServer();
nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

describe('Dataset create tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        await Dataset.remove({}).exec();

        nock.cleanAll();
    });

    /* Create a Carto Dataset */
    it('Create a CARTO DB dataset should be successful', async () => {
        const timestamp = new Date().getTime();
        const dataset = {
            name: `Carto DB Dataset - ${timestamp}`,
            application: ['rw'],
            applicationConfig: {
                rw: {
                    foo: 'bar'
                }
            },
            connectorType: 'rest',
            provider: 'cartodb',
            env: 'production',
            connectorUrl: 'https://wri-01.carto.com/tables/wdpa_protected_areas/table',
            overwrite: true
        };

        nock(process.env.CT_URL)
            .post(/v1\/graph\/dataset\/(\w|-)*$/)
            .once()
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        nock(`${process.env.CT_URL}/v1`)
            .post('/rest-datasets/cartodb', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql([]);
                requestDataset.should.have.property('connectorUrl').and.equal(dataset.connectorUrl);

                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });
        const response = await requester
            .post(`/api/v1/dataset`)
            .send({
                dataset,
                loggedUser: USERS.ADMIN
            });

        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`Carto DB Dataset - ${timestamp}`);
        // createdDataset.application.should.be.an.instanceOf(Array).and.have.lengthOf(1);
        createdDataset.should.have.property('connectorType').and.equal('rest');
        createdDataset.should.have.property('provider').and.equal('cartodb');
        createdDataset.should.have.property('connectorUrl').and.equal('https://wri-01.carto.com/tables/wdpa_protected_areas/table');
        createdDataset.should.have.property('tableName').and.equal('wdpa_protected_areas');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(true);
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('createdAt').and.be.a('string');
        createdDataset.should.have.property('updatedAt').and.be.a('string');
        createdDataset.should.have.property('dataLastUpdated');
        new Date(createdDataset.updatedAt).should.equalDate(new Date(createdDataset.createdAt));
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    /* Create a FeatureServer dataset */
    it('Create a FeatureServer dataset should be successful', async () => {
        const timestamp = new Date().getTime();
        const dataset = {
            name: `FeatureServer Dataset - ${timestamp}`,
            application: ['gfw', 'rw'],
            applicationConfig: {
                gfw: {
                    foo: 'bar'
                },
                rw: {
                    foo: 'bar'
                }
            },
            connectorType: 'rest',
            provider: 'featureservice',
            env: 'production',
            connectorUrl: 'http://services6.arcgis.com/bIipaUHHcz1GaAsv/arcgis/rest/services/Mineral_Development_Agreements/FeatureServer/0?f=pjson',
            overwrite: true
        };

        nock(`${process.env.CT_URL}/v1`)
            .post('/rest-datasets/featureservice', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql([]);
                requestDataset.should.have.property('connectorUrl').and.equal(dataset.connectorUrl);

                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`FeatureServer Dataset - ${timestamp}`);
        // createdDataset.application.should.be.an.instanceOf(Array).and.have.lengthOf(2);
        createdDataset.should.have.property('connectorType').and.equal('rest');
        createdDataset.should.have.property('provider').and.equal('featureservice');
        createdDataset.should.have.property('connectorUrl').and.equal('http://services6.arcgis.com/bIipaUHHcz1GaAsv/arcgis/rest/services/Mineral_Development_Agreements/FeatureServer/0?f=pjson');
        createdDataset.should.have.property('tableName').and.equal('Mineral_Development_Agreements');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('overwrite').and.equal(true);
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Create a JSON dataset with data in the body should be successful', async () => {
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
            }
        };

        nock(`${process.env.CT_URL}/v1`)
            .post('/doc-datasets/json', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('data').and.deep.equal(dataset.data);
                requestDataset.should.have.property('sources').and.eql([]);
                requestDataset.should.not.have.property('connectorUrl');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
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

    it('Create a JSON dataset with data from a file should be successful', async () => {
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
            connectorUrl: 'https://fake-file.csv',
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        nock(`${process.env.CT_URL}/v1`)
            .post('/doc-datasets/json', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql([dataset.connectorUrl]);
                requestDataset.should.not.have.property('connectorUrl');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`JSON Dataset - ${timestamp.getTime()}`);
        createdDataset.should.have.property('connectorType').and.equal('document');
        createdDataset.should.have.property('provider').and.equal('json');
        createdDataset.should.have.property('connectorUrl').and.equal(dataset.connectorUrl);
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('tableName');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(false);
        createdDataset.should.have.property('dataLastUpdated').and.equal(timestamp.toISOString());
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Create a JSON dataset with data from multiple files should be successful', async () => {
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
            sources: [
                'https://fake-file-0.json',
                'https://fake-file-1.json',
                'https://fake-file-2.json'
            ],
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };


        nock(`${process.env.CT_URL}/v1`)
            .post('/doc-datasets/json', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql(dataset.sources);
                requestDataset.should.not.have.property('connectorUrl');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`JSON Dataset - ${timestamp.getTime()}`);
        createdDataset.should.have.property('connectorType').and.equal('document');
        createdDataset.should.have.property('provider').and.equal('json');
        createdDataset.should.have.property('connectorUrl').and.equal(null);
        createdDataset.should.have.property('sources').and.eql(dataset.sources);
        createdDataset.should.have.property('tableName');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(false);
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('dataLastUpdated').and.equal(timestamp.toISOString());
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Create a CSV dataset with data from multiple files should be successful', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `CSV Dataset - ${timestamp.getTime()}`,
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
            sources: [
                'https://fake-file-0.csv',
                'https://fake-file-1.csv',
                'https://fake-file-2.csv'
            ],
            env: 'production',
            provider: 'csv',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };


        nock(`${process.env.CT_URL}/v1`)
            .post('/doc-datasets/csv', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql(dataset.sources);
                requestDataset.should.not.have.property('connectorUrl');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`CSV Dataset - ${timestamp.getTime()}`);
        createdDataset.should.have.property('connectorType').and.equal('document');
        createdDataset.should.have.property('provider').and.equal('csv');
        createdDataset.should.have.property('connectorUrl').and.equal(null);
        createdDataset.should.have.property('sources').and.eql(dataset.sources);
        createdDataset.should.have.property('tableName');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(false);
        createdDataset.should.have.property('applicationConfig').and.deep.equal(dataset.applicationConfig);
        createdDataset.should.have.property('dataLastUpdated').and.equal(timestamp.toISOString());
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Create a JSON dataset with data from files in `sources` and `connectorUrl` should fail', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `JSON Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            connectorType: 'document',
            sources: [
                'https://fake-file-0.json',
                'https://fake-file-1.json',
                'https://fake-file-2.json'
            ],
            connectorUrl: 'https://fake-file-3.json',
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal('- connectorUrl: Specify either `connectorUrl`, `sources` or `data` - ');
    });

    it('Create a JSON dataset with data from files in `connectorUrl` and data in the body should fail', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `JSON Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            connectorType: 'document',
            connectorUrl: 'https://fake-file-0.json',
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
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal('- connectorUrl: Specify either `connectorUrl`, `sources` or `data` - ');
    });

    it('Create a JSON dataset with data from files in `sources` and data in the body should fail', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `JSON Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            connectorType: 'document',
            sources: [
                'https://fake-file-0.json',
                'https://fake-file-1.json',
                'https://fake-file-2.json'
            ],
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
            env: 'production',
            provider: 'json',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal('- connectorUrl: Specify either `connectorUrl`, `sources` or `data` - ');
    });

    it('Create a CSV dataset with data in the body should be successful', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `CSV Dataset - ${timestamp.getTime()}`,
            application: ['forest-atlas', 'rw'],
            connectorType: 'document',
            connectorUrl: 'https://fake-file.csv',
            env: 'production',
            provider: 'csv',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        nock(`${process.env.CT_URL}/v1`)
            .post('/doc-datasets/csv', (request) => {
                request.should.have.property('connector').and.be.an('object');
                const requestDataset = request.connector;

                requestDataset.should.have.property('name').and.equal(dataset.name);
                requestDataset.should.have.property('connectorType').and.equal(dataset.connectorType);
                requestDataset.should.have.property('application').and.eql(dataset.application);
                requestDataset.should.have.property('sources').and.eql([dataset.connectorUrl]);
                requestDataset.should.not.have.property('connectorUrl');

                return true;
            })
            .reply(200, {
                status: 200,
                detail: 'Ok'
            });

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });
        const createdDataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        createdDataset.should.have.property('name').and.equal(`CSV Dataset - ${timestamp.getTime()}`);
        createdDataset.should.have.property('connectorType').and.equal('document');
        createdDataset.should.have.property('provider').and.equal('csv');
        createdDataset.should.have.property('connectorUrl').and.equal(dataset.connectorUrl);
        createdDataset.should.have.property('tableName');
        createdDataset.should.have.property('userId').and.equal(USERS.ADMIN.id);
        createdDataset.should.have.property('status').and.equal('pending');
        createdDataset.should.have.property('overwrite').and.equal(false);
        createdDataset.should.have.property('dataLastUpdated').and.equal(timestamp.toISOString());
        createdDataset.legend.should.be.an.instanceOf(Object);
        createdDataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Create a CSV dataset with an app that\'s not part of the user account should fail', async () => {
        const timestamp = new Date();
        const dataset = {
            name: `CSV Dataset - ${timestamp.getTime()}`,
            application: ['fakeapp'],
            connectorType: 'document',
            connectorUrl: 'https://fake-file.csv',
            env: 'production',
            provider: 'csv',
            dataPath: 'data',
            dataLastUpdated: timestamp.toISOString()
        };

        const response = await requester.post(`/api/v1/dataset`).send({
            dataset,
            loggedUser: USERS.ADMIN
        });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden - User does not have access to this dataset's application`);
    });

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(async () => {
        await Dataset.remove({}).exec();
    });
});
