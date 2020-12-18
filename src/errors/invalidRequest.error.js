class InvalidRequest extends Error {

    constructor(message) {
        super(message);
        this.name = 'ConnectorUrlNotValid';
        this.message = message;
    }

}

module.exports = InvalidRequest;
