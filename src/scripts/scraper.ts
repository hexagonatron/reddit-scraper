import RedditApi from '../lib/RedditApi';
import {DateTime} from 'luxon';

const Api = new RedditApi("5mFnEMZ7fV5Cwg", "tchGBf1H31fFu8Vzuhz5uzrr257zPQ");

const dateArray = [new DateTime(), new DateTime().minus({days: 1}), new DateTime().minus({days: 2})];

dateArray.forEach(dt => {
    const searchStr = `Daily General Discussion - ${dt.toFormat('MMMM d, yyyy')}`;
    console.log(searchStr)
})
