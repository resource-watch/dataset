const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const {
    createDataset, getUUID, deserializeDataset
} = require('./utils/helpers');

chai.should();

const { getTestServer } = require('./utils/test-server');
const { mockValidateRequestWithApiKeyAndUserToken, mockValidateRequestWithApiKey } = require('./utils/mocks');

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const prepareNockForDelete = (fakeDataset) => {
    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .get(`/v1/dataset/${fakeDataset._id}/layer?protected=true`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .get(`/v1/dataset/${fakeDataset._id}/widget?protected=true`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary/knowledge_graph?application=rw`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .delete(`/v1/dataset/${fakeDataset._id}/layer`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .delete(`/v1/dataset/${fakeDataset._id}/widget`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .delete(`/v1/dataset/${fakeDataset._id}/metadata`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary`)
        .reply(200, {
            status: 200,
            data: []
        });
}

const runStandardTestCase = async (provider, fakeDataset, requestingUser = USERS.ADMIN) => {
    prepareNockForDelete(fakeDataset);

    mockValidateRequestWithApiKeyAndUserToken({ user: requestingUser });
    mockValidateRequestWithApiKey({});

    const deleteResponse = await requester
        .delete(`/api/v1/dataset/${fakeDataset._id}`)
        .set('Authorization', `Bearer abcd`)
        .set('x-api-key', 'api-key-test')
        .send();

    deleteResponse.status.should.equal(200);
    const createdDataset = deserializeDataset(deleteResponse);

    deleteResponse.status.should.equal(200);
    deleteResponse.body.should.have.property('data').and.be.an('object');
    createdDataset.should.have.property('name').and.equal(fakeDataset.name);
    createdDataset.should.have.property('applicationConfig').and.deep.equal(fakeDataset.applicationConfig);
    createdDataset.should.have.property('connectorType').and.equal(fakeDataset.connectorType);
    createdDataset.should.have.property('provider').and.equal(provider);
    createdDataset.should.have.property('userId').and.equal(fakeDataset.userId);
    createdDataset.should.have.property('status').and.equal('saved');
    createdDataset.should.have.property('overwrite').and.equal(true);
    createdDataset.legend.should.be.an.instanceOf(Object);
    createdDataset.clonedHost.should.be.an.instanceOf(Object);

    const getResponse = await requester
        .get(`/api/v1/dataset/${fakeDataset._id}`)
        .set('x-api-key', 'api-key-test')
        .send();

    getResponse.status.should.equal(404);
    getResponse.body.should.have.property('errors').and.be.an('array');
    getResponse.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${fakeDataset._id}' doesn't exist`);
};

describe('Dataset delete tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });


    describe('Basics', () => {

        it('Deleting a non-existing dataset should return a 404 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const uuid = getUUID();
            const response = await requester
                .delete(`/api/v1/dataset/${uuid}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            response.status.should.equal(404);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${uuid}' doesn't exist`);
        });

        it('Deleting an existing dataset should be successful and return the dataset (happy case)', async () => {
            const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('cartodb', cartoFakeDataset);
        });

        // TODO: This endpoint should not actually call the provider, otherwise we may end up with a dataset with no data.
        it('Deleting a protected dataset should return a 400', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', { protected: true })).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${fakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            deleteResponse.status.should.equal(400);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Dataset is protected`);
        });
    });

    describe('Permissions', () => {

        it('Deleting a dataset without being logged in should return a 401 error', async () => {
            const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();
            mockValidateRequestWithApiKey({});

            const response = await requester
                .delete(`/api/v1/dataset/${cartoFakeDataset._id}`)
                .set('x-api-key', 'api-key-test')
                .send();

            response.status.should.equal(401);
            response.body.errors[0].should.have.property('detail').and.equal(`Unauthorized`);
        });

        it('Deleting a dataset as a USER should return a 403 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            deleteResponse.status.should.equal(403);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Deleting a dataset owned by the user as a USER should return a 403 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                userId: USERS.USER.id,
            })).save();

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            deleteResponse.status.should.equal(403);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Deleting a dataset owned by a different user as a MANAGER should return a 403 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            deleteResponse.status.should.equal(403);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Deleting a dataset owned by the user as a MANAGER should be successful and return the dataset', async () => {
            const fakeDataset = await new Dataset(createDataset('cartodb', {
                userId: USERS.MANAGER.id,
            })).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${fakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('cartodb', fakeDataset, USERS.MANAGER);
        });

    });

    describe('Missing related microservices', () => {

        it('Deleting an existing carto dataset with missing layer MS should fail with a meaningful error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .get(`/v1/dataset/${cartoFakeDataset._id}/layer?protected=true`)
                .once()
                .reply(404, {
                    status: 404,
                    detail: 'Endpoint not found'
                });

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            const response = await requester
                .delete(`/api/v1/dataset/${cartoFakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            response.status.should.equal(500);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Error obtaining protected layers of the dataset: 404 - {"status":404,"detail":"Endpoint not found"}`);
        });

        it('Deleting an existing carto dataset with missing widget MS should fail with a meaningful error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .get(`/v1/dataset/${cartoFakeDataset._id}/layer?protected=true`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .get(`/v1/dataset/${cartoFakeDataset._id}/widget?protected=true`)
                .once()
                .reply(404, {
                    status: 404,
                    detail: 'Endpoint not found'
                });

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            const response = await requester
                .delete(`/api/v1/dataset/${cartoFakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            response.status.should.equal(500);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Error obtaining protected widgets of the dataset: 404 - {"status":404,"detail":"Endpoint not found"}`);
        });

        it('Deleting an existing carto dataset with missing carto MS should fail with a meaningful error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`)
                .once()
                .reply(404, {
                    status: 404,
                    detail: 'Endpoint not found'
                });

            const response = await requester
                .delete(`/api/v1/dataset/${cartoFakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send();

            response.status.should.equal(500);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Error connecting to dataset adapter: 404 - {"status":404,"detail":"Endpoint not found"}`);
        });

    });

    describe('Different types', () => {

        it('Deleting an existing json dataset should be successful and return the dataset (happy case)', async () => {
            const jsonFakeDataset = await new Dataset(createDataset('json')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/doc-datasets/json/${jsonFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('json', jsonFakeDataset);
        });

        it('Deleting an existing tsv dataset should be successful and return the dataset (happy case)', async () => {
            const tsvFakeDataset = await new Dataset(createDataset('tsv')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/doc-datasets/tsv/${tsvFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('tsv', tsvFakeDataset);
        });

        it('Deleting an existing xml dataset should be successful and return the dataset (happy case)', async () => {
            const xmlFakeDataset = await new Dataset(createDataset('xml')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/doc-datasets/xml/${xmlFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('xml', xmlFakeDataset);
        });

        it('Deleting an existing featureservice dataset should be successful and return the dataset (happy case)', async () => {
            const featureserviceFakeDataset = await new Dataset(createDataset('featureservice')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/featureservice/${featureserviceFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('featureservice', featureserviceFakeDataset);
        });

        it('Deleting an existing gee dataset should be successful and return the dataset (happy case)', async () => {
            const geeFakeDataset = await new Dataset(createDataset('gee')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/gee/${geeFakeDataset._id}`)
                .once()
                .reply(204);

            await runStandardTestCase('gee', geeFakeDataset);
        });

        it('Deleting an existing bigquery dataset should be successful and return the dataset (happy case)', async () => {
            const bigqueryFakeDataset = await new Dataset(createDataset('bigquery')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/bigquery/${bigqueryFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('bigquery', bigqueryFakeDataset);
        });

        it('Deleting an existing rasdaman dataset should be successful and return the dataset (happy case)', async () => {
            const rasdamanFakeDataset = await new Dataset(createDataset('rasdaman')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/rasdaman/${rasdamanFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('rasdaman', rasdamanFakeDataset);
        });

        it('Deleting an existing nexgddp dataset should be successful and return the dataset (happy case)', async () => {
            const nexgddpFakeDataset = await new Dataset(createDataset('nexgddp')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/nexgddp/${nexgddpFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('nexgddp', nexgddpFakeDataset);
        });

        it('Deleting an existing loca dataset should be successful and return the dataset (happy case)', async () => {
            const locaFakeDataset = await new Dataset(createDataset('loca')).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/rest-datasets/loca/${locaFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('loca', locaFakeDataset);
        });

        it('Delete a document dataset with missing tableName should delete (happy case)', async () => {
            const jsonFakeDataset = await new Dataset(createDataset('json', {
                tableName: null,
                connectorType: 'document'
            })).save();

            nock(process.env.GATEWAY_URL, {
        reqheaders: {
            'x-api-key': 'api-key-test',
        }
    })
                .delete(`/v1/doc-datasets/json/${jsonFakeDataset._id}`)
                .once()
                .reply(200, {
                    status: 200,
                    data: []
                });

            await runStandardTestCase('json', jsonFakeDataset);
        });

        it('Delete a WMS dataset should be successful (happy case)', async () => {
            const dataset = await new Dataset(createDataset('wms', {
                tableName: null,
                connectorType: 'wms'
            })).save();

            await runStandardTestCase('wms', dataset);
        });

    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
