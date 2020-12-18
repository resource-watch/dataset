class DatasetDuplicated extends Error {

    constructor(message) {
        super(message);
        this.name = 'DatasetDuplicated';
        this.message = message;
    }

}

module.exports = DatasetDuplicated;
