// pages/basics/source_manage/source_manage.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        test: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    onButton() {
        let data = {
            name: 'Name',
            email: '2438524706@qq.com'
        }
        let header = {
            'x-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJPcGVuSWQiOiJvbW5tTzdTWlAyNEd2c3IwT2o5R3lNUFNKRkNBIiwiSUQiOjI2LCJVc2VyTmFtZSI6IjE4OTM5MzkxNTgwIiwiTmlja05hbWUiOiLlsIEiLCJTdGF0dXMiOjEsIkJ1ZmZlclRpbWUiOjg2NDAwLCJpc3MiOiJxbVBsdXMiLCJhdWQiOlsiR1ZBIl0sImV4cCI6MTczNTU0NDMzNCwibmJmIjoxNzM0OTM5NTM0fQ.m2WffMmolNOvJh79DscZZ37p6MkgaREd7TIxQ7EQfq4'
        }
        wx.request({
            url: 'http://127.0.0.1:8844/test', //接口地址：测试环境
            method: 'post', //请求方法
            data: data, //传递参数+
            header: header, //自定义头部，和后端商同后编写
            success: (res) => {
                console.log('request.js文件的通用接口请求封装返回的结果数据', res.data.message);
                this.setData({
                    test: res.data.message
                })
            },
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
    goToCosPage() {
        wx.navigateTo({
            url: '/pages/cos/cos' // 跳转到 COS 资源页面
        });
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})