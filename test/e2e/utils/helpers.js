const { CONNECTOR_TYPES } = require('app.constants');
const nock = require('nock');

function isArray(element) {
    if (element instanceof Array) {
        return true;
    }
    return false;
}

function isObject(property) {
    if (property instanceof Object && property.length === undefined) {
        return true;
    }
    return false;
}

const deserializeDataset = (response) => {
    if (isArray(response.body.data)) {
        return response.body.data;
    }
    if (isObject(response.body.data)) {
        return response.body.data.attributes;
    }
    return response;
};

const expectedDataset = (dataset) => ({
    id: dataset.id,
    type: 'dataset',
    attributes:
        {
            name: dataset.name,
            slug: dataset.slug,
            type: null,
            subtitle: dataset.subtitle,
            application: ['rw'],
            applicationConfig: dataset.applicationConfig,
            dataPath: dataset.dataPath,
            attributesPath: dataset.attributesPath,
            connectorType: 'rest',
            provider: 'cartodb',
            userId: dataset.userId,
            connectorUrl: dataset.connectorUrl,
            sources: [],
            tableName: dataset.tableName,
            status: 'saved',
            published: true,
            overwrite: true,
            mainDateField: null,
            env: 'production',
            geoInfo: false,
            protected: false,
            legend:
                {
                    date: [],
                    region: [],
                    country: [],
                    nested: [],
                    integer: [],
                    short: [],
                    byte: [],
                    double: [],
                    float: [],
                    half_float: [],
                    scaled_float: [],
                    boolean: [],
                    binary: [],
                    text: [],
                    keyword: []
                },
            clonedHost: {},
            errorMessage: null,
            taskId: null,
            createdAt: dataset.createdAt.toISOString(),
            updatedAt: dataset.updatedAt.toISOString(),
            dataLastUpdated: dataset.dataLastUpdated.toISOString(),
            widgetRelevantProps: [],
            layerRelevantProps: []
        }
});

const getUUID = () => Math.random().toString(36).substring(7);

const ensureCorrectError = (body, errMessage) => {
    body.should.have.property('errors').and.be.an('array');
    body.errors[0].should.have.property('detail').and.equal(errMessage);
};

const createDataset = (provider, anotherData = {}) => {
    let connectorType = '';

    // CONNECTOR_TYPES.{keys, values, entries};
    Object.keys(CONNECTOR_TYPES).forEach((tempConnectorType) => {
        if (CONNECTOR_TYPES[tempConnectorType].provider.includes(provider)) {
            connectorType = tempConnectorType;
        }
    });

    if (connectorType === '') {
        throw Error(`Attempted to create dataset with invalid provider type: ${provider}`);
    }

    const uuid = getUUID();

    return {
        name: `Fake dataset ${uuid}`,
        slug: `fake-carto-${uuid}`,
        type: null,
        subtitle: `Fake dataset ${uuid} subtitle`,
        dataPath: `Fake dataset ${uuid} data path`,
        application: 'rw',
        applicationConfig: {
            rw: {
                foo: 'bar',
            }
        },
        attributesPath: `Fake dataset ${uuid} attributes path`,
        connectorType,
        dataLastUpdated: (new Date().toISOString()),
        sourceApplication: `Fake dataset ${uuid} source application`,
        sourceLanguage: 'en',
        provider,
        userId: getUUID(),
        env: 'production',
        geoInfo: false,
        connectorUrl: `Fake dataset ${uuid} connector URL`,
        tableName: `Fake dataset ${uuid} table name`,
        overwrite: true,
        status: 'saved',
        sandbox: true,
        published: true,
        ...anotherData
    };
};

const mapDatasetToMetadataSearchResult = (dataset) => ({
    id: getUUID(),
    type: 'metadata',
    attributes: {
        dataset: dataset._id,
        application: dataset.application[0],
        resource: {},
        language: 'en',
        name: dataset.name,
        description: dataset.description,
        license: 'Other',
        info: {
            foo: 'bar'
        },
        createdAt: '2018-07-17T16:32:45.315Z',
        updatedAt: '2018-07-17T16:32:45.315Z',
        status: 'published'
    }
});

const mockGetUserFromToken = (userProfile) => {
    nock(process.env.CT_URL, { reqheaders: { authorization: 'Bearer abcd' } })
        .get('/auth/user/me')
        .reply(200, userProfile);
};

module.exports = {
    createDataset,
    deserializeDataset,
    expectedDataset,
    ensureCorrectError,
    mapDatasetToMetadataSearchResult,
    getUUID,
    mockGetUserFromToken
};
