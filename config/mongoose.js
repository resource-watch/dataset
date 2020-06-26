const config = require('config');
const fs = require('fs');

const mongooseOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: (config.get('mongodb.useUnifiedTopology') === 'true'),
    readPreference: 'secondaryPreferred', // Has MongoDB prefer secondary servers for read operations.
    appname: 'dataset', // Displays the app name in MongoDB logs, for ease of debug
    serverSelectionTimeoutMS: 5000, // Number of milliseconds the underlying MongoDB driver has to pick a server
    loggerLevel: config.get('logger.level'), // Logger level to pass to the MongoDB driver
    poolSize: 10, // Default is 5, setting to 10 to prevent slower queries from blocking things,
    sslCA: fs.readFileSync(`${__dirname}/rds-combined-ca-bundle.pem`),
    sslValidate: false
};

module.exports = mongooseOptions;
