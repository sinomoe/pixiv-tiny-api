const PixivTinyApi = require('./index');
// define your username and password
const { username, password } = require('./config');
const util = require('util');
const app = new PixivTinyApi({ username, password });

const timeOut = util.promisify(setTimeout);

async function tt() {
    await app.login().then(console.log);
    await app.userBookmarkTagsIllust().then(console.log);
};
tt();