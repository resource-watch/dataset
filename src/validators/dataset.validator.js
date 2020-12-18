const { default: logger } = require('logger');
const DatasetNotValid = require('errors/datasetNotValid.error');
const { CONNECTOR_TYPES } = require('app.constants');
const { RASDAMAN_TYPES } = require('app.constants');
const { URL } = require('url');
const cronParser = require('cron-parser');


class DatasetValidator {

    static getUser(ctx) {
        return { ...(ctx.request.query.loggedUser ? JSON.parse(ctx.request.query.loggedUser) : {}), ...ctx.request.body.loggedUser };
    }

    static isString(property) {
        if (typeof property === 'string' && property.length >= 0) {
            return true;
        }
        return false;
    }

    static notEmptyString(property) {
        if (typeof property === 'string' && property.length > 0) {
            return true;
        }
        return false;
    }

    static validUrl(property) {
        try {
            if (typeof property === 'string' && new URL(property)) {
                return true;
            }
        } catch (err) {
            return false;
        }
        return false;
    }

    static isArray(property) {
        if (property instanceof Array) {
            return true;
        }
        return false;
    }

    static isISOString(property) {
        if (typeof property === 'string' && property.length > 0) {
            const date = new Date(property);
            return !Number.isNaN(date.getTime());
        }
        return false;
    }

    static notEmptyArray(property) {
        if (property instanceof Array && property.length > 0) {
            return true;
        }
        return false;
    }

    static isObject(property) {
        if (property instanceof Object && property.length === undefined) {
            return true;
        }
        return false;
    }

    static checkConnectorType(connectorType) {
        if (Object.keys(CONNECTOR_TYPES).indexOf(connectorType) >= 0) {
            return true;
        }
        return false;
    }

    static checkProvider(provider, koaObj = {}) {
        if (Object.keys(CONNECTOR_TYPES).indexOf(koaObj.request.body.connectorType) >= 0 && CONNECTOR_TYPES[koaObj.request.body.connectorType].provider.indexOf(provider) >= 0) {
            return true;
        }
        return false;
    }

    static checkConnectorUrl(connectorUrl, koaObj) {
        let validation = false;
        const {
            connectorType, provider, data, tableName, sources
        } = koaObj.request.body;

        // it is a document - json?
        if (connectorType === 'document') {
            // is it data valid?
            if (provider === 'json' && (DatasetValidator.isArray(data) || DatasetValidator.isObject(data))) {
                validation = true;
                // if data is not provided, check if url is valid
            } else if (connectorUrl && (DatasetValidator.validUrl(connectorUrl) || connectorUrl.indexOf('rw.dataset.raw') >= 0)) {
                validation = true;
            } else if (!connectorUrl && sources) {
                validation = true;
            } else {
                validation = false;
            }
            // is it a gee or bigquery dataset?
        } else if (connectorType === 'rest' && (provider === 'gee' || provider === 'bigquery' || provider === 'nexgddp' || provider === 'loca')) {
            // is it tableName valid?
            if (DatasetValidator.notEmptyString(tableName)) {
                validation = true;
                // if tableName not provided
            } else {
                validation = false;
            }
            // in other cases just validate url
        } else {
            validation = (connectorUrl && (DatasetValidator.validUrl(connectorUrl) || connectorUrl.indexOf('rw.dataset.raw') >= 0))
                || (!connectorUrl && sources && sources.length > 0);
        }
        return validation;
    }

    static checkSources(sources, koaObj) {
        const {
            connectorType, connectorUrl, provider, data
        } = koaObj.request.body;

        if (connectorType !== 'document') {
            return true;
        }

        if (connectorUrl && !sources) {
            return true;
        }

        if (provider === 'json' && (DatasetValidator.isArray(data) || DatasetValidator.isObject(data))) {
            return true;
        }

        return DatasetValidator.isArray(sources);
    }

    static checkSubscribable(subscribable) {
        let validation = false;
        if (DatasetValidator.isObject(subscribable)) {
            const keys = Object.keys(subscribable);
            validation = keys.every((key) => {
                if (!subscribable[key].dataQuery || !subscribable[key].subscriptionQuery) {
                    return false;
                }
                return true;

            });
        }
        return validation;
    }

    static checkSync(sync) {
        if (DatasetValidator.isObject(sync)) {
            try {
                cronParser.parseExpression(sync.cronPattern);
                if (['concat', 'overwrite'].indexOf(sync.action) >= 0 && DatasetValidator.validUrl(sync.url)) {
                    return true;
                }
                return false;
            } catch (err) {
                return false;
            }
        }
        return false;
    }

    static errorMessage(property, koaObj = {}) {
        let errorMessage = 'validation error';

        switch (property) {

            case 'connectorType':
                errorMessage = `must be valid [${Object.keys(CONNECTOR_TYPES).reduce((acc, el) => `${acc}, ${el}`)}]`;
                break;
            case 'provider':
                if (CONNECTOR_TYPES[koaObj.request.body.connectorType]) {
                    errorMessage = `must be valid [${CONNECTOR_TYPES[koaObj.request.body.connectorType].provider.reduce((acc, el) => `${acc}, ${el}`)}]`;
                } else {
                    errorMessage = `there is no provider for that connectorType`;
                }
                break;
            case 'connectorUrl':
                errorMessage = `empty or invalid connectorUrl`;
                break;
            case 'subscribable':
                errorMessage = `invalid subscribable object`;
                break;
            default:
            // do nothing

        }
        return errorMessage;
    }

    static async validateCreation(koaObj) {
        logger.info('Validating Dataset Creation');
        koaObj.checkBody('name').notEmpty().check((name) => DatasetValidator.notEmptyString(name), 'can not be empty');
        koaObj.checkBody('type').optional().check((type) => DatasetValidator.isString(type), 'must be a string');
        koaObj.checkBody('subtitle').optional().check((subtitle) => DatasetValidator.isString(subtitle), 'must be a string');
        koaObj.checkBody('application').notEmpty().check((application) => DatasetValidator.notEmptyArray(application), 'must be a non-empty array');
        koaObj.checkBody('dataPath').optional().check((dataPath) => DatasetValidator.isString(dataPath), 'must be a string');
        koaObj.checkBody('attributesPath').optional().check((attributesPath) => DatasetValidator.isString(attributesPath), 'must be a string');
        koaObj.checkBody('mainDateField').optional().check((mainDateField) => mainDateField === null || DatasetValidator.isString(mainDateField), 'must be a string');
        // connectorType
        koaObj.checkBody('connectorType').notEmpty()
            .toLow()
            .check((connectorType) => DatasetValidator.checkConnectorType(connectorType), DatasetValidator.errorMessage('connectorType'));
        // provider
        koaObj.checkBody('provider').notEmpty()
            .toLow()
            .check((provider) => DatasetValidator.checkProvider(provider, koaObj), DatasetValidator.errorMessage('provider', koaObj));
        // connectorUrl

        if ([koaObj.checkBody('connectorUrl').exists, koaObj.checkBody('sources').exists, koaObj.checkBody('data').exists].filter((e) => e).length > 1) {
            koaObj.checkBody('connectorUrl').addError('Specify either `connectorUrl`, `sources` or `data`');
        }

        koaObj.checkBody('connectorUrl').check((connectorUrl) => DatasetValidator.checkConnectorUrl(connectorUrl, koaObj), DatasetValidator.errorMessage('connectorUrl'));
        koaObj.checkBody('sources').check((sources) => DatasetValidator.checkSources(sources, koaObj), DatasetValidator.errorMessage('sources'));
        koaObj.checkBody('tableName').optional().check((tableName) => DatasetValidator.isString(tableName), 'must be a string');
        koaObj.checkBody('published').optional().toBoolean();
        koaObj.checkBody('overwrite').optional().toBoolean();
        koaObj.checkBody('dataOverwrite').optional().toBoolean();
        koaObj.checkBody('data').optional().check((data) => {
            if (DatasetValidator.isArray(data) || DatasetValidator.isObject(data)) {
                return true;
            }
            return false;
        }, 'must be a valid JSON');
        koaObj.checkBody('subscribable').optional().check((subscribable) => DatasetValidator.checkSubscribable(subscribable), DatasetValidator.errorMessage('subscribable'));
        koaObj.checkBody('legend').optional().check((legend) => DatasetValidator.isObject(legend), 'must be an object');
        koaObj.checkBody('vocabularies').optional().check((vocabularies) => DatasetValidator.isObject(vocabularies), 'must be an object');
        koaObj.checkBody('applicationConfig')
            .optional()
            .check((applicationConfig) => DatasetValidator.isObject(applicationConfig), 'must be an object');
        koaObj.checkBody('sync').optional().check((sync) => DatasetValidator.checkSync(sync), 'not valid');
        koaObj.checkBody('widgetRelevantProps').optional().check((widgetRelevantProps) => DatasetValidator.isArray(widgetRelevantProps), 'must be an array');
        koaObj.checkBody('layerRelevantProps').optional().check((layerRelevantProps) => DatasetValidator.isArray(layerRelevantProps), 'must be an array');
        koaObj.checkBody('dataLastUpdated').optional().check((dataLastUpdated) => DatasetValidator.isISOString(dataLastUpdated), 'must be an date');
        if (koaObj.errors) {
            logger.info('Error validating dataset creation');
            throw new DatasetNotValid(koaObj.errors);
        }
        return true;
    }

    static async validateUpdate(koaObj) {
        logger.info('Validating Dataset Update');
        koaObj.checkBody('name').optional().check((name) => DatasetValidator.notEmptyString(name), 'can not be empty');
        koaObj.checkBody('type').optional().check((type) => DatasetValidator.isString(type), 'must be a string');
        koaObj.checkBody('subtitle').optional().check((subtitle) => DatasetValidator.isString(subtitle), 'must be a string');
        koaObj.checkBody('application').optional().check((application) => DatasetValidator.notEmptyArray(application), 'must be a non-empty array');
        koaObj.checkBody('dataPath').optional().check((dataPath) => DatasetValidator.isString(dataPath), 'must be a string');
        koaObj.checkBody('attributesPath').optional().check((attributesPath) => DatasetValidator.isString(attributesPath), 'must be a string');
        koaObj.checkBody('applicationConfig')
            .optional()
            .check((applicationConfig) => DatasetValidator.isObject(applicationConfig), 'must be an object');
        koaObj.checkBody('connectorType').optional().check((connectorType) => DatasetValidator.isString(connectorType), 'must be a string');
        koaObj.checkBody('provider').optional().check((provider) => DatasetValidator.isString(provider), 'must be a string');

        koaObj.checkBody('connectorUrl').optional().check((connectorUrl) => DatasetValidator.checkConnectorUrl(connectorUrl, koaObj), DatasetValidator.errorMessage('connectorUrl'));
        koaObj.checkBody('sources').optional().check((sources) => DatasetValidator.checkSources(sources, koaObj), DatasetValidator.errorMessage('sources'));

        koaObj.checkBody('tableName').optional().check((tableName) => DatasetValidator.isString(tableName), 'must be a string');
        koaObj.checkBody('published').optional().toBoolean();
        koaObj.checkBody('overwrite').optional().toBoolean();
        koaObj.checkBody('dataOverwrite').optional().toBoolean();
        koaObj.checkBody('errorMessage').optional().check((errorMessage) => DatasetValidator.isString(errorMessage), 'must be a string');
        koaObj.checkBody('taskId').optional().check((taskId) => DatasetValidator.isString(taskId), 'must be a string');
        koaObj.checkBody('mainDateField').optional().check((mainDateField) => DatasetValidator.isString(mainDateField), 'must be a string');
        koaObj.checkBody('data').optional().check((data) => {
            if (DatasetValidator.isArray(data) || DatasetValidator.isObject(data)) {
                return true;
            }
            return false;
        }, 'must be a valid JSON');
        koaObj.checkBody('subscribable').optional().check((subscribable) => DatasetValidator.checkSubscribable(subscribable), DatasetValidator.errorMessage('subscribable'));
        koaObj.checkBody('legend').optional().check((legend) => DatasetValidator.isObject(legend));
        koaObj.checkBody('vocabularies').optional().check((vocabularies) => DatasetValidator.isObject(vocabularies));
        koaObj.checkBody('sync').optional().check((sync) => DatasetValidator.checkSync(sync), 'not valid');
        koaObj.checkBody('widgetRelevantProps').optional().check((widgetRelevantProps) => DatasetValidator.isArray(widgetRelevantProps), 'must be an array');
        koaObj.checkBody('layerRelevantProps').optional().check((layerRelevantProps) => DatasetValidator.isArray(layerRelevantProps), 'must be an array');
        koaObj.checkBody('dataLastUpdated').optional().check((dataLastUpdated) => DatasetValidator.isISOString(dataLastUpdated), 'must be an date');
        if (koaObj.errors) {
            logger.info('Error validating dataset creation');
            throw new DatasetNotValid(koaObj.errors);
        }
        return true;
    }

    static async validateCloning(koaObj) {
        logger.info('Validating Dataset Cloning');
        koaObj.checkBody('application').notEmpty().check((application) => DatasetValidator.notEmptyArray(application), 'must be a non-empty array');
        koaObj.checkBody('datasetUrl').notEmpty().isAscii();
        koaObj.checkBody('applicationConfig')
            .optional()
            .check((applicationConfig) => DatasetValidator.isObject(applicationConfig), 'must be an object');
        if (koaObj.errors) {
            logger.info('Error validating dataset creation');
            throw new DatasetNotValid(koaObj.errors);
        }
        return true;
    }

    static async validateFindByIDS(koaObj) {
        logger.info('Validating Dataset Find by ids');
        koaObj.checkBody('ids').notEmpty().check((ids) => ids.some((id) => DatasetValidator.isString(id)), 'must be a string');

        if (koaObj.errors) {
            logger.info('Error validating dataset find by ids');
            throw new DatasetNotValid(koaObj.errors);
        }
        return true;
    }

    static async validateUpload(koaObj) {
        logger.info('Validating Dataset Raw Upload');
        koaObj.checkFile('dataset').notEmpty();
        koaObj.checkBody('provider').in(CONNECTOR_TYPES.document.provider.concat(RASDAMAN_TYPES));
        if (koaObj.request.body.files && koaObj.request.body.files.dataset) {
            koaObj.checkFile('dataset').notEmpty().suffixIn(koaObj.request.body.fields.provider).size(0, 4 * 1024 * 1024, 'file too large');
        }
        if (koaObj.errors) {
            logger.info('Errors uploading', koaObj.errors);
            logger.info('Error validating dataset creation');
            throw new DatasetNotValid(koaObj.errors);
        }
        return true;
    }

}

module.exports = DatasetValidator;
