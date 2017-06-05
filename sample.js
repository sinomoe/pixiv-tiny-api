const PixivTinyApi = require('./index');
const { username, password } = require('./config');

const app = new PixivTinyApi(username, password);