import BaseApi from "./BaseApi";

const BASE_PUSHSHIFT_API = "https://api.pushshift.io/reddit"

class PushshiftApi extends BaseApi{
    
    constructor() {
        super(BASE_PUSHSHIFT_API);
    }

    public getSubmissions() {

    }

    public getComments() {
    }
}

export default PushshiftApi;