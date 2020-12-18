class MicroserviceConnection extends Error {

    constructor(message) {
        super(message);
        this.name = 'MicroserviceConnection';
        this.message = message;
        this.status = 500;
    }

}

module.exports = MicroserviceConnection;
