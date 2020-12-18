class DatasetProtected extends Error {

    constructor(message) {
        super(message);
        this.name = 'DatasetProtected';
        this.message = message;
    }

}

module.exports = DatasetProtected;
