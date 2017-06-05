'use strict';

const request = require('superagent');
const util = require('./utility');

const commonHeaders = {
    'App-OS': 'ios',
    'App-OS-Version': '10.3.1',
    'App-Version': '6.7.1',
    'User-Agent': 'PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)',
    'Accept-Language': 'zh-cn'
};
const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
const authData = {
    get_secure_url: 'ture',
    client_id: 'KzEZED7aC0vird8jWyHM38mXjNTY',
    client_secret: 'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP',
    device_token: '1fd302c1db725fa8d3d421bda8da82d8'
};
const filter = { filter: 'for_ios' };

class PixivTinyApi {

    constructor(params = {}) {
        let { username, password, accessToken, refreshToken } = params;
        username && (this.username = username);
        password && (this.password = password);
        accessToken && (this.accessToken = accessToken);
        refreshToken && (this.refreshToken = refreshToken);
        this.isLogin = false;
    }

    _post(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { url, headers, body, auth } = params;
        return request.post(url)
            .set(commonHeaders)
            .set(postHeaders)
            .set(headers || {})
            .set(auth ? { Authorization: this.accessToken } : {})
            .send(body)
            .then(res => res.body);
    };

    _get(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { url, headers, query, auth } = params;
        return request.get(url)
            .set(commonHeaders)
            .set(headers || {})
            .set(auth ? { Authorization: this.accessToken } : {})
            .query(filter)
            .query(query || {})
            .then(res => res.body);
    };

    // 通过用名密码登陆
    login(params = {}) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        let { username = this.username, password = this.password } = params;
        delete this.username;
        delete this.password;
        return this.auth({
            username: username,
            password: password
        });
    }

    //通过 refreshToken 刷新令牌
    refresh(params = {}) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { refreshToken = this.refreshToken } = params;
        return this.auth({
            refreshToken: refreshToken
        });
    };

    // 通过用名密码登陆，或通过 refreshToken 刷新令牌
    auth(params) {
        const { username, password, refreshToken } = params;
        let authBody = authData;
        if (typeof refreshToken !== 'undefined') {
            // 使用 refreshToken 刷新令牌
            authBody.grant_type = 'refresh_token';
            authBody.refresh_token = refreshToken;
        } else if (typeof username !== 'undefined' &&
            typeof password !== 'undefined') {
            // 使用账号密码刷新令牌
            authBody.grant_type = 'password';
            authBody.username = username;
            authBody.password = password;
        } else {
            // 无效输入
            return Promise.reject(new Error('wrong params input'));
        }

        return this._post({
            url: 'https://oauth.secure.pixiv.net/auth/token',
            body: authBody
        }).then(body => {
            this.accessToken = 'Bearer ' + body.response.access_token;
            this.refreshToken = body.response.refresh_token;
            this.isLogin = true;

            return body;
        });
    };

    // ---------- utility ----------
    // 返回下一个分页url
    nextUrl(json) {
        if (json.next_url === 'null')
            return false;
        return json.next_url;
    };

    // 访问下一个分页并返回参数
    getNext(url) {
        if (typeof url !== 'string')
            return Promise.reject(new TypeError('url should be a string'));
        return this._get({ url: url });
    }

    // ---------- COMMOM API ----------
    // 用户-详情
    userDetail(params) {
        if (typeof userId !== 'object')
            return Promise.reject(new TypeError('userId should be a object'));
        const { userId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/detail',
            query: { user_id: userId }
        });
    };
    // 用户-插画列表
    // type 可选 illust, manga
    userIllusts(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, type = 'illust', offset = '0' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/illusts',
            query: {
                user_id: userId,
                type: type,
                offset: offset
            }
        });
    };
    // 用户-收藏-画作
    userBookmarksIllust(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmarks/illust',
            query: {
                user_id: userId,
                restrict: restrict
            }
        });
    };
    // 用户-收藏-小说
    userBookmarksNovel(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmarks/novel',
            query: {
                user_id: userId,
                restrict: restrict
            }
        });
    };
    // 用户-收藏
    userBookmarks(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public', type = 'illust' } = params;

        if (type === 'illust') {
            return this.userBookmarksIllust(params);
        } else if (type === 'novel') {
            return this.userBookmarksNovel(params);
        } else {
            return Promise.reject(new Error('wrong type input'));
        }
    };
    // 相关列表
    illustRelated(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/related',
            query: { illust_id: illustId }
        });
    };
    // 评论列表
    illustComment(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/comments',
            query: { illust_id: illustId }
        });
    };
    // 添加收藏（喜欢）
    illustBookmarkAdd(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId, restrict = 'public' } = params;

        return this._post({
            url: 'https://app-api.pixiv.net/v2/illust/bookmark/add',
            body: {
                illust_id: illustId,
                restrict: restrict,
            },
            auth: true
        });
    };
    // 删除收藏（喜欢）
    illustBookmarkDelete(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId } = params;

        return this._post({
            url: 'https://app-api.pixiv.net/v1/illust/bookmark/delete',
            body: {
                illust_id: illustId
            },
            auth: true
        });
    };
    // 收藏长按(详情)
    illustBookmarkDetail(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/bookmark/detail',
            query: { illust_id: illustId },
            auth: true
        });
    };
    // 管理收藏
    illustBookmark(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { illustId, restrict = 'public', method = 'add' } = params;

        if (method === 'add') {
            return this.illustBookmarkAdd(params)
        } else if (method === 'delete') {
            return this.illustBookmarkDelete(params);
        } else if (method === 'detail') {
            return this.illustBookmarkDetail(params);
        } else {
            return Promise.reject(new Error('wrong method input'));
        }
    };
    // 查询收藏筛选列表
    userBookmarkTagsIllust(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { restrict = 'public' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmark-tags/illust',
            query: { restrict: restrict },
            auth: true
        });
    };

    // ---------- HOME TAB ----------
    // illust 排行
    // mode: day, day_male, day_female, week_original
    //       week_rookie, week, month
    //       day_manga, week_rookie_manga, week_manga
    //       month_manga
    // date: 0000-00-00
    illustRanking(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { mode = 'day', date } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/ranking',
            query: { mode: mode, date: date }
        });
    };
    // 小说排行
    // mode: day, day_male, day_female, week_rookie, week
    // date: 0000-00-00
    novelRanking(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { mode = 'day', date } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/ranking',
            query: { mode: mode, date: date }
        });
    };
    illustRecommendedNoLogin(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        let { bookmarkIllustIds = [], contentType = 'illust', includeRankingLabel = 'true' } = params;
        bookmarkIllustIds = bookmarkIllustIds.join(',');

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/recommended-nologin',
            query: {
                bookmark_illust_ids: bookmarkIllustIds,
                content_type: contentType,
                include_ranking_label: includeRankingLabel
            }
        });
    };
    illustRecommendedLogin(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { contentType = 'illust', includeRankingLabel = 'true' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/recommended',
            query: {
                content_type: contentType,
                include_ranking_label: includeRankingLabel
            },
            auth: true
        });
    };
    // 推荐 
    // 未登陆的话可填写 bookmarkIllustIds，根据其推荐
    illustRecommended(params = {}) {
        if (this.isLogin)
            return this.illustRecommendedLogin(params);
        return this.illustRecommendedNoLogin(params);
    };
    // 热点文章 pixivision
    spotlightArticles(params = {}) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { category = 'all' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/spotlight/articles',
            query: { category: category }
        });
    };

    // ---------- MY TAB ----------
    // 书签
    novelMarkers() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/markers',
            auth: true
        });
    };
    // following
    userFollowing(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/following',
            query: { user_id: userId, restrict: restrict }
        });
    };
    // follower
    userFollower(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/follower',
            query: { user_id: userId }
        });
    };
    // 好 p 友
    userMypixiv(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/mypixiv',
            query: { user_id: userId }
        });
    };
    // 黑名单用户
    userList(userIds) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v2/user/list',
            query: { user_id: userId },
            auth: true
        });
    };
    // Add Following
    userFollowAdd(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public' } = params;

        return this._post({
            url: 'https://app-api.pixiv.net/v1/user/follow/add',
            body: { user_id: userId, restrict: restrict },
            auth: true
        });
    };
    // Del Following
    userFollowDelete(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public' } = params;

        return this._post({
            url: 'https://app-api.pixiv.net/v1/user/follow/delete',
            body: { user_id: userId, restrict: restrict },
            auth: true
        });
    };
    // manage follow
    userFollow(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, restrict = 'public', method = 'add' } = params;

        if (method === 'add') {
            return this.userFollowAdd(params);
        } else if (method === 'delete') {
            return this.userFollowDelete(params);
        } else {
            return Promise.reject(new Error('wrong method input'));
        }
    }

    // ---------- NEW TAB ----------
    // 关注用户的新作
    illustFollow(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { restrict = 'public' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/follow',
            query: { restrict: restrict },
            auth: true
        });
    };
    // 大家的新作(画作或漫画)
    // content_type: illust, manga
    illustNew(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { content_type = 'illust' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/new',
            query: { content_type: content_type }
        });
    };
    // 大家的新作(小说)
    novelNew() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/new'
        });
    };
    // 我的新作（画作）
    illustMypixiv() {
        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/mypixiv',
            auth: true
        });
    };
    // 我的新作（小说）
    novelMypixiv() {
        return this._get({
            url: 'https://app-api.pixiv.net/v2/novel/mypixiv',
            auth: true
        });
    };
    // 推荐作家
    userRecommended() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/recommended',
            auth: true
        });
    };

    // ---------- SEARCH TAB ----------
    // 标签趋势
    trendingTagsIllust() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/trending-tags/illust',
            auth: true
        });
    };
    // 搜索
    // searchTarget: partial_match_for_tags 部分一致
    //                exact_match_for_tags 完全一致
    // sort: date_desc 按更新顺序
    //       date_asc 从旧到新
    // duration: within_last_day 最近1天
    //           within_last_week 最近一周
    //           within_last_month 最近1个月
    searchIllust(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { word, searchTarget = 'partial_match_for_tags', sort = 'date_desc' } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/search/illust',
            query: {
                search_target: searchTarget,
                word: word,
                sort: sort
            }
        });
    };
    // 搜索自动补全
    searchAutocomplete(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { word } = params;

        return this._get({
            url: 'https://app-api.pixiv.net/v1/search/autocomplete',
            query: { word: word }
        });
    };
    // 屏蔽列表
    muteList() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/mute/list',
            query: { word: word },
            auth: true
        });
    };
    // 添加或取消屏蔽
    muteEdit(params) {
        if (typeof params !== 'object')
            return Promise.reject(new TypeError('params should be a object'));
        const { userId, method = 'add' } = params;
        let data;
        if (method === 'add') {
            data = { 'add_user_ids[]': userId };
        } else if (method === 'delete') {
            data = { 'delete_user_ids[]': userId };
        } else {
            return Promise.reject(new Error('wrong method input'));
        }

        return this._post({
            url: 'https://app-api.pixiv.net/v1/mute/edit',
            body: data,
            auth: true
        });
    };
};
module.exports = PixivTinyApi;