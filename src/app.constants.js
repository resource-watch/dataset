const USER_ROLES = ['USER', 'MANAGER', 'ADMIN', 'SUPERADMIN'];
const STATUS = ['pending', 'saved', 'failed'];
const INCLUDES = ['widget', 'layer', 'vocabulary', 'metadata', 'user', 'graph'];
const CONNECTOR_TYPES = {
    rest: {
        provider: ['cartodb', 'featureservice', 'gee', 'bigquery', 'rasdaman', 'nexgddp', 'loca']
    },
    document: {
        provider: ['csv', 'json', 'tsv', 'xml']
    },
    wms: {
        provider: ['wms']
    }
};
const RASDAMAN_TYPES = ['tif', 'tiff', 'geo.tiff'];

module.exports = {
    USER_ROLES,
    STATUS,
    INCLUDES,
    CONNECTOR_TYPES,
    RASDAMAN_TYPES,
};
