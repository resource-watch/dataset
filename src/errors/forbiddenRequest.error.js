class ForbiddenRequest extends Error {

    constructor(message) {
        super(message);
        this.name = 'ForbiddenRequest';
        this.message = message;
    }

}

module.exports = ForbiddenRequest;
