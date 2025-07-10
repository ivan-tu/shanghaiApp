/**
 *模块组件构造器
 */
(function () {

  let app = getApp();

  app.Component({

    //组件名称，不需要改变
    comName: 'chart',

		/**
		 * 组件的属性列表
		 */
    properties: {
			cid:{
				type:String,
				value:'chart_'+app.getNowRandom()
			},
			type:{
				type:String,
				value:'line'
			},
			data:{
        type:Object,
        value:{}
      },
      options:{
        type:Object,
        value:{}
      }
    },

		/**
		 * 组件的初始数据
		 */
    data: {
      
    },

		/**
		 *组件布局完成时执行
		 */

    ready: function () {
			let _this=this;
      require(app.config.staticPath+'/js/utils/Chart.js');
			register('Chart',function(){
				let data=_this.getData(),	
						ctx = document.getElementById(data.cid+'_canvas').getContext('2d');
				_this.Chart = new Chart(ctx, {
								type:data.type,
								data:data.data,
								options:data.options
						});
			});
    },

		/**
		 * 组件的函数列表
		 */
    methods: {
			update:	function(data){
				if(this.Chart){
					this.Chart.data=this.getData().data;
					this.Chart.update();
				};
			}
		}
  });
})();
