const PixivTinyApi = require('./index');
// define your username and password
const { username, password } = require('./config');
const app = new PixivTinyApi({ username, password });

async function loginSample() {
    try {
        await app.login().then(console.log);
        await app.userBookmarkTagsIllust().then(console.log);

    } catch (e) {
        console.log(e);
    }
};
// loginSample();

async function noLoginSample() {
    try {
        await app.searchIllust('少女').then(console.log);
        await app.getNext().then(console.log);
        await app.illustRanking().then(console.log);
    } catch (e) {
        console.log(e);
    }
}
noLoginSample();