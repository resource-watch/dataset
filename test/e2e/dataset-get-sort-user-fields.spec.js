const nock = require('nock');
const Dataset = require('models/dataset.model');
const chai = require('chai');
const mongoose = require('mongoose');
const { getTestServer } = require('./utils/test-server');
const { createDataset, mockGetUserFromToken } = require('./utils/helpers');
const { createMockUser } = require('./utils/mocks');
const { USERS } = require('./utils/test.constants');

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

let requester;

const mockUsersForSort = (users) => {
    // Add _id property to provided users (some stuff uses _id, some uses id :shrug:)
    const allUsers = users.map((u) => ({ ...u, _id: u.id }));

    // Mock all users request (for sorting by user role)
    createMockUser(allUsers);
    createMockUser(allUsers);
};

const mockDatasetsForSorting = async () => {
    const id = mongoose.Types.ObjectId();
    await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
    await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
    await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
    await new Dataset(createDataset('cartodb', { userId: USERS.SUPERADMIN.id })).save();
    await new Dataset(createDataset('cartodb', { userId: id })).save();

    mockUsersForSort([
        USERS.USER, USERS.MANAGER, USERS.ADMIN, USERS.SUPERADMIN, { id }
    ]);
};

describe('Get datasets sorted by user fields', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Getting datasets sorted by user.role ASC without authentication should return 403 Forbidden', async () => {
        const response = await requester
            .get('/api/v1/dataset')
            .query({ sort: 'user.role' });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC with user with role USER should return 403 Forbidden', async () => {
        mockGetUserFromToken(USERS.USER);

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                sort: 'user.role',
            });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC with user with role MANAGER should return 403 Forbidden', async () => {
        mockGetUserFromToken(USERS.MANAGER);

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                sort: 'user.role',
            });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC should return a list of datasets ordered by the role of the user who created the dataset (happy case)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await mockDatasetsForSorting();
        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: 'user.role',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);
        response.body.data.map((dataset) => dataset.attributes.user.role).should.be.deep.equal(['ADMIN', 'MANAGER', 'SUPERADMIN', 'USER', undefined]);
    });

    it('Getting datasets sorted by user.role DESC should return a list of datasets ordered by the role of the user who created the dataset (happy case)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await mockDatasetsForSorting();
        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: '-user.role',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);
        response.body.data.map((dataset) => dataset.attributes.user.role).should.be.deep.equal([undefined, 'USER', 'SUPERADMIN', 'MANAGER', 'ADMIN']);
    });

    it('Getting datasets sorted by user.name ASC should return a list of datasets ordered by the name of the user who created the dataset (happy case)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await mockDatasetsForSorting();
        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: 'user.name',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);
        response.body.data.map((dataset) => dataset.attributes.user.name).should.be.deep.equal(['test admin', 'test manager', 'test super admin', 'test user', undefined]);
    });

    it('Getting datasets sorted by user.name DESC should return a list of datasets ordered by the name of the user who created the dataset (happy case)', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await mockDatasetsForSorting();
        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: '-user.name',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);
        response.body.data.map((dataset) => dataset.attributes.user.name).should.be.deep.equal([undefined, 'test user', 'test super admin', 'test manager', 'test admin']);
    });

    it('Sorting datasets by user role ASC puts datasets without valid users in the end of the list', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.SUPERADMIN.id })).save();
        const noUserDataset1 = await new Dataset(createDataset('cartodb', { userId: 'legacy' })).save();
        const noUserDataset2 = await new Dataset(createDataset('cartodb', { userId: '5accc3660bb7c603ba473d0f' })).save();

        // Mock requests for includes=user
        const fullUsers = [USERS.USER, USERS.MANAGER, USERS.ADMIN, USERS.SUPERADMIN].map((u) => ({ ...u, _id: u.id }));

        // Custom mock find-by-ids call
        const userIds = [USERS.USER.id, USERS.MANAGER.id, USERS.ADMIN.id, USERS.SUPERADMIN.id, 'legacy', '5accc3660bb7c603ba473d0f'];
        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: userIds })
            .reply(200, { data: fullUsers });

        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids?sort=user.role', (body) => body.ids.length === userIds.length)
            .reply(200, { data: fullUsers });

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: 'user.role',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(6);

        const returnedNoUserDataset1 = response.body.data.find((dataset) => dataset.id === noUserDataset1._id);
        const returnedNoUserDataset2 = response.body.data.find((dataset) => dataset.id === noUserDataset2._id);

        // Grab the last two layers of the returned data
        const len = response.body.data.length;
        const lastTwoDatasets = response.body.data.slice(len - 2, len);
        lastTwoDatasets.includes(returnedNoUserDataset1).should.be.equal(true);
        lastTwoDatasets.includes(returnedNoUserDataset2).should.be.equal(true);
    });

    it('Sorting datasets by user role DESC puts datasets without valid users in the beginning of the list', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        await new Dataset(createDataset('cartodb', { userId: USERS.USER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.MANAGER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: USERS.SUPERADMIN.id })).save();
        const noUserDataset1 = await new Dataset(createDataset('cartodb', { userId: 'legacy' })).save();
        const noUserDataset2 = await new Dataset(createDataset('cartodb', { userId: '5accc3660bb7c603ba473d0f' })).save();

        // Mock requests for includes=user
        const fullUsers = [USERS.USER, USERS.MANAGER, USERS.ADMIN, USERS.SUPERADMIN].map((u) => ({ ...u, _id: u.id }));

        // Custom mock find-by-ids call
        const userIds = [USERS.USER.id, USERS.MANAGER.id, USERS.ADMIN.id, USERS.SUPERADMIN.id, 'legacy', '5accc3660bb7c603ba473d0f'];
        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids', { ids: userIds })
            .reply(200, { data: fullUsers });

        nock(process.env.CT_URL)
            .post('/auth/user/find-by-ids?sort=-user.role', (body) => body.ids.length === userIds.length)
            .reply(200, { data: fullUsers });

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: '-user.role',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(6);

        const returnedNoUserDataset1 = response.body.data.find((dataset) => dataset.id === noUserDataset1._id);
        const returnedNoUserDataset2 = response.body.data.find((dataset) => dataset.id === noUserDataset2._id);

        // Grab the last two layers of the returned data
        const firstTwoDatasets = response.body.data.slice(0, 2);
        firstTwoDatasets.includes(returnedNoUserDataset1).should.be.equal(true);
        firstTwoDatasets.includes(returnedNoUserDataset2).should.be.equal(true);
    });

    it('Sorting datasets by user.name is case insensitive and returns a list of datasets ordered by the name of the user who created the dataset', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const firstUser = { ...USERS.USER, name: 'Anthony' };
        const secondUser = { ...USERS.MANAGER, name: 'bernard' };
        const thirdUser = { ...USERS.ADMIN, name: 'Carlos' };
        await new Dataset(createDataset('cartodb', { userId: firstUser.id })).save();
        await new Dataset(createDataset('cartodb', { userId: secondUser.id })).save();
        await new Dataset(createDataset('cartodb', { userId: thirdUser.id })).save();
        mockUsersForSort([firstUser, secondUser, thirdUser]);

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: 'user.name',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(3);
        response.body.data.map((dataset) => dataset.attributes.user.name).should.be.deep.equal(['Anthony', 'bernard', 'Carlos']);
    });

    it('Sorting datasets by user.name is deterministic, applying an implicit sort by id after sorting by user.name', async () => {
        mockGetUserFromToken(USERS.ADMIN);

        const spoofedUser = { ...USERS.USER, name: 'AAA' };
        const spoofedManager = { ...USERS.MANAGER, name: 'AAA' };
        const spoofedAdmin = { ...USERS.ADMIN, name: 'AAA' };
        await new Dataset(createDataset('cartodb', { _id: '2', userId: spoofedManager.id })).save();
        await new Dataset(createDataset('cartodb', { _id: '3', userId: spoofedUser.id })).save();
        await new Dataset(createDataset('cartodb', { _id: '1', userId: spoofedAdmin.id })).save();
        mockUsersForSort([spoofedUser, spoofedManager, spoofedAdmin]);

        const response = await requester
            .get('/api/v1/dataset')
            .set('Authorization', `Bearer abcd`)
            .query({
                includes: 'user',
                sort: 'user.name',
            });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(3);
        response.body.data.map((dataset) => dataset.id).should.be.deep.equal(['1', '2', '3']);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
