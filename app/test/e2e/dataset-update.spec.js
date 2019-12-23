/* eslint-disable no-unused-vars,no-undef */
const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./test.constants');
const { createDataset, deserializeDataset } = require('./utils');

const should = chai.should();

const { getTestServer } = require('./test-server');

const requester = getTestServer();

describe('Dataset update tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }
    });

    it('Update a dataset as an ADMIN should be successful (happy case)', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                name: 'other name',
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
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
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                name: 'other name',
                application: ['gfw', 'rw'],
                loggedUser: USERS.MICROSERVICE
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
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const timestamp = new Date().toISOString();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                dataLastUpdated: timestamp,
                loggedUser: USERS.ADMIN
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('dataLastUpdated').and.equal(timestamp);
        dataset.should.have.property('createdAt').and.equal(fakeDataset.createdAt.toISOString());
    });


    it('Update a dataset with an invalid dataLastUpdated should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                dataLastUpdated: 'potato',
                loggedUser: USERS.ADMIN
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`- dataLastUpdated: must be an date - `);
    });

    it('Update status for a dataset as USER that owns the dataset should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 'pending',
                application: ['gfw', 'rw'],
                loggedUser: USERS.USER
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });


    it('Update status for a dataset as MANAGER that does not own the dataset should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 'pending',
                application: ['gfw', 'rw'],
                loggedUser: USERS.MANAGER
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
    });

    it('Update status for a dataset as MANAGER that owns the dataset should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 'pending',
                application: ['gfw', 'rw'],
                loggedUser: USERS.MANAGER
            });

        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`User does not have permission to update status on dataset with id ${fakeDataset._id}`);
    });

    it('Update status for a dataset as non-admin with invalid status (string) should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 'fail',
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Invalid status 'fail' for update to dataset with id ${fakeDataset._id}`);
    });

    it('Update status for a dataset as non-admin with invalid status (int) should fail', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 78,
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
            });

        response.status.should.equal(400);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.equal(`Invalid status '78' for update to dataset with id ${fakeDataset._id}`);
    });

    it('Update status for a dataset as admin with valid status (string) should succeed', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 'pending',
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('status').and.equal('pending');
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
    });

    it('Update status for a dataset as admin with valid status (int) should succeed', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                status: 2,
                application: ['gfw', 'rw'],
                loggedUser: USERS.ADMIN
            });
        const dataset = deserializeDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        dataset.should.have.property('status').and.equal('failed');
        dataset.legend.should.be.an.instanceOf(Object);
        dataset.clonedHost.should.be.an.instanceOf(Object);
        dataset.should.have.property('createdAt').and.equal(fakeDataset.createdAt.toISOString());
    });

    it('Update a dataset as ADMIN with empty connectorUrl and list of sources should succeed', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb')).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                connectorUrl: null,
                sources: ['http://url.com/file1.json', 'http://url.com/file2.json'],
                loggedUser: USERS.ADMIN
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

    it('Update the applications of a dataset as an app ADMIN with associated app should succeed', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            application: ['rw', 'gfw']
        })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({ application: ['gfw'], loggedUser: USERS.ADMIN });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        const dataset = deserializeDataset(response);
        dataset.should.have.property('status').and.equal('saved');
        dataset.should.have.property('application').and.eql(['gfw']);
    });

    it('Update the error message of a dataset as an ADMIN should succeed but not change the message', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            errorMessage: 'Old error message'
        })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                name: 'Updated dataset name',
                errorMessage: 'Updated error message',
                loggedUser: USERS.ADMIN
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        const dataset = deserializeDataset(response);

        dataset.should.have.property('name').and.equal('Updated dataset name');
        dataset.should.have.property('errorMessage').and.eql(fakeDataset.errorMessage);
    });

    it('Update the error message of a dataset as a MICROSERVICE should succeed and change the message', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            errorMessage: 'Old error message'
        })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                name: 'Updated dataset name',
                errorMessage: 'Updated error message',
                loggedUser: USERS.MICROSERVICE
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        const dataset = deserializeDataset(response);

        dataset.should.have.property('name').and.equal('Updated dataset name');
        dataset.should.have.property('errorMessage').and.eql('Updated error message');
    });

    it('Clear the error message of a dataset as a MICROSERVICE should succeed and clear the message', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            errorMessage: 'Old error message'
        })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                name: 'Updated dataset name',
                errorMessage: '',
                loggedUser: USERS.MICROSERVICE
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        const dataset = deserializeDataset(response);

        dataset.should.have.property('name').and.equal('Updated dataset name');
        dataset.should.have.property('errorMessage').and.eql('');
    });

    it('As the admin of a single application, removing the app he/she admins from the array of apps of the dataset should return 200 OK with the updated dataset', async () => {
        const fakeDataset = await new Dataset(createDataset('cartodb', {
            application: ['rw', 'prep', 'sdg4data', 'ng', 'aqueduct', 'gfw']
        })).save();

        const response = await requester
            .patch(`/api/v1/dataset/${fakeDataset._id}`)
            .send({
                application: ['prep', 'sdg4data', 'ng', 'aqueduct', 'gfw'],
                loggedUser: USERS.RW_ADMIN,
            });

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('object');
        const dataset = deserializeDataset(response);
        dataset.should.have.property('status').and.equal('saved');
        dataset.should.have.property('application').and.eql(['prep', 'sdg4data', 'ng', 'aqueduct', 'gfw']);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
