import RedditApi from '../lib/RedditApi';
import dotenv from 'dotenv';
import path from 'path';
import Moment from 'moment';
import {writeFile} from 'fs';

dotenv.config({path: path.join(__dirname, "..", "..", ".env")});

const OUTPUT_PATH = path.join(__dirname, "output");

const Api = new RedditApi(process.env.REDDIT_CLIENT_ID!, process.env.REDDIT_CLIENT_SECRET!);

const dateArray = [Moment(), Moment().subtract(1, 'day'), Moment().subtract(2, 'days')];

dateArray.forEach(async dt => {
    const searchStr = `Daily General Discussion - ${dt.format('MMMM d, yyyy')}`;
    const results = await Api.search({q: searchStr},'ethfinance');
    writeFile(path.join(OUTPUT_PATH, dt.format("yyyy-MM-DD")+".json"), JSON.stringify(results, null, 2), (err) => err && console.log(err));
})
