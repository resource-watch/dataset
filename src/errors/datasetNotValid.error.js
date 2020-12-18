class DatasetNotValid extends Error {

    constructor(messages) {
        super(messages);
        this.name = 'DatasetNotValid';
        this.messages = messages;
    }

    getMessages() {
        let messages = '- ';
        this.messages.forEach((message) => {
            if (typeof message === 'object' && message !== null) {
                messages += `${Object.keys(message)[0]}: ${message[Object.keys(message)[0]]} - `;
            } else {
                messages += `${message} - `;
            }
        });
        return messages;
    }

}

module.exports = DatasetNotValid;
