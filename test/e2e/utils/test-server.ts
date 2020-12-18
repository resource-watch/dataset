import chai from 'chai';
import nock from 'nock';
import ChaiHttp from 'chai-http';

let requester:ChaiHttp.Agent;

chai.use(ChaiHttp);

export const getTestServer: () => Promise<ChaiHttp.Agent> = async () => {
    if (requester) {
        return requester;
    }

    nock(process.env.CT_URL)
        .post(`/api/v1/microservice`)
        .reply(200);

    const { init } = await import('app');
    const { server } = await init();

    requester = chai.request.agent(server);

    return requester;
};

export const closeTestServer: () => Promise<void> = async () => {
    if (!requester) {
        return;
    }
    requester.close();

    requester = null;
};
