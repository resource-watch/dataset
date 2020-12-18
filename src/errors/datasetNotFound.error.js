class DatasetNotFound extends Error {

    constructor(message) {
        super(message);
        this.name = 'DatasetNotFound';
        this.message = message;
    }

}

module.exports = DatasetNotFound;
