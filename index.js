'use strict';

const request = require('superagent');

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

module.exports = class {
    // constructor
    constructor({ username, password, accessToken, refreshToken } = {}) {
        username && (this.username = username);
        password && (this.password = password);
        accessToken && (this.accessToken = accessToken);
        refreshToken && (this.refreshToken = refreshToken);
        this.isLogin = false;
        this.nextUrl = '';
    };

    // internal post method
    _post({ url, headers, body }) {
        return request.post(url)
            .set(commonHeaders)
            .set(postHeaders)
            .set(headers || {})
            .set(this.isLogin ? { Authorization: this.accessToken } : {})
            .send(body)
            .then(res => {
                if (res.ok) {
                    if (typeof res.body.next_url !== 'undefined')
                        this.nextUrl = res.body.next_url;

                    return res.body;
                }

                return Promise.reject(res.body);
            });
    };

    // internal get method
    _get({ url, headers, query }) {
        return request.get(url)
            .set(commonHeaders)
            .set(headers || {})
            .set(this.isLogin ? { Authorization: this.accessToken } : {})
            .query(filter)
            .query(query || {})
            .then(res => {
                if (res.ok) {
                    if (typeof res.body.next_url !== 'undefined')
                        this.nextUrl = res.body.next_url;

                    return res.body;
                }

                return Promise.reject(res.body);
            });
    };

    // using username and password or refreshToken
    // to get bearer token
    auth({ username, password, refreshToken }) {
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

    // using username and password to login
    login(username = this.username, password = this.password) {
        delete this.username;
        delete this.password;

        return this.auth({
            username: username,
            password: password
        });
    }

    // using refreshToken refrsh token
    refresh(refreshToken = this.refreshToken) {
        return this.auth({
            refreshToken: refreshToken
        });
    };

    // logout
    logout() {
        return new Promise((resolve, reject) => {
            try {
                delete this.accessToken;
                this.isLogin = false;
            } catch (e) {
                return reject(new Error('logout failed ' + e));
            }
            return resolve();
        });
    }

    // set nextUrl
    setNextUrl(json) {
        this.nextUrl = json.next_url;
    };

    // request nextUrl
    getNext() {
        return this._get({ url: this.nextUrl });
    }

    // user detail
    userDetail(userId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/detail',
            query: { user_id: userId }
        });
    };

    // user illusts
    // type: illust, manga
    userIllusts(userId, type = 'illust', offset = '0') {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/illusts',
            query: {
                user_id: userId,
                type: type,
                offset: offset
            }
        });
    };

    userBookmarksIllust(userId, restrict) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmarks/illust',
            query: {
                user_id: userId,
                restrict: restrict
            }
        });
    };
    userBookmarksNovel(userId, restrict) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmarks/novel',
            query: {
                user_id: userId,
                restrict: restrict
            }
        });
    };
    // user's bookmarks
    // type: illust, novel
    userBookmarks(userId, type = 'illust', restrict = 'public') {
        if (type === 'illust') {
            return this.userBookmarksIllust(userId, restrict);
        } else if (type === 'novel') {
            return this.userBookmarksNovel(userId, restrict);
        } else {
            return Promise.reject(new Error('wrong param "type" input'));
        }
    };

    // related illusts
    illustRelated(illustId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/related',
            query: { illust_id: illustId }
        });
    };

    // illust's comments
    illustComment(illustId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/comments',
            query: { illust_id: illustId }
        });
    };

    illustBookmarkAdd(illustId, restrict) {
        return this._post({
            url: 'https://app-api.pixiv.net/v2/illust/bookmark/add',
            body: {
                illust_id: illustId,
                restrict: restrict,
            }
        });
    };
    illustBookmarkDelete(illustId) {
        return this._post({
            url: 'https://app-api.pixiv.net/v1/illust/bookmark/delete',
            body: {
                illust_id: illustId
            }
        });
    };
    illustBookmarkDetail(illustId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/bookmark/detail',
            query: { illust_id: illustId }
        });
    };
    // manage bookmarks
    // method: add     like(add into bookmarks)
    //         delete  cancel like(delete a bookmark)
    //         datail  bookmark's detail
    illustBookmark(illustId, method = 'add', restrict = 'public') {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        if (method === 'add') {
            return this.illustBookmarkAdd(illustId, restrict)
        } else if (method === 'delete') {
            return this.illustBookmarkDelete(illustId);
        } else if (method === 'detail') {
            return this.illustBookmarkDetail(illustId);
        } else {
            return Promise.reject(new Error('wrong method input'));
        }
    };

    // illust bookmarks' tags
    userBookmarkTagsIllust(restrict = 'public') {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/bookmark-tags/illust',
            query: { restrict: restrict }
        });
    };

    // illust ranking
    // accessing r18 related mode, login is needed
    // mode: day, day_male, day_female, week_original
    //       week_rookie, week, month
    //       day_r18, day_male_r18, week_r18, week_r18g
    //       day_manga, week_rookie_manga, week_manga
    //       month_manga
    // date: 0000-00-00
    illustRanking(mode = 'day', date) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/ranking',
            query: { mode: mode, date: date }
        });
    };

    // novel ranking
    // mode: day, day_male, day_female, week_rookie, week
    // date: 0000-00-00
    novelRanking(mode = 'day', date) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/ranking',
            query: { mode: mode, date: date }
        });
    };

    illustRecommendedNoLogin(bookmarkIllustIds, contentType, includeRankingLabel) {
        if (!Array.isArray(bookmarkIllustIds))
            return Promise.reject(new TypeError('param "bookmarkIllustIds" should be an array'));

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
    illustRecommendedLogin(contentType, includeRankingLabel) {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/recommended',
            query: {
                content_type: contentType,
                include_ranking_label: includeRankingLabel
            }
        });
    };
    // todo : reload this method
    // illusts' recmendation
    // if it was not login, bookmarkIllustIds can be used to recommend by
    illustRecommended(bookmarkIllustIds = [], contentType = 'illust', includeRankingLabel = 'true') {
        if (this.isLogin)
            return this.illustRecommendedLogin(contentType, includeRankingLabel);

        return this.illustRecommendedNoLogin(bookmarkIllustIds, contentType, includeRankingLabel);
    };

    // pixivision
    spotlightArticles(category = 'all') {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/spotlight/articles',
            query: { category: category }
        });
    };

    // novel markers
    novelMarkers() {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/markers'
        });
    };

    // following
    userFollowing(userId, restrict = 'public') {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/following',
            query: { user_id: userId, restrict: restrict }
        });
    };

    // follower
    userFollower(userId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/follower',
            query: { user_id: userId }
        });
    };

    // 好p友
    userMypixiv(userId) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/mypixiv',
            query: { user_id: userId }
        });
    };

    // block users' list
    userList(userId) {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v2/user/list',
            query: { user_id: userId }
        });
    };

    userFollowAdd(userId, restrict) {
        return this._post({
            url: 'https://app-api.pixiv.net/v1/user/follow/add',
            body: { user_id: userId, restrict: restrict }
        });
    };
    userFollowDelete(userId, restrict) {
        return this._post({
            url: 'https://app-api.pixiv.net/v1/user/follow/delete',
            body: { user_id: userId, restrict: restrict }
        });
    };
    // manage follow
    // method : add     add following users
    //          delete  delete following users
    userFollow(userId, method = 'add', restrict = 'public') {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        if (method === 'add') {
            return this.userFollowAdd(userId, restrict);
        } else if (method === 'delete') {
            return this.userFollowDelete(userId, restrict);
        } else {
            return Promise.reject(new Error('wrong method input'));
        }
    }

    // users' new illusts who are followed by me
    illustFollow(restrict = 'public') {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/follow',
            query: { restrict: restrict }
        });
    };

    // new illusts or mangas
    // contentType: illust, manga
    illustNew(contentType = 'illust') {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/illust/new',
            query: { content_type: contentType }
        });
    };

    // new novels
    novelNew() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/new'
        });
    };

    // my new illusts
    illustMypixiv() {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v2/illust/mypixiv'
        });
    };

    // my new novels
    novelMypixiv() {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v1/novel/mypixiv'
        });
    };

    // users who are recommended
    userRecommended() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/user/recommended'
        });
    };

    // trending tags of illusts
    trendingTagsIllust() {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/trending-tags/illust'
        });
    };

    // search
    // searchTarget: partial_match_for_tags
    //               exact_match_for_tags
    // sort: date_desc  ordered from new to old
    //       date_asc   ordered from old to new
    // duration: within_last_day
    //           within_last_week
    //           within_last_month
    searchIllust(word, { searchTarget = 'partial_match_for_tags', duration = 'within_last_day', sort = 'date_desc' } = {}) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/search/illust',
            query: {
                search_target: searchTarget,
                word: word,
                sort: sort,
                duration: duration
            }
        });
    };

    // autocomplete in search bar
    searchAutocomplete(word) {
        return this._get({
            url: 'https://app-api.pixiv.net/v1/search/autocomplete',
            query: { word: word }
        });
    };

    // muteList
    muteList() {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        return this._get({
            url: 'https://app-api.pixiv.net/v1/mute/list',
            query: { word: word }
        });
    };

    // manage mutelist
    // method: add, delete
    muteEdit(userId, method = 'add') {
        if (!this.isLogin)
            return Promise.reject(new Error('you must login first'));

        let data;
        if (method === 'add') {
            data = { 'add_user_ids[]': userId };
        } else if (method === 'delete') {
            data = { 'delete_user_ids[]': userId };
        } else {
            return Promise.reject(new Error('wrong param "method" input'));
        }

        return this._post({
            url: 'https://app-api.pixiv.net/v1/mute/edit',
            body: data
        });
    };
};