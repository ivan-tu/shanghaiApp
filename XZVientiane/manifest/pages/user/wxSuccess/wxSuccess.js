(function() {

    let app = getApp();

    app.Page({
        pageId: 'user-wxSuccess',
        data: {
            systemId: 'user',
            moduleId: 'wxSuccess',
            data: null,
            fail: 0,
            options: {},
            settings: {},
            language: {},
            form: {}
        },
        methods: {
            onLoad: function(options) {
                if (options.fail == '1') {
                    this.setData({
                        fail: 1
                    });
                }
            }
        }
    });
})();