let da = 1
export const request = (url = '', method = 'GET', data = {}, header = {
  // 'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJsb2dpbl91c2VyX2tleSI6IjgwNDEwMDkwLTMwNTYtNGQ2MS1iNjYxLTdhMTU2NGJmYzJiNSJ9.25HzH3MWtOacMNQC7rYKunwLkUAq3BWcTV2mvyVC5GlC6HqU7YviF2K0HbKqInUG9RAZ0ZGYY9acaRlKpI-QVQ'
  'x-token': wx.getStorageSync('token') ? wx.getStorageSync('token') : ''
}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      // url: 'http://192.168.0.41:7788/zjian' + url, //接口地址：本地
      // url: 'https://client.zzazhijian.com/zjian' + url, //接口地址：正式环境
      url: 'https://zang.yahuihui.cn' + url, //接口地址：测试环境
    // url: 'http://localhost:8844' + url, 
    // url: 'http://192.168.0.41:8844' + url, 
      method: method, //请求方法
      data: data, //传递参数+
      header: header, //自定义头部，和后端商同后编写
      success: (res) => {
        console.log('request.js文件的通用接口请求封装返回的结果数据', res);
        //注：因为这里对请求成功的没有统一设置抛错提示，所以后续具体组件中使用接口请求的res除200（实际以后端同事定好的为准）成功外的其他code需要额外写抛错提示
        if (res.data.code == '7')  { //自定请求失败的情况，这里以常见的token失效或过期为例
          wx.showModal({
            showCancel: false,
            title: '温馨提示',
            content: res.data.msg,
          });
        } else if (res.data.code == '401') { //自定请求失败的情况，这里以常见的token失效或过期为例
          console.log(da)
          if (da == 1) {
            let isReady = wx.$TUIKit.isReady();
            if (isReady) {
              wx.$TUIKit.logout();
            }
            da = 0
            wx.removeStorageSync('token');
            wx.showModal({
              showCancel: true,
              title: '温馨提示',
              content: res.data.msg,
              success: function (result) {
                console.log(result, 11111)
                if (result.confirm) {
                  wx.reLaunch({
                    url: '/pages/login/index'    //这里需用绝对路径才可
                  });
                }
              }
            });
            setTimeout(() => {
              da = 1
            }, 3000)
          }

        }
        resolve(res.data) //成功
      },
      // 这里的接口请求，如果出现问题就输出接口请求失败的msg；
      //注：因为这里对于请求失败的设置统一抛错提示了，所以后续具体组件中使用接口请求的catch中不需要再写抛错提示
      fail: (err) => {
        wx.showToast({
          title: "请检查网络" ,
          icon: 'none'
        });
        reject(err)
      }
    })
  })
}

export default request;