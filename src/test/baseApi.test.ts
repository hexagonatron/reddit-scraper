import BaseApi from '../lib/BaseApi';
import express from 'express';

const PORT = 5050;
const server = express();

server.get('/:test', (req, res) => {
    res.send(req.params.test);
});

class TestApi extends BaseApi {
    constructor(url: string, requestsPerSecond: number) {
        super(url, requestsPerSecond);
    }

    get(path: string) {
        return this.getRequest(path);
    }
}

const main = async () => {
    return new Promise(async (resolve, _reject) => {

        const Api = new TestApi(`http://localhost:${PORT}`, 10);

        const testRequests = new Array(100).fill(1).map((_v, i) => Api.get(`/${i}`));
        const responses = await Promise.all(testRequests);
        console.log(responses);
        resolve(null);
    });
}



const activeServer = server.listen(PORT, async () => {
    console.log("server running");
    await main();
    activeServer.close();
});