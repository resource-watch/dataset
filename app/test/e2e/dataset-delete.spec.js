const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const { createDataset, getUUID, deserializeDataset } = require('./utils/helpers');

chai.should();

const { getTestServer } = require('./utils/test-server');

const requester = getTestServer();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const runStandardTestCase = async (provider, fakeDataset, requestingUser = USERS.ADMIN) => {
    nock(process.env.API_URL)
        .get(`/v1/dataset/${fakeDataset._id}/layer?protected=true`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .get(`/v1/dataset/${fakeDataset._id}/widget?protected=true`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary/knowledge_graph?application=rw`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/layer`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/widget`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/metadata`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.API_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary`)
        .once()
        .reply(200, {
            status: 200,
            data: []
        });

    const deleteResponse = await requester
        .delete(`/api/v1/dataset/${fakeDataset._id}`)
        .query({
            loggedUser: JSON.stringify(requestingUser)
        })
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

    const getResponse = await requester.get(`/api/v1/dataset/${fakeDataset._id}`).send();

    getResponse.status.should.equal(404);
    getResponse.body.should.have.property('errors').and.be.an('array');
    getResponse.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${fakeDataset._id}' doesn't exist`);
};

describe('Dataset delete tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
    });

    it('Deleting a non-existing dataset should return a 404 error', async () => {
        const uuid = getUUID();
        const response = await requester.delete(`/api/v1/dataset/${uuid}?loggedUser=${JSON.stringify(USERS.ADMIN)}`).send();

        response.status.should.equal(404);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Dataset with id '${uuid}' doesn't exist`);
    });

    it('Deleting a dataset without being logged in should return a 401 error', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .delete(`/api/v1/dataset/${cartoFakeDataset._id}`)
            .send();

        response.status.should.equal(401);
        response.body.errors[0].should.have.property('detail').and.equal(`Unauthorized`);
    });

    it('Deleting a dataset owned by a different user as a USER should return a 403 error', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const deleteResponse = await requester.delete(`/api/v1/dataset/${fakeDataset._id}?loggedUser=${JSON.stringify(USERS.USER)}`).send();

        deleteResponse.status.should.equal(403);
        deleteResponse.body.should.have.property('errors').and.be.an('array');
        deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Deleting a dataset owned by the user as a USER should return a 403 error', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            userId: USERS.USER.id,
        })).save();

        const deleteResponse = await requester.delete(`/api/v1/dataset/${fakeDataset._id}?loggedUser=${JSON.stringify(USERS.USER)}`).send();

        deleteResponse.status.should.equal(403);
        deleteResponse.body.should.have.property('errors').and.be.an('array');
        deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Deleting a dataset owned by a different user as a MANAGER should return a 403 error', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const deleteResponse = await requester.delete(`/api/v1/dataset/${fakeDataset._id}?loggedUser=${JSON.stringify(USERS.MANAGER)}`).send();

        deleteResponse.status.should.equal(403);
        deleteResponse.body.should.have.property('errors').and.be.an('array');
        deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Deleting a dataset owned by the user as a MANAGER should be successful and return the dataset', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            userId: USERS.MANAGER.id,
        })).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${fakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(fakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(fakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(fakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(fakeDataset.name);
                requestDataset.overwrite.should.deep.equal(fakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(fakeDataset.slug);
                requestDataset.tableName.should.deep.equal(fakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('cartodb', fakeDataset, USERS.MANAGER);
    });

    it('Deleting a dataset as a USER should return a 403 error', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const deleteResponse = await requester.delete(`/api/v1/dataset/${fakeDataset._id}?loggedUser=${JSON.stringify(USERS.USER)}`).send();

        deleteResponse.status.should.equal(403);
        deleteResponse.body.should.have.property('errors').and.be.an('array');
        deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Deleting an existing dataset should be successful and return the dataset (happy case)', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(cartoFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(cartoFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(cartoFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(cartoFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(cartoFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(cartoFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(cartoFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('cartodb', cartoFakeDataset);
    });

    // TODO: This endpoint should not actually call the provider, otherwise we may end up with a dataset with no data.
    it('Deleting a protected dataset should return a 400', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', { protected: true })).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${fakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(fakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(fakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(fakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(fakeDataset.name);
                requestDataset.overwrite.should.deep.equal(fakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(fakeDataset.slug);
                requestDataset.tableName.should.deep.equal(fakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        const deleteResponse = await requester
            .delete(`/api/v1/dataset/${fakeDataset._id}?loggedUser=${JSON.stringify(USERS.ADMIN)}`)
            .send();

        deleteResponse.status.should.equal(400);
        deleteResponse.body.should.have.property('errors').and.be.an('array');
        deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Dataset is protected`);
    });

    it('Deleting an existing carto dataset with missing layer MS should fail with a meaningful error', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.API_URL)
            .get(`/v1/dataset/${cartoFakeDataset._id}/layer?protected=true`)
            .once()
            .reply(404, {
                status: 404,
                detail: 'Endpoint not found'
            });

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(cartoFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(cartoFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(cartoFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(cartoFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(cartoFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(cartoFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(cartoFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        const response = await requester.delete(`/api/v1/dataset/${cartoFakeDataset._id}?loggedUser=${JSON.stringify(USERS.ADMIN)}`).send();

        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Error obtaining protected layers of the dataset: 404 - {"status":404,"detail":"Endpoint not found"}`);
    });

    it('Deleting an existing carto dataset with missing widget MS should fail with a meaningful error', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.API_URL)
            .get(`/v1/dataset/${cartoFakeDataset._id}/layer?protected=true`)
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        nock(process.env.API_URL)
            .get(`/v1/dataset/${cartoFakeDataset._id}/widget?protected=true`)
            .once()
            .reply(404, {
                status: 404,
                detail: 'Endpoint not found'
            });

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(cartoFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(cartoFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(cartoFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(cartoFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(cartoFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(cartoFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(cartoFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        const response = await requester.delete(`/api/v1/dataset/${cartoFakeDataset._id}?loggedUser=${JSON.stringify(USERS.ADMIN)}`).send();

        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Error obtaining protected widgets of the dataset: 404 - {"status":404,"detail":"Endpoint not found"}`);
    });

    it('Deleting an existing carto dataset with missing carto MS should fail with a meaningful error', async () => {
        const cartoFakeDataset = await new Dataset(createDataset('cartodb')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/cartodb/${cartoFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(cartoFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(cartoFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(cartoFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(cartoFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(cartoFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(cartoFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(cartoFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(404, {
                status: 404,
                detail: 'Endpoint not found'
            });

        const response = await requester.delete(`/api/v1/dataset/${cartoFakeDataset._id}?loggedUser=${JSON.stringify(USERS.ADMIN)}`).send();

        response.status.should.equal(500);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Error connecting to dataset adapter: 404 - {"status":404,"detail":"Endpoint not found"}`);
    });

    it('Deleting an existing json dataset should be successful and return the dataset (happy case)', async () => {
        const jsonFakeDataset = await new Dataset(createDataset('json')).save();

        nock(process.env.API_URL)
            .delete(`/v1/doc-datasets/json/${jsonFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(jsonFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(jsonFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(jsonFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(jsonFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(jsonFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(jsonFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(jsonFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('json', jsonFakeDataset);
    });

    it('Deleting an existing tsv dataset should be successful and return the dataset (happy case)', async () => {
        const tsvFakeDataset = await new Dataset(createDataset('tsv')).save();

        nock(process.env.API_URL)
            .delete(`/v1/doc-datasets/tsv/${tsvFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(tsvFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(tsvFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(tsvFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(tsvFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(tsvFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(tsvFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(tsvFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('tsv', tsvFakeDataset);
    });

    it('Deleting an existing xml dataset should be successful and return the dataset (happy case)', async () => {
        const xmlFakeDataset = await new Dataset(createDataset('xml')).save();

        nock(process.env.API_URL)
            .delete(`/v1/doc-datasets/xml/${xmlFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(xmlFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(xmlFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(xmlFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(xmlFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(xmlFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(xmlFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(xmlFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('xml', xmlFakeDataset);
    });

    it('Deleting an existing featureservice dataset should be successful and return the dataset (happy case)', async () => {
        const featureserviceFakeDataset = await new Dataset(createDataset('featureservice')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/featureservice/${featureserviceFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(featureserviceFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(featureserviceFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(featureserviceFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(featureserviceFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(featureserviceFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(featureserviceFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(featureserviceFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('featureservice', featureserviceFakeDataset);
    });

    it('Deleting an existing gee dataset should be successful and return the dataset (happy case)', async () => {
        const geeFakeDataset = await new Dataset(createDataset('gee')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/gee/${geeFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(geeFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(geeFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(geeFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(geeFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(geeFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(geeFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(geeFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(204);

        await runStandardTestCase('gee', geeFakeDataset);
    });

    it('Deleting an existing bigquery dataset should be successful and return the dataset (happy case)', async () => {
        const bigqueryFakeDataset = await new Dataset(createDataset('bigquery')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/bigquery/${bigqueryFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(bigqueryFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(bigqueryFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(bigqueryFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(bigqueryFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(bigqueryFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(bigqueryFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(bigqueryFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('bigquery', bigqueryFakeDataset);
    });

    it('Deleting an existing rasdaman dataset should be successful and return the dataset (happy case)', async () => {
        const rasdamanFakeDataset = await new Dataset(createDataset('rasdaman')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/rasdaman/${rasdamanFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(rasdamanFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(rasdamanFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(rasdamanFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(rasdamanFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(rasdamanFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(rasdamanFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(rasdamanFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('rasdaman', rasdamanFakeDataset);
    });

    it('Deleting an existing nexgddp dataset should be successful and return the dataset (happy case)', async () => {
        const nexgddpFakeDataset = await new Dataset(createDataset('nexgddp')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/nexgddp/${nexgddpFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(nexgddpFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(nexgddpFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(nexgddpFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(nexgddpFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(nexgddpFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(nexgddpFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(nexgddpFakeDataset.tableName);
                return true;
            })
            .once()
            .reply(200, {
                status: 200,
                data: []
            });

        await runStandardTestCase('nexgddp', nexgddpFakeDataset);
    });

    it('Deleting an existing loca dataset should be successful and return the dataset (happy case)', async () => {
        const locaFakeDataset = await new Dataset(createDataset('loca')).save();

        nock(process.env.API_URL)
            .delete(`/v1/rest-datasets/loca/${locaFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(locaFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(locaFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(locaFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(locaFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(locaFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(locaFakeDataset.slug);
                requestDataset.tableName.should.deep.equal(locaFakeDataset.tableName);
                return true;
            })
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

        nock(process.env.API_URL)
            .delete(`/v1/doc-datasets/json/${jsonFakeDataset._id}`, (request) => {
                const requestDataset = request.connector;

                requestDataset.attributesPath.should.deep.equal(jsonFakeDataset.attributesPath);
                requestDataset.connectorType.should.deep.equal(jsonFakeDataset.connectorType);
                requestDataset.connectorUrl.should.deep.equal(jsonFakeDataset.connectorUrl);
                requestDataset.name.should.deep.equal(jsonFakeDataset.name);
                requestDataset.overwrite.should.deep.equal(jsonFakeDataset.overwrite);
                requestDataset.slug.should.deep.equal(jsonFakeDataset.slug);
                requestDataset.should.have.property('tableName').and.equal(jsonFakeDataset.tableName);
                return true;
            })
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

    afterEach(() => {
        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });

    after(async () => {
        await Dataset.deleteMany({}).exec();
    });
});
