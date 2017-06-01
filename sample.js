const PixivTinyApi = require('./index');

const username = '';
const password = '';

const app = new PixivTinyApi(username, password);

// app.login()
//     .then((res) => {
//         console.log(res);
//         app.illustBookmark('62544419', 'delete')
//             .then(console.log)
//             .catch(console.log);
//         app.illustBookmarkDetail('63012264')
//             .then(console.log)
//             .catch(console.log);
//         app.userBookmarkTagsIllust()
//             .then(console.log)
//             .catch(console.log);
//     app.illustRanking('day', '2016-07-08')
//         .then(console.log)
//         .catch(console.log);
// })
// .catch(console.log);

// app.userDetail('14469137').then(console.log).catch(console.log);
// app.userBookmarks('14469137').then(console.log).catch(console.log);
// app.illustComment('63012264').then(console.log).catch(console.log);
app.illustRanking('day').then(console.log).catch(console.log);
// app.novelRanking('day').then(console.log).catch(console.log);