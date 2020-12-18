import config from 'config';
import { ConnectionOptions } from "mongoose";

const mongooseDefaultOptions:ConnectionOptions = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: (config.get('mongodb.useUnifiedTopology') === 'true'),
    readPreference: 'secondaryPreferred', // Has MongoDB prefer secondary servers for read operations.
    appname: 'dataset', // Displays the app name in MongoDB logs, for ease of debug
    serverSelectionTimeoutMS: 5000, // Number of milliseconds the underlying MongoDB driver has to pick a server
    poolSize: 10 // Default is 5, setting to 10 to prevent slower queries from blocking things
};

export default mongooseDefaultOptions;
