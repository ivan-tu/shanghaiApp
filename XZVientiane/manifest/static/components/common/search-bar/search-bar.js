/**
 *模块组件构造器
 */
(function () {

    let app = getApp();

    app.Component({

        //组件名称，不需要改变
        comName: 'search-bar',

        /**
         * 组件的属性列表
         */
        properties: {
            placeholder: {
                type: String,
                value: '搜索关键字'
            },
            label: {
                type: String,
                value: '搜索'
            },
            keyword: {
                type: String,
                value: ''
            },
            title: {
                type: String,
                value: '热搜关键词'
            },
            vague: {
                type: String,
                value: ''
            },
            list: {
                type: String,
                value: ''
            }
        },

        /**
         * 组件的初始数据
         */
        data: {
            open: false,
            vagueList: [],
            sublist: [],
            loading: false
        },

        /**
         *组件布局完成时执行
         */

        ready: function () {
            let _this = this,
                list = _this.getData().list;

            if (list) {
                _this.setData({ 'loading': true });
                app.request(list, {}, function (backData) {
                    _this.setData({ 'sublist': backData });
                }, '', function () {
                    _this.setData({ 'loading': false });
                });
            };
        },

        /**
         * 组件的函数列表
         */
        methods: {
            openSearch: function (e) {
                this.setData({ 'open': true });
            },
            closeSearch: function (e) {
                this.setData({ 'open': false });
                this.setData({ 'keyword': '' });
                this.close();
            },
            getKeyword: function (e) {
                let value = app.eValue(e);
                this.setData({ 'keyword': value });
                if (this.getData().vague) {
                    this.getVagueSearch();
                };
				this.pEvent('input', this.getData());
            },
            emptyKeyword: function () {
                this.setData({ 'keyword': '' });
            },
            search: function (e) {
                this.setData({ 'open': false });
                this.change();
            },
            selectKeyword: function (e) {
                let value = app.eData(e).value;

                this.setData({ 'keyword': value, 'open': false });
                this.change();
            },
            getVagueSearch: function () {
                let _this = this,
                    vague = _this.getData().vague,
                    keyword = _this.getData().keyword;

                _this.setData({ 'loading': true });
                app.request(vague, { keyword: keyword }, function (backData) {
                    _this.setData({ 'vagueList': backData });
                }, '', function () {
                    _this.setData({ 'loading': false });
                });
            },
            change: function () {
                this.pEvent('change', this.getData());
            },
            close: function () {
                this.pEvent('close', this.getData());
            }
        }
    });
})();