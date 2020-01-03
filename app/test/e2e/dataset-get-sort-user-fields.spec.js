const nock = require('nock');
const Dataset = require('models/dataset.model');
const chai = require('chai');
const { getTestServer } = require('./test-server');
const { createDataset } = require('./utils');
const { createMockUser } = require('./mocks');
const {
    USERS: {
        USER, MANAGER, ADMIN, SUPERADMIN
    }
} = require('./test.constants');

chai.should();

nock.disableNetConnect();
nock.enableNetConnect(process.env.HOST_IP);

let requester;

const mockUsersForSort = (users) => {
    // Add _id property to provided users (some stuff uses _id, some uses id :shrug:)
    const allUsers = users.map(u => ({ ...u, _id: u.id }));

    // Mock all users request (for sorting by user role)
    createMockUser(allUsers);
    createMockUser(allUsers);
};

const mockFourDatasetsForSorting = async () => {
    await new Dataset(createDataset('cartodb', { userId: USER.id })).save();
    await new Dataset(createDataset('cartodb', { userId: MANAGER.id })).save();
    await new Dataset(createDataset('cartodb', { userId: ADMIN.id })).save();
    await new Dataset(createDataset('cartodb', { userId: SUPERADMIN.id })).save();

    mockUsersForSort([
        USER, MANAGER, ADMIN, SUPERADMIN
    ]);
};

describe('GET datasets sorted by user fields', () => {
    before(async () => {
        if (process.env.NODE_ENV !== 'test') {
            throw Error(`Running the test suite with NODE_ENV ${process.env.NODE_ENV} may result in permanent data loss. Please use NODE_ENV=test.`);
        }

        requester = await getTestServer();
    });

    it('Getting datasets sorted by user.role ASC without authentication should return 403 Forbidden', async () => {
        const response = await requester.get('/api/v1/dataset').query({ sort: 'user.role' });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC with user with role USER should return 403 Forbidden', async () => {
        const response = await requester.get('/api/v1/dataset').query({ sort: 'user.role', loggedUser: JSON.stringify(USER) });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC with user with role MANAGER should return 403 Forbidden', async () => {
        const response = await requester.get('/api/v1/dataset').query({ sort: 'user.role', loggedUser: JSON.stringify(MANAGER) });
        response.status.should.equal(403);
        response.body.should.have.property('errors').and.be.an('array');
        response.body.errors[0].should.have.property('detail').and.be.equal('Sorting by user name or role not authorized.');
    });

    it('Getting datasets sorted by user.role ASC should return a list of datasets ordered by the role of the user who created the dataset (happy case)', async () => {
        await mockFourDatasetsForSorting();
        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: 'user.role',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(4);
        response.body.data.map(dataset => dataset.attributes.user.role).should.be.deep.equal(['ADMIN', 'MANAGER', 'SUPERADMIN', 'USER']);
    });

    it('Getting datasets sorted by user.role DESC should return a list of datasets ordered by the role of the user who created the dataset (happy case)', async () => {
        await mockFourDatasetsForSorting();
        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: '-user.role',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(4);
        response.body.data.map(dataset => dataset.attributes.user.role).should.be.deep.equal(['USER', 'SUPERADMIN', 'MANAGER', 'ADMIN']);
    });

    it('Getting datasets sorted by user.name ASC should return a list of datasets ordered by the name of the user who created the dataset (happy case)', async () => {
        await mockFourDatasetsForSorting();
        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: 'user.name',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(4);
        response.body.data.map(dataset => dataset.attributes.user.name).should.be.deep.equal(['test admin', 'test manager', 'test super admin', 'test user']);
    });

    it('Getting datasets sorted by user.name DESC should return a list of datasets ordered by the name of the user who created the dataset (happy case)', async () => {
        await mockFourDatasetsForSorting();
        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: '-user.name',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(4);
        response.body.data.map(dataset => dataset.attributes.user.name).should.be.deep.equal(['test user', 'test super admin', 'test manager', 'test admin']);
    });

    it('Sorting datasets by user role ASC puts datasets without valid users in the beginning of the list', async () => {
        await new Dataset(createDataset('cartodb', { userId: USER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: MANAGER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: SUPERADMIN.id })).save();
        const noUserDataset = await new Dataset(createDataset('cartodb', { userId: 'legacy' })).save();

        mockUsersForSort([
            USER, MANAGER, ADMIN, SUPERADMIN
        ]);

        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: 'user.role',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);

        const returnedNoUserDataset = response.body.data.find(dataset => dataset.id === noUserDataset._id);
        response.body.data.indexOf(returnedNoUserDataset).should.be.equal(0);
    });

    it('Sorting datasets by user role DESC puts datasets without valid users in the end of the list', async () => {
        await new Dataset(createDataset('cartodb', { userId: USER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: MANAGER.id })).save();
        await new Dataset(createDataset('cartodb', { userId: ADMIN.id })).save();
        await new Dataset(createDataset('cartodb', { userId: SUPERADMIN.id })).save();
        const noUserDataset = await new Dataset(createDataset('cartodb', { userId: 'legacy' })).save();

        mockUsersForSort([
            USER, MANAGER, ADMIN, SUPERADMIN
        ]);

        const response = await requester.get('/api/v1/dataset').query({
            includes: 'user',
            sort: '-user.role',
            loggedUser: JSON.stringify(ADMIN),
        });
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.an('array').and.length(5);

        const returnedNoUserDataset = response.body.data.find(dataset => dataset.id === noUserDataset._id);
        response.body.data.indexOf(returnedNoUserDataset).should.be.equal(4);
    });

    afterEach(async () => {
        await Dataset.deleteMany({}).exec();

        if (!nock.isDone()) {
            throw new Error(`Not all nock interceptors were used: ${nock.pendingMocks()}`);
        }
    });
});
