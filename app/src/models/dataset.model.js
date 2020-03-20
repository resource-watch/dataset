const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const uuidV4 = require('uuid/v4');

const { Schema } = mongoose;
const { STATUS } = require('app.constants');

const Dataset = new Schema({
    _id: { type: String, default: uuidV4 },
    name: { type: String, required: true, trim: true },
    slug: {
        type: String, required: true, unique: true, trim: true
    },
    type: {
        type: String, required: false, trim: true, default: null
    },
    subtitle: {
        type: String, required: false, trim: true, default: null
    },
    application: [
        { type: String, required: true, trim: true }
    ],
    applicationConfig: { type: Schema.Types.Mixed },
    dataPath: {
        type: String, required: false, trim: true, default: null
    },
    attributesPath: {
        type: String, required: false, trim: true, default: null
    },
    connectorType: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    connectorUrl: {
        type: String, required: false, trim: true, default: null
    },
    sources: [{
        type: String, required: false, trim: true, default: null
    }],
    tableName: {
        type: String, required: false, trim: true, default: null
    },
    status: { type: String, enum: STATUS, default: 'pending' },
    overwrite: { type: Boolean, required: false, default: false },
    errorMessage: {
        type: String, required: false, trim: true, default: null
    },
    mainDateField: {
        type: String, required: false, trim: true, default: null
    },
    published: { type: Boolean, required: true, default: true },
    env: {
        type: String, required: true, default: 'production', trim: true
    },
    geoInfo: { type: Boolean, required: true, default: false },
    protected: { type: Boolean, required: true, default: false },
    taskId: {
        type: String, required: false, trim: true, default: null
    },
    subscribable: { type: Schema.Types.Mixed },
    legend: {
        _id: false,
        lat: { type: String, required: false, trim: true },
        long: { type: String, required: false, trim: true },
        date: [{ type: String, required: false, trim: true }],
        region: [{ type: String, required: false, trim: true }],
        country: [{ type: String, required: false, trim: true }],
        nested: [{ type: String, required: false, trim: true }],

        integer: [{ type: String, required: false, trim: true }],
        short: [{ type: String, required: false, trim: true }],
        byte: [{ type: String, required: false, trim: true }],
        double: [{ type: String, required: false, trim: true }],
        float: [{ type: String, required: false, trim: true }],
        half_float: [{ type: String, required: false, trim: true }],
        scaled_float: [{ type: String, required: false, trim: true }],

        boolean: [{ type: String, required: false, trim: true }],
        binary: [{ type: String, required: false, trim: true }],

        text: [{ type: String, required: false, trim: true }],
        keyword: [{ type: String, required: false, trim: true }]
    },
    clonedHost: {
        _id: false,
        hostProvider: { type: String, required: false, trim: true },
        hostUrl: { type: String, required: false, trim: true },
        hostId: { type: String, required: false, trim: true },
        hostType: { type: String, required: false, trim: true },
        hostPath: { type: String, required: false, trim: true }
    },
    widgetRelevantProps: [{ type: String, required: false, trim: true }],
    layerRelevantProps: [{ type: String, required: false, trim: true }],
    dataLastUpdated: { type: Date },
    userRole: { type: String, default: null, select: false },
    userName: { type: String, default: null, select: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

Dataset.plugin(mongoosePaginate);

module.exports = mongoose.model('Dataset', Dataset);
