const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const {
    createDataset, deserializeDataset, ensureCorrectError
} = require('./utils/helpers');

chai.should();

const { getTestServer } = require('./utils/test-server');
const { mockValidateRequestWithApiKey, mockValidateRequestWithApiKeyAndUserToken } = require('./utils/mocks');

let requester;

describe('Dataset update', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    describe('Permissions', () => {

        it('Update a dataset without being logged in should return a 401 error', async () => {
            mockValidateRequestWithApiKey({});
            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw']
                });

            response.status.should.equal(401);
            ensureCorrectError(response.body, 'Unauthorized');
        });

        it('Update a dataset while being logged in with role USER should return a 403 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            ensureCorrectError(response.body, 'Forbidden');
        });

        it('Update a dataset while being logged in with role MANAGER should return a 403 error', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            ensureCorrectError(response.body, 'Forbidden');
        });

        it('Update a dataset as an ADMIN should be successful (happy case)', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('name').and.equal('other name');
            dataset.should.have.property('connectorType').and.equal('rest');
            dataset.should.have.property('provider').and.equal('cartodb');
            dataset.should.have.property('connectorUrl').and.equal(fakeDataset.connectorUrl);
            dataset.should.have.property('tableName').and.equal(fakeDataset.tableName);
            dataset.should.have.property('userId').and.equal(fakeDataset.userId);
            dataset.should.have.property('applicationConfig').and.deep.equal(fakeDataset.applicationConfig);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('overwrite').and.equal(true);
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });

        it('Update a dataset as a MICROSERVICE should be successful (happy case)', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MICROSERVICE });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('name').and.equal('other name');
            dataset.should.have.property('connectorType').and.equal('rest');
            dataset.should.have.property('provider').and.equal('cartodb');
            dataset.should.have.property('connectorUrl').and.equal(fakeDataset.connectorUrl);
            dataset.should.have.property('tableName').and.equal(fakeDataset.tableName);
            dataset.should.have.property('userId').and.equal(fakeDataset.userId);
            dataset.should.have.property('applicationConfig').and.deep.equal(fakeDataset.applicationConfig);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('overwrite').and.equal(true);
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });
    });

    describe('Basics and misc', () => {

        it('Update a dataset that doesn\'t exist should return a 404', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const response = await requester
                .patch(`/api/v1/dataset/12345`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(404);
            ensureCorrectError(response.body, 'Dataset with id \'12345\' doesn\'t exist');
        });

        it('Update a dataset by slug should be successful (happy case)', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MICROSERVICE });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset.slug}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('name').and.equal('other name');
            dataset.should.have.property('connectorType').and.equal('rest');
            dataset.should.have.property('provider').and.equal('cartodb');
            dataset.should.have.property('connectorUrl').and.equal(fakeDataset.connectorUrl);
            dataset.should.have.property('tableName').and.equal(fakeDataset.tableName);
            dataset.should.have.property('userId').and.equal(fakeDataset.userId);
            dataset.should.have.property('applicationConfig').and.deep.equal(fakeDataset.applicationConfig);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('overwrite').and.equal(true);
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });

        it('Update a dataset with a valid dataLastUpdated value should work correctly', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const timestamp = new Date().toISOString();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    dataLastUpdated: timestamp,
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('dataLastUpdated').and.equal(timestamp);
            dataset.should.have.property('createdAt').and.equal(fakeDataset.createdAt.toISOString());
        });

        it('Update a dataset with an invalid dataLastUpdated should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    dataLastUpdated: 'potato',
                });

            response.status.should.equal(400);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`- dataLastUpdated: must be an date - `);
        });

        it('Update a dataset with a null dataLastUpdated should work correctly', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();
            fakeDataset.dataLastUpdated.should.not.equal(null);

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    dataLastUpdated: null,
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('dataLastUpdated').and.equal(null);
        });

        it('Update a dataset as ADMIN with empty connectorUrl and list of sources should succeed', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    connectorUrl: null,
                    sources: ['http://url.com/file1.json', 'http://url.com/file2.json'],
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');

            const dataset = deserializeDataset(response);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('sources').and.eql(['http://url.com/file1.json', 'http://url.com/file2.json']);
            dataset.should.have.property('connectorUrl').and.equal(null);
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
            dataset.should.have.property('createdAt').and.equal(fakeDataset.createdAt.toISOString());
        });

        it('Updating a dataset with null sources and connectorUrl should return a 400', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('json', { application: ['rw'] })).save();
            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ sources: [], connectorUrl: null });

            response.status.should.equal(400);
            ensureCorrectError(response.body, '- connectorUrl: empty or invalid connectorUrl - ');
        });
    });

    describe('Status', () => {
        it('Update status for a dataset as USER that owns the dataset should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

            const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 'pending',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Update status for a dataset as MANAGER that does not own the dataset should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 'pending',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Update status for a dataset as MANAGER that owns the dataset should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 'pending',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`User does not have permission to update status on dataset with id ${fakeDataset._id}`);
        });

        it('Update status for a dataset as non-admin with invalid status (string) should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 'fail',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(400);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Invalid status 'fail' for update to dataset with id ${fakeDataset._id}`);
        });

        it('Update status for a dataset as non-admin with invalid status (int) should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 78,
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(400);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Invalid status '78' for update to dataset with id ${fakeDataset._id}`);
        });

        it('Update status for a dataset as admin with valid status (string) should succeed', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 'pending',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('status').and.equal('pending');
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });

        it('Update status for a dataset as admin with valid status (int) should succeed', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    status: 2,
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('status').and.equal('failed');
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
            dataset.should.have.property('createdAt').and.equal(fakeDataset.createdAt.toISOString());
        });
    });

    describe('Error message', () => {
        it('Update the error message of a dataset as an ADMIN should succeed but not change the message', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                errorMessage: 'Old error message'
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'Updated dataset name',
                    errorMessage: 'Updated error message',
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);

            dataset.should.have.property('name').and.equal('Updated dataset name');
            dataset.should.have.property('errorMessage').and.eql(fakeDataset.errorMessage);
        });

        it('Update the error message of a dataset as a MICROSERVICE should succeed and change the message', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MICROSERVICE });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                errorMessage: 'Old error message'
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'Updated dataset name',
                    errorMessage: 'Updated error message',
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);

            dataset.should.have.property('name').and.equal('Updated dataset name');
            dataset.should.have.property('errorMessage').and.eql('Updated error message');
        });

        it('Clear the error message of a dataset as a MICROSERVICE should succeed and clear the message', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MICROSERVICE });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                errorMessage: 'Old error message'
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'Updated dataset name',
                    errorMessage: '',
                });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);

            dataset.should.have.property('name').and.equal('Updated dataset name');
            dataset.should.have.property('errorMessage').and.eql('');
        });
    });

    describe('Apps', () => {
        // TODO: this should probably fail, as a user should not be able to assign a dataset to an app it does not belong to.
        it('Update a dataset while being logged in with role ADMIN and a fake app should be sucessful (happy case)', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    name: 'other name',
                    application: ['fake'],
                });

            response.status.should.equal(200);
        });

        it('As an USER with a single app, removing my app from the array of apps of the dataset should return 403 Forbidden', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_USER });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                userId: USERS.RW_USER.id, application: ['rw', 'gfw']
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['gfw'] });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal('Forbidden');
        });

        it('As a MANAGER with a single app, removing my app from the array of apps of the dataset (that I own) should return 200 OK with the updated dataset', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                userId: USERS.RW_MANAGER.id, application: ['rw', 'gfw']
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['gfw'] });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('application').and.eql(['gfw']);
        });

        it('As an ADMIN with a single app, removing apps not managed by me from the array of apps of the dataset should return 403 Forbidden', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                application: ['rw', 'prep', 'sdg4data', 'ng', 'aqueduct', 'gfw']
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    application: ['rw', 'sdg4data', 'ng', 'aqueduct', 'gfw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal('Forbidden - User does not have access to this dataset\'s application');
        });

        it('As an ADMIN with a single app, removing my app from the array of apps of the dataset should return 200 OK with the updated dataset', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', { application: ['rw', 'gfw'] })).save();
            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['gfw'] });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);
            dataset.should.have.property('application').and.eql(['gfw']);
        });

        it('As an ADMIN with a single app, adding my app to the array of apps of the dataset should return 200 OK with the updated dataset', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', { application: null })).save();
            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['rw'] });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('application').and.eql(['rw']);
        });

        it('As an ADMIN, editing the dataset without changing the dataset apps should return 200 OK with the updated dataset', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.RW_ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', { application: ['rw'] })).save();
            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['rw'] });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('application').and.eql(['rw']);
        });

        it('Update the applications of a dataset as an app ADMIN with associated app should succeed', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb', {
                application: ['rw', 'gfw']
            })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({ application: ['gfw'] });

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            const dataset = deserializeDataset(response);
            dataset.should.have.property('status').and.equal('saved');
            dataset.should.have.property('application').and.eql(['gfw']);
        });
    });

    describe('Environments', () => {
        it('Update env for a dataset as USER that owns the dataset should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.USER });

            const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    env: 'custom',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Update env for a dataset as MANAGER that does not own the dataset should fail', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    env: 'custom',
                    application: ['gfw', 'rw'],
                });

            response.status.should.equal(403);
            response.body.should.have.property('errors').and.be.an('array');
            response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Update env for a dataset as MANAGER that owns the dataset should update the dataset and propagate env change to layers and widgets', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.MANAGER });

            const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();

            nock(process.env.GATEWAY_URL, {
                reqheaders: {
                    'x-api-key': 'api-key-test',
                }
            })
                .patch(`/v1/widget/change-environment/${fakeDataset.id}/custom`)
                .reply(200, '');

            nock(process.env.GATEWAY_URL, {
                reqheaders: {
                    'x-api-key': 'api-key-test',
                }
            })
                .patch(`/v1/layer/change-environment/${fakeDataset.id}/custom`)
                .reply(200, '');

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    env: 'custom',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('env').and.equal('custom');
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });

        it('Update env for a dataset as ADMIN should update the dataset and propagate env change to layers and widgets', async () => {
            mockValidateRequestWithApiKeyAndUserToken({ user: USERS.ADMIN });

            const fakeDataset = await new Dataset(createDataset('cartodb')).save();

            nock(process.env.GATEWAY_URL, {
                reqheaders: {
                    'x-api-key': 'api-key-test',
                }
            })
                .patch(`/v1/widget/change-environment/${fakeDataset.id}/custom`)
                .reply(200, '');

            nock(process.env.GATEWAY_URL, {
                reqheaders: {
                    'x-api-key': 'api-key-test',
                }
            })
                .patch(`/v1/layer/change-environment/${fakeDataset.id}/custom`)
                .reply(200, '');

            const response = await requester
                .patch(`/api/v1/dataset/${fakeDataset._id}`)
                .set('Authorization', `Bearer abcd`)
                .set('x-api-key', 'api-key-test')
                .send({
                    env: 'custom',
                    application: ['gfw', 'rw'],
                });
            const dataset = deserializeDataset(response);

            response.status.should.equal(200);
            response.body.should.have.property('data').and.be.an('object');
            dataset.should.have.property('env').and.equal('custom');
            dataset.legend.should.be.an.instanceOf(Object);
            dataset.clonedHost.should.be.an.instanceOf(Object);
        });
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
