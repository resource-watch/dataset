const nock = require('nock');
const chai = require('chai');
const Dataset = require('models/dataset.model');
const { USERS } = require('./utils/test.constants');
const {
    createDataset, mockGetUserFromToken
} = require('./utils/helpers');

chai.should();

const { getTestServer } = require('./utils/test-server');

let requester;

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

const prepareNockForDelete = (fakeDataset) => {
    nock(process.env.GATEWAY_URL)
        .get(`/v1/dataset/${fakeDataset._id}/layer`)
        .query({
            protected: true
        })
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .get(`/v1/dataset/${fakeDataset._id}/widget`)
        .query({
            protected: true
        })
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary/knowledge_graph`)
        .query({
            application: "rw"
        })
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/layer`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/widget`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/metadata`)
        .reply(200, {
            status: 200,
            data: []
        });

    nock(process.env.GATEWAY_URL)
        .delete(`/v1/dataset/${fakeDataset._id}/vocabulary`)
        .reply(200, {
            status: 200,
            data: []
        });
}

describe('Dataset delete tests', () => {

    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();

        await Dataset.deleteMany({}).exec();
    });

    describe('Delete by user', () => {
        it('Deleting all dataset of an user while not logged should return a 401 error', async () => {
            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();


            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .send();

            deleteResponse.status.should.equal(401);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Unauthorized`);
        });

        it('Deleting all dataset of an user as not that same user or an admin should return a 403 error', async () => {
            mockGetUserFromToken(USERS.MANAGER);

            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();


            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(403);
            deleteResponse.body.should.have.property('errors').and.be.an('array');
            deleteResponse.body.errors[0].should.have.property('detail').and.equal(`Forbidden`);
        });

        it('Deleting a dataset owned by the user as an ADMIN should return all deleted datasets', async () => {
            mockGetUserFromToken(USERS.ADMIN);

            nock(process.env.GATEWAY_URL)
                .get(`/auth/user/${USERS.USER.id}`)
                .reply(200, {
                    data: {
                        ...USERS.USER,
                    }
                });

            const fakeDatasetFromManager = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
            const fakeDatasetFromAdmin = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

            const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetTwo = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetThree = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            prepareNockForDelete(fakeDatasetOne)
            prepareNockForDelete(fakeDatasetTwo)
            prepareNockForDelete(fakeDatasetThree)

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(200);
            deleteResponse.body.deletedDatasets.should.be.an('array').and.with.lengthOf(3);
            deleteResponse.body.protectedDatasets.should.be.an('array').and.with.lengthOf(0);

            const datasets = deleteResponse.body.deletedDatasets;
            let datasetIds = datasets.map((dataset) => dataset.id);
            datasetIds.should.contain(fakeDatasetOne._id);
            datasetIds.should.contain(fakeDatasetTwo._id);
            datasetIds.should.contain(fakeDatasetThree._id);

            const findDatasetByUser = await Dataset.find({ userId: { $eq: USERS.USER.id } }).exec();
            findDatasetByUser.should.be.an('array').with.lengthOf(0);

            const findAllDatasets = await Dataset.find({}).exec();
            findAllDatasets.should.be.an('array').with.lengthOf(2);

            datasetIds = findAllDatasets.map((dataset) => dataset._id);
            datasetIds.should.contain(fakeDatasetFromManager._id);
            datasetIds.should.contain(fakeDatasetFromAdmin._id);
        });

        it.only('Deleting a dataset owned by the user as a MICROSERVICE should return all deleted datasets', async () => {
            mockGetUserFromToken(USERS.MICROSERVICE);

            nock(process.env.GATEWAY_URL)
                .get(`/auth/user/${USERS.USER.id}`)
                .reply(200, {
                    data: {
                        ...USERS.USER,
                    }
                });

            const fakeDatasetFromManager = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
            const fakeDatasetFromAdmin = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

            const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetTwo = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetThree = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            prepareNockForDelete(fakeDatasetOne)
            prepareNockForDelete(fakeDatasetTwo)
            prepareNockForDelete(fakeDatasetThree)

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(200);
            deleteResponse.body.deletedDatasets.should.be.an('array').and.with.lengthOf(3);
            deleteResponse.body.protectedDatasets.should.be.an('array').and.with.lengthOf(0);

            const datasets = deleteResponse.body.deletedDatasets;
            let datasetIds = datasets.map((dataset) => dataset.id);
            datasetIds.should.contain(fakeDatasetOne._id);
            datasetIds.should.contain(fakeDatasetTwo._id);
            datasetIds.should.contain(fakeDatasetThree._id);

            const findDatasetByUser = await Dataset.find({ userId: { $eq: USERS.USER.id } }).exec();
            findDatasetByUser.should.be.an('array').with.lengthOf(0);

            const findAllDatasets = await Dataset.find({}).exec();
            findAllDatasets.should.be.an('array').with.lengthOf(2);

            datasetIds = findAllDatasets.map((dataset) => dataset._id);
            datasetIds.should.contain(fakeDatasetFromManager._id);
            datasetIds.should.contain(fakeDatasetFromAdmin._id);
        });

        it('Deleting a dataset owned by the same logged user should return all deleted datasets', async () => {
            mockGetUserFromToken(USERS.USER);

            const fakeDatasetFromManager = await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
            const fakeDatasetFromAdmin = await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();

            const fakeDatasetOne = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetTwo = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            const fakeDatasetThree = await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
            prepareNockForDelete(fakeDatasetOne)
            prepareNockForDelete(fakeDatasetTwo)
            prepareNockForDelete(fakeDatasetThree)


            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(200);
            deleteResponse.body.deletedDatasets.should.be.an('array').and.with.lengthOf(3);
            deleteResponse.body.protectedDatasets.should.be.an('array').and.with.lengthOf(0);

            const datasets = deleteResponse.body.deletedDatasets;
            let datasetIds = datasets.map((dataset) => dataset.id);
            datasetIds.should.contain(fakeDatasetOne._id);
            datasetIds.should.contain(fakeDatasetTwo._id);
            datasetIds.should.contain(fakeDatasetThree._id);

            const findDatasetByUser = await Dataset.find({ userId: { $eq: USERS.USER.id } }).exec();
            findDatasetByUser.should.be.an('array').with.lengthOf(0);

            const findAllDatasets = await Dataset.find({}).exec();
            findAllDatasets.should.be.an('array').with.lengthOf(2);

            datasetIds = findAllDatasets.map((dataset) => dataset._id);
            datasetIds.should.contain(fakeDatasetFromManager._id);
            datasetIds.should.contain(fakeDatasetFromAdmin._id);
        });

        it('Deleting datasets while some of them are protected should only delete unprotected ones', async () => {
            mockGetUserFromToken(USERS.USER);

            await Promise.all([...Array(100)].map(async () => {
                const datasetToDelete = await new Dataset(createDataset('cartodb', {
                    userId: USERS.USER.id,
                    protected: false
                })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.USER.id, protected: true })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id, protected: false })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id, protected: true })).save();

                prepareNockForDelete(datasetToDelete)
            }));

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(200);
            deleteResponse.body.deletedDatasets.should.be.an('array').and.with.lengthOf(100);
            deleteResponse.body.protectedDatasets.should.be.an('array').and.with.lengthOf(100);

            const deletedDatasets = deleteResponse.body.deletedDatasets;
            deletedDatasets.should.have.lengthOf(100)
            deletedDatasets.forEach((dataset) => {
                dataset.attributes.protected.should.equal(false)
                dataset.attributes.userId.should.equal(USERS.USER.id)
            });

            const protectedDatasets = deleteResponse.body.protectedDatasets;
            protectedDatasets.should.have.lengthOf(100)
            protectedDatasets.forEach((dataset) => {
                dataset.attributes.protected.should.equal(true)
                dataset.attributes.userId.should.equal(USERS.USER.id)
            });

            const findDatasetByUser = await Dataset.find({ userId: { $eq: USERS.USER.id } }).exec();
            findDatasetByUser.should.be.an('array').with.lengthOf(100);
            findDatasetByUser.forEach((dataset) => {
                dataset.protected.should.equal(true)
                dataset.userId.should.equal(USERS.USER.id)
            });

            const findAllDatasets = await Dataset.find({}).exec();
            findAllDatasets.should.be.an('array').with.lengthOf(300);
        });

        it('Deleting datasets for a user should delete datasets even if the user is not associated with all of the dataset\'s applications', async () => {
            mockGetUserFromToken(USERS.USER);

            await Promise.all([...Array(2)].map(async () => {
                const datasetToDelete = await new Dataset(createDataset('cartodb', {
                    userId: USERS.USER.id,
                    protected: false,
                    application: ['rw', 'notauserapp']
                })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.USER.id, protected: true })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id, protected: false })).save();
                await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id, protected: true })).save();

                prepareNockForDelete(datasetToDelete)
            }));

            const deleteResponse = await requester
                .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
                .set('Authorization', `Bearer abcd`)
                .send();

            deleteResponse.status.should.equal(200);
            deleteResponse.body.deletedDatasets.should.be.an('array').and.with.lengthOf(2);
            deleteResponse.body.protectedDatasets.should.be.an('array').and.with.lengthOf(2);

            const deletedDatasets = deleteResponse.body.deletedDatasets;
            deletedDatasets.should.have.lengthOf(2)
            deletedDatasets.forEach((dataset) => {
                dataset.attributes.protected.should.equal(false)
                dataset.attributes.userId.should.equal(USERS.USER.id)
            });

            const protectedDatasets = deleteResponse.body.protectedDatasets;
            protectedDatasets.should.have.lengthOf(2)
            protectedDatasets.forEach((dataset) => {
                dataset.attributes.protected.should.equal(true)
                dataset.attributes.userId.should.equal(USERS.USER.id)
            });

            const findDatasetByUser = await Dataset.find({ userId: { $eq: USERS.USER.id } }).exec();
            findDatasetByUser.should.be.an('array').with.lengthOf(2);
            findDatasetByUser.forEach((dataset) => {
                dataset.protected.should.equal(true)
                dataset.userId.should.equal(USERS.USER.id)
            });

            const findAllDatasets = await Dataset.find({}).exec();
            findAllDatasets.should.be.an('array').with.lengthOf(6);
        });
    })

    it.only('Deleting all datasets of an user while being authenticated as USER should return a 200 and all datasets deleted - no datasets in the db', async () => {
        mockGetUserFromToken(USERS.MICROSERVICE);

        const response = await requester
            .delete(`/api/v1/dataset/by-user/${USERS.USER.id}`)
            .set('Authorization', 'Bearer abcd')
            .send();
        console.log(response.body);
        response.status.should.equal(200);
        response.body.deletedDatasets.should.be.an('array').with.lengthOf(0);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
