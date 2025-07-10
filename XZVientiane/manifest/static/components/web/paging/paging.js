/**
 *模块组件构造器
 */
(function() {

    let app = getApp();

    app.Component({

        //组件名称，不需要改变
        comName: 'paging',

        /**
         * 组件的属性列表
         */
        properties: {
            size: {
                type: Number,
                value: 10
            },
            sizes: {
                type: Array,
                value: [10, 30, 50, 100, 200, 500]
            },
            max: {
                type: Number,
                value: 5
            },
            page: {
                type: Number,
                value: 1
            },
            count: {
                type: Number,
                value: 0
            }
        },

        /**
         * 组件的初始数据
         */
        data: {
            total: 1,
            sizeIndex: 0,
            jumpPage: '',
            pages: []
        },

        /**
         *组件布局完成时执行
         */

        ready: function() {
            this.reset();
        },

        /**
         * 组件的函数列表
         */
        methods: {
            reset: function(res) {
                let data = this.getData();
                if (res) {
                    data = app.extend(data, res);
                };
                if (!data.count) return;
                //计算分页条数顺序
                data.sizeIndex = app.inArray(data.size, data.sizes);

                if (data.sizeIndex < 0) {
                    data.sizeIndex = 0;
                    data.sizes.unshift(data.size);
                };

                //计算总页数
                data.total = Math.ceil(data.count / data.size);
                this.setData(data);
                this.setPages(data.page);
            },
            setPages: function(page) {
                //计算显示的页码
                let data = this.getData(),
                    pages = [];
                data.page = page;
                if (data.page <= Math.floor(data.max / 2)) {
                    let endPage = data.max <= data.total ? data.max : data.total;
                    for (let i = 1; i <= endPage; i++) {
                        pages.push(i);
                    };
                } else {
                    let startPage = data.page - Math.floor(data.max / 2);

                    if (data.total > startPage + data.max) {
                        for (let i = startPage; i < startPage + data.max; i++) {
                            pages.push(i);
                        }
                    } else {
                        startPage = data.max >= data.total ? 1 : data.total - data.max + 1;
                        for (let i = startPage; i <= data.total; i++) {
                            pages.push(i);
                        }
                    }
                };
                data.pages = pages;
                this.setData(data);
            },
            tap: function(e) {
                let page = app.eData(e).num;
                if (page != this.getData().page) {
                    this.setPages(page);
                    this.change();
                }
            },
            jump: function(e) {
                let page = app.eValue(e);
                if (isNaN(page) || page < 1 || page > this.getData().total) {
                    if (page) {
                        this.setData({ jumpPage: '' });
                        app.tips('请输入正确的页码');
                    };
                    return;
                };
                if (page != this.getData().page) {
                    this.setPages(page);
                    this.change();
                }
            },
            prev: function(e) {
                let page = this.getData().page;
                page--;
                if (page > 0) {
                    this.setPages(page);
                    this.change();
                }
            },
            next: function(e) {
                let page = this.getData().page;
                page++;
                if (page <= this.getData().total) {
                    this.setPages(page);
                    this.change();
                }
            },
            first: function(e) {
                if (this.getData().page != 1) {
                    this.setPages(1);
                    this.change();
                };
            },
            last: function(e) {
                if (this.getData().page != this.getData().total) {
                    this.setPages(this.getData().total);
                    this.change();
                };
            },
            updateSize: function(e) {
                let data = this.getData(),
                    index = e.detail.value,
                    size = data.size;

                if (index != data.sizeIndex) {

                    this.reset({
                        size: data.sizes[index],
                        sizeIndex: index,
                        page: 1
                    });
                    this.change();
                }
            },
            change: function() {

                this.pEvent('change', this.getData());
            }
        }
    });
})();