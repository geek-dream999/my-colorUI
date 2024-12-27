// pages/basics/source_manage/source_manage.js
import request from "../../../utif/request";

Page({
    data: {
        albums: [], // 存储相册列表
        isModalOpen: false, // 控制弹窗显示
        newAlbumName: "", // 新相册名称
    },

    onLoad() {
        this.setData({
            page: 1,
            pageSize: 10,
            albums: [],
            hasMore: true
        });
        this.getAlbums(); // 加载相册列表
    },

    // 获取相册列表方法
    getAlbums() {
        if (!this.data.hasMore) {
            console.log("没有更多数据");
            return;
        }

        let data = {
            page: this.data.page,
            pageSize: this.data.pageSize,
            name: '',
            memberId: '',
            isForwardEnabled: ''
        };

        request('/source/album', 'get', data).then((res) => {
            if (res.code === 0) {
                const newAlbums = res.data.list || [];
                const total = res.data.total || 0;

                this.setData({
                    albums: [...this.data.albums, ...newAlbums], // 合并已有数据与新数据
                    page: this.data.page + 1, // 页码累加
                    hasMore: this.data.albums.length + newAlbums.length < total // 判断是否加载完所有数据
                });
            } else {
                console.log("获取相册失败：", res.msg);
            }
        }).catch(err => {
            console.log("请求失败：", err);
        });
    },
    // 下拉触底事件
    onReachBottom() {
        console.log("触底加载更多");
        this.getAlbums();
    },

    // 打开新建相册弹窗
    openModal() {
        this.setData({
            isModalOpen: true
        });
    },

    // 关闭弹窗
    closeModal() {
        this.setData({
            isModalOpen: false,
            newAlbumName: ""
        });
    },

    // 输入相册名称
    handleInput(e) {
        this.setData({
            newAlbumName: e.detail.value
        });
    },

    // 创建相册
    createAlbum() {
        const name = this.data.newAlbumName.trim();
        let data = {
            name: name,
            email: "397608301@qq.com" + name
        }

        if (!name) {
            wx.showToast({
                title: '请输入相册名称',
                icon: 'none'
            });
            return;
        }
        request('/source/albumAdd', 'post', {
            name: name,
            email: "397608301@qq.com" + name
        }).then((res) => {
            if (res.code === 0) {
                wx.showToast({
                    title: '相册创建成功',
                    icon: 'success'
                });
                this.closeModal();
                this.getAlbums(); // 重新加载相册列表
            }
        });
    },

    // 进入相册
    goToAlbum(e) {
        const { id, name } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/basics/source_manage_album/album?id=${id}&name=${name}` // 跳转到相册详情页
        });
    },
});