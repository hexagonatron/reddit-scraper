import RedditApi from '../lib/RedditApi';
import {DateTime} from 'luxon';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.join(__dirname, "..", "..", ".env")});

const Api = new RedditApi(process.env.REDDIT_CLIENT_ID!, process.env.REDDIT_CLIENT_SECRET!);
console.log(process.env.REDDIT_CLIENT_ID)

Api.search({
    q: 'test'
})

const dateArray = [new DateTime(), new DateTime().minus({days: 1}), new DateTime().minus({days: 2})];

dateArray.forEach(dt => {
    const searchStr = `Daily General Discussion - ${dt.toFormat('MMMM d, yyyy')}`;
    console.log(searchStr)
})
