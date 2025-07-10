/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Component({

        //组件名称，不需要改变
        comName: 'search-input',

        /**
         * 组件的属性列表
         */
        properties: {
            type: {
                type: String,
                value: ''
            },
            select: {
                type: Array,
                value: []
            },
            placeholder: {
                type: String,
                value: '搜索关键字'
            },
            keyword: {
                type: String,
                value: ''
            }
        },

        /**
         * 组件的初始数据
         */
        data: {
            searchSelect: ['按姓名', '按账号', '按订单号'],
            searchType: 0
        },

        /**
         *组件布局完成时执行
         */

        ready: function() {
            let _this=this,
                data = this.getData(),
                searchSelect = [],
                searchType = 0;

            if (data.select && data.select.length) {
                app.each(data.select, function(i, item) {
                    searchSelect.push(item.title);

                    if (item.title == data.type) {
                        searchType = i;
                    };
                });
            };
            // setTimeout(function() {
            //     _this.selectComponent('#picker').reset();
            // }, 500);
            this.setData({ 'searchSelect': searchSelect, 'searchType': searchType });
        },

        /**
         * 组件的函数列表
         */
        methods: {
            changeKeyword: function() {

            },
            getKeyword: function(e) {
                let value = app.eValue(e);

                this.setData({ 'keyword': value });
            },
            emptyKeyword: function() {
                this.setData({ 'keyword': '' });
            },
            search: function(e) {
                e.preventDefault();
                let data = this.getData();

                if ((data.searchType != '' && data.select && data.select.length) || data.searchType == 0) {
                    data.type = data.select[data.searchType].id;
                };

                this.pEvent('change', data);
            }
        }
    });
})();