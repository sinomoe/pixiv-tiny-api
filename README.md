# pixiv-tiny-api

[中文](./README_ZH.md)

a simple way to access pixiv api, apis here are all based on pixiv ios app's apis.

## Installation

```bash
npm i pixiv-tiny-api --save
```

## Test

```bash
npm test
```

## API

for detail information, please read `index.js`

### `constructor({ username, password, accessToken, refreshToken })`

### `login(username = this.username, password = this.password)`

### `refresh(refreshToken = this.refreshToken)`

### `logout()`

### `getNext()`

### `userDetail(userId)`

### `userIllusts(userId, type = 'illust', offset = '0')`

* type: "illust" or "manga"

### `userBookmarks(userId, type = 'illust', restrict = 'public')`

* type: "illust" or "novel"
* restrict: "public" or "private"

### `illustRelated(illustId)`

### `illustComment(illustId)`

### `illustBookmark(illustId, method = 'add', restrict = 'public')`

* method: "add" or "delete" or "detail"
* restrict: "public" or "private"

### `userBookmarkTagsIllust(restrict = 'public')`

* restrict: "public" or "private"

### `illustRanking(mode = 'day', date = '')`

* mode: "day", "day_male", "day_female", "week_original", "week_rookie", "week", "month", "day_r18", "day_male_r18", "week_r18", "week_r18g", "day_manga", "week_rookie_manga", "week_manga", "month_manga"
* date: "2017-05-20"

### `novelRanking(mode = 'day', date = '')`

* mode: "day", "day_male", "day_female", "week_rookie", "week"
* date: "2017-05-20"

### `illustRecommended(bookmarkIllustIds = [], contentType = 'illust', includeRankingLabel = 'true')`

* contentType: "illust" or "manga"
* includeRankingLabel: "true" or "false"

### `spotlightArticles(category = 'all')`

### `novelMarkers()`

### `userFollowing(userId, restrict = 'public')`

* restrict: "public" or "private"

### `userFollower(userId)`

### `userMypixiv(userId)`

### `userList(userId)`

### `userFollow(userId, method = 'add', restrict = 'public')`

* method: "add" or "delete"
* restrict: "public" or "private"

### `illustFollow(restrict = 'public')`

* restrict: "public" or "private"

### `illustNew(contentType = 'illust')`

* contentType: "illust" or "manga"

### `novelNew()`

### `illustMypixiv()`

### `novelMypixiv()`

### `userRecommended()`

### `trendingTagsIllust()`

### `searchIllust(word, { searchTarget = 'partial_match_for_tags', duration = 'within_last_day', sort = 'date_desc' })`

* searchTarget: "partial_match_for_tags" or "exact_match_for_tags"
* duration: "within_last_day", "within_last_week", "within_last_month"
* sort: "date_desc" or "date_asc"

### `searchAutocomplete(word)`

### `muteList()`

### `muteEdit(userId, method = 'add')`

* method: "add" or "delete"

## Sample

see [`sample.js`](sample.js)

## Cotact me

sino2322@gmail.com

## License

MIT © [sino](http://onesino.com)