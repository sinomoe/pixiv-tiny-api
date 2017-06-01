'use strict';

const request = require('superagent');
const util = require('./utility');

const headers = {
    'App-OS': 'ios',
    'App-OS-Version': '10.3.1',
    'App-Version': '6.7.1',
    'User-Agent': 'PixivIOSApp/6.7.1 (iOS 10.3.1; iPhone8,1)',
};
const postHeader = { 'Content-Type': 'application/x-www-form-urlencoded' };
const filter = 'for_ios';

class PixivTinyApi {

    constructor(username, password) {
        this.username = username || this.username;
        this.password = password || this.password;
        this.accessToken = '';
        this.refreshToken = '';
    };

    // 通过用名密码登陆
    login(username = this.username, password = this.password) {
        return this.auth(username, password);
    };

    //通过 refreshToken 刷新令牌
    refresh(refreshToken = this.refreshToken) {
        return this.auth('', '', refreshToken);
    };

    // 通过用名密码登陆，或通过 refreshToken 刷新令牌
    auth(username, password, refreshToken) {
        const authData = {
            'get_secure_url': 1,
            'client_id': 'bYGKuGVw91e0NMfPGp44euvGt59s',
            'client_secret': 'HP3RmkgAmEGro0gn1x9ioawQE8WMfvLXDz3ZqxpK'
        };
        let agent = request
            .post('https://oauth.secure.pixiv.net/auth/token')
            .set(headers)
            .set(postHeader);

        if (refreshToken && !username && !password) {
            // 更新 token
            // notice!!! 这个 api 貌似有点问题，暂时请求不通
            if (typeof refreshToken !== 'string')
                Promise.reject(new TypeError('wrong refreshToken'));

            authData.grant_type = 'refresh_token';
            authData.refresh_token = refreshToken;

            return agent
                .send(authData)
                .then(res => {
                    this.accessToken = res.body.response.access_token;
                    this.refreshToken = res.body.response.refresh_token;
                });
        } else if (!refreshToken && username && password) {
            // 登陆
            if (!(typeof username === 'string' && typeof password === 'string'))
                Promise.reject(new TypeError('wrong username or password'));

            authData.grant_type = 'password';
            authData.username = username;
            authData.password = password;

            return agent.send(authData).then(res => {
                let response = res.body.response;

                this.accessToken = 'Bearer ' + response.access_token;
                this.refreshToken = response.refresh_token;

                return response;
            });
        } else {
            return Promise.reject(new Error('illegal input'));
        }
    };

    // ---------- utility ----------
    // 返回下一个分页url
    nextUrl(json) {
        if (json.next_url === 'null')
            return false;
        return json.next_url;
    };

    // 访问下一个分页并返回参数
    nextPage(url) {
        if (!url || typeof url !== 'string')
            return Promise.reject(new TypeError('wrong nextUrl'));
        return request
            .get(url)
            .then(res => res.body);
    }

    // ---------- COMMOM API ----------
    // 用户-详情
    userDetail(userId) {
        if (!userId || typeof userId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));
        return request
            .get('https://app-api.pixiv.net/v1/user/detail')
            .query({ user_id: userId, filter: filter })
            .then(res => res.body);
    };
    // 用户-插画列表
    userIllusts(userId, offset = 0) {
        if (!userId || typeof userId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));
        return request
            .get('https://app-api.pixiv.net/v1/user/illusts')
            .query({ user_id: userId, type: 'illust', offset: offset, filter: filter })
            .then(res => res.body);
    };
    // 用户-收藏
    userBookmarks(userId, select = 'illust') {
        if (!userId || typeof userId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));
        let url;
        switch (select) {
            case 'illust':
                url = 'https://app-api.pixiv.net/v1/user/bookmarks/illust';
                break;
            case 'novel':
                url = 'https://app-api.pixiv.net/v1/user/bookmarks/novel';
                break;
            default:
                return Promise.reject(new Error('wrong select'));
        };

        return request
            .get(url)
            .query({ user_id: userId, restrict: 'public', filter: filter })
            .then(res => res.body);
    };
    // 图片查询---这个 api 已经在 pixiv-img-dl 里实现了


    // 相关列表
    illustRelated(illustId) {
        if (!illustId || typeof illustId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));

        return request
            .get('https://app-api.pixiv.net/v2/illust/related')
            .query({ illust_id: illustId, filter: filter })
            .then(res => res.body);
    };
    // 评论列表
    illustComment(illustId) {
        if (!illustId || typeof illustId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));

        return request
            .get('https://app-api.pixiv.net/v1/illust/comments')
            .query({ illust_id: illustId, filter: filter })
            .then(res => res.body);
    };

    illustBookmark(illustId, select, tag) {
        if (!illustId || typeof illustId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));
        let url, data;
        switch (select) {
            case 'add':
                url = 'https://app-api.pixiv.net/v2/illust/bookmark/add';
                data = { illust_id: illustId, restrict: 'public', tag: tag };
                break;
            case 'delete':
                url = 'https://app-api.pixiv.net/v1/illust/bookmark/delete';
                data = { illust_id: illustId };
                break;
            default:
                return Promise.reject(new Error('wrong select'));
        };

        return request
            .post(url)
            .set(headers)
            .set(postHeader)
            .set({ Authorization: this.accessToken })
            .send(data)
            .then(res => res.body);
    };
    // 添加收藏（喜欢）
    illustBookmarkAdd(illustId, tag) {
        return illustBookmark(illustId, 'add', tag);
    };
    // 删除收藏（喜欢）
    illustBookmarkDelete(illustId) {
        return illustBookmark(illustId, 'delete');
    };
    // 收藏长按(详情)
    illustBookmarkDetail(illustId) {
        if (!illustId || typeof illustId !== 'string')
            return Promise.reject(new TypeError('wrong userId'));

        return request
            .get('https://app-api.pixiv.net/v2/illust/bookmark/detail')
            .set({ Authorization: this.accessToken })
            .query({ illust_id: illustId })
            .then(res => res.body);
    };
    // 查询收藏筛选列表
    userBookmarkTagsIllust() {
        return request
            .get('https://app-api.pixiv.net/v1/user/bookmark-tags/illust')
            .set({ Authorization: this.accessToken })
            .query({ restrict: 'public' })
            .then(res => res.body);
    }


    // ---------- HOME TAB ----------
    // illust 排行
    // NOTICE!!! R18相关的接口已经没数据了
    illustRanking(mode = 'day', date) {
        if (!mode || typeof mode !== 'string')
            return Promise.reject(new TypeError('wrong mode'));

        const modeRequireDate = ['day_r18', 'day_male_r18', 'week_r18', 'week_r18g'];
        const modeNotRequireDate = ['day_female', 'week_original', 'week_rookie', 'week', 'month', 'day_manga'];
        const modeMayRequireDate = ['day', 'day_male'];

        let params;
        if (util.inArray(modeNotRequireDate, mode)) {
            params = { mode: mode };
        } else if (util.inArray(modeRequireDate, mode)) {
            if (!date || typeof date !== 'string')
                return Promise.reject(new TypeError('wrong date'));
            if (!util.dateRegExp(date))
                return Promise.reject(new Error('wrong date format'));
            params = { mode: mode, date: date };
        } else if (util.inArray(modeMayRequireDate, mode)) {
            if (!date) {
                params = { mode: mode };
            } else {
                if (!date || typeof date !== 'string')
                    return Promise.reject(new TypeError('wrong date'));
                if (!util.dateRegExp(date))
                    return Promise.reject(new Error('wrong date format'));
                params = { mode: mode, date: date };
            }
        } else {
            return Promise.reject(new Error('wrong mode input'));
        }

        return request
            .get('https://app-api.pixiv.net/v1/illust/ranking')
            .query(params)
            .query({ filter: filter })
            .then(res => res.body);
    };
    // 小说排行
    novelRanking(mode = 'day') {
        if (!mode || typeof mode !== 'string')
            return Promise.reject(new TypeError('wrong mode'));

        const avaliableMode = ['day'];
        if (!util.inArray(avaliableMode, mode))
            return Promise.reject(new Error('wrong mode input'));

        let params = { mode: mode, filter: filter };
        return request
            .get('https://app-api.pixiv.net/v1/novel/ranking')
            .query(params)
            .then(res => res.body);
    };
    // todo 推荐 
    illustRecommended() {};
    // todo 高亮文章
    spotlightArticles() {};
};
module.exports = PixivTinyApi;