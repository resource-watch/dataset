const { USERS } = require('../utils/test.constants');

const datasetGetIncludeUserAdmin = (dataset) => ({
    id: dataset.id,
    type: 'dataset',
    attributes: {
        name: dataset.name,
        slug: dataset.slug,
        type: null,
        subtitle: dataset.subtitle,
        application: [
            'rw'
        ],
        applicationConfig: dataset.applicationConfig,
        dataPath: dataset.dataPath,
        attributesPath: dataset.attributesPath,
        connectorType: 'rest',
        provider: 'cartodb',
        userId: '1a10d7c6e0a37126611fd7a7',
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
        legend: {
            binary: [],
            boolean: [],
            byte: [],
            country: [],
            date: [],
            double: [],
            float: [],
            half_float: [],
            integer: [],
            keyword: [],
            nested: [],
            region: [],
            scaled_float: [],
            short: [],
            text: []
        },
        clonedHost: {},
        errorMessage: null,
        taskId: null,
        createdAt: dataset.createdAt.toISOString(),
        updatedAt: dataset.updatedAt.toISOString(),
        dataLastUpdated: dataset.dataLastUpdated.toISOString(),
        user: {
            name: USERS.ADMIN.name,
            email: USERS.ADMIN.email,
            role: USERS.ADMIN.role
        },
        widgetRelevantProps: [],
        layerRelevantProps: []
    }
});

module.exports = datasetGetIncludeUserAdmin;
