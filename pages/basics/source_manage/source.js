// pages/basics/source_manage/source.js
Component({

    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})

Page({
    goToCosPage() {
      wx.navigateTo({
        url: '/pages/cos/cos' // 跳转到 COS 资源页面
      });
    }
  });