class ConnectorUrlNotValid extends Error {

    constructor(message) {
        super(message);
        this.name = 'ConnectorUrlNotValid';
        this.message = message;
    }

}

module.exports = ConnectorUrlNotValid;
