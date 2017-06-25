# pixiv-tiny-api

[中文](./README_ZH.md)

基于 pixiv ios 应用和 nodejs 的轻量 pixiv api

## 安装

```bash
npm i pixiv-tiny-api --save
```

## 测试

```bash
npm test
```

## API

更多细节，请阅读 `index.js`，代码里注释很清楚。

#### `constructor({ username, password, accessToken, refreshToken })`

构造函数

#### `login(username = this.username, password = this.password)`

登陆

#### `refresh(refreshToken = this.refreshToken)`

刷新token

#### `logout()`

登出

#### `getNext()`

请求 next_url 字段的连接

#### `userDetail(userId)`

用户-详情

#### `userIllusts(userId, type = 'illust', offset = '0')`

用户-插画/漫画

* type: "illust" or "manga"

#### `userBookmarks(userId, type = 'illust', restrict = 'public')`

用户-收藏

* type: "illust" or "novel"
* restrict: "public" or "private"

#### `illustRelated(illustId)`

相关插画

#### `illustComment(illustId)`

插画评论

#### `illustBookmark(illustId, method = 'add', restrict = 'public')`

添加/删除收藏（点赞）

* method: "add" or "delete" or "detail"
* restrict: "public" or "private"

#### `userBookmarkTagsIllust(restrict = 'public')`

收藏标签

* restrict: "public" or "private"

#### `illustRanking(mode = 'day', date = '')`

插画排行

* mode: "day", "day_male", "day_female", "week_original", "week_rookie", "week", "month", "day_r18", "day_male_r18", "week_r18", "week_r18g", "day_manga", "week_rookie_manga", "week_manga", "month_manga"
* date: "2017-05-20"

#### `novelRanking(mode = 'day', date = '')`

小说排行

* mode: "day", "day_male", "day_female", "week_rookie", "week"
* date: "2017-05-20"

#### `illustRecommended(bookmarkIllustIds = [], contentType = 'illust', includeRankingLabel = 'true')`

推荐的插画/漫画。登陆时根据收藏的内容推荐，未登录则根据 `bookmarkIllustIds` 推荐

* contentType: "illust" or "manga"
* includeRankingLabel: "true" or "false"

#### `spotlightArticles(category = 'all')`

pixivision

#### `novelMarkers()`

小说书签

#### `userFollowing(userId, restrict = 'public')`

用户关注

* restrict: "public" or "private"

#### `userFollower(userId)`

用户粉丝

#### `userMypixiv(userId)`

好 p 友

#### `userList(userId)`

黑名单列表

#### `userFollow(userId, method = 'add', restrict = 'public')`

添加/取消关注

* method: "add" or "delete"
* restrict: "public" or "private"

#### `illustFollow(restrict = 'public')`

关注用户的新作

* restrict: "public" or "private"

#### `illustNew(contentType = 'illust')`

新插画/漫画

* contentType: "illust" or "manga"

#### `novelNew()`

新小说

#### `illustMypixiv()`

我的新插画

#### `novelMypixiv()`

我的新小说

#### `userRecommended()`

推荐用户

#### `trendingTagsIllust()`

插画标签趋势

#### `searchIllust(word, { searchTarget = 'partial_match_for_tags', duration = 'within_last_day', sort = 'date_desc' })`

搜索插画

* searchTarget: "partial_match_for_tags" or "exact_match_for_tags"
* duration: "within_last_day", "within_last_week", "within_last_month"
* sort: "date_desc" or "date_asc"

#### `searchAutocomplete(word)`

搜索框自动补全

#### `muteList()`

屏蔽用户列表

#### `muteEdit(userId, method = 'add')`

编辑屏蔽用户

* method: "add" or "delete"

## 样例

见 [`sample.js`](sample.js)

## 联系我

sino2322@gmail.com

## 许可证

MIT © [sino](http://onesino.com)