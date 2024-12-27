// pages/album/source_manage_album.js
import request from "../../../utif/request";
const app = getApp();

Page({
    data: {
        folderId: 0, // 当前文件夹 ID
        folderName: "", // 当前文件夹 名称
        items: [], // 文件列表
        isUploading: false, // 上传状态
        selectedItem: null, // 当前选中的项目（用于查看详情）
        showInfo: false, // 显示照片信息蒙版
        isEditing: false, // 是否正在编辑名称
        selectedIds: [], // 已选中的文件 ID 列表
        page: 1, // 当前分页页码
        pageSize: 10, // 每页大小
        hasMore: true, // 是否还有更多数据
        startX: 0, // 记录滑动的起始位置
        isSliding: false, // 是否正在滑动
        searchQuery: "", // 搜索关键词
    },
    // 监听输入框内容
    onSearchInput(e) {
        this.setData({
            searchQuery: e.detail.value.trim(),
        });
    },
    // 执行搜索
    onSearch() {

        // 重置分页参数并重新获取数据
        this.setData({
            page: 1,
            items: [],
            hasMore: true,
        });
        this.getItems(); // 获取数据
    },

    onLoad(options) {
        const {
            id,
            name
        } = options; // 接收上层传递的 id 和 name
        this.setData({
            folderId: id,
            folderName: name, // 设置文件夹名称
            hasMore: true,
        });
        this.getItems(); // 获取文件夹内文件列表
    },
    // 长按复制 URL
    copyUrl(e) {
        const {
            url
        } = e.currentTarget.dataset;
        wx.setClipboardData({
            data: url,
            success: () => wx.showToast({
                title: '已复制 URL',
                icon: 'success'
            }),
        });
    },

    // 获取文件列表（分页）
    getItems() {
        if (!this.data.hasMore) {
            console.log("没有更多数据");
            return;
        }

        request('/source/folder/items', 'get', {
                folderId: this.data.folderId,
                page: this.data.page,
                pageSize: this.data.pageSize,
                name: this.data.searchQuery, // 传递搜索关键词
            })
            .then((res) => {
                if (res.code === 0) {
                    const newItems = res.data.list || [];
                    this.setData({
                        items: [...this.data.items, ...newItems],
                        hasMore: newItems.length === this.data.pageSize, // 如果返回的数据小于页大小，则认为没有更多数据
                        page: this.data.page + 1, // 页码加 1
                    });
                }
            })
            .catch((err) => console.log("请求失败：", err));
    },

    // 下拉触底加载更多
    onReachBottom() {
        this.getItems();
    },
    // 右滑取消删除按钮
    onTouchStart(e) {
        this.setData({
            startX: e.changedTouches[0].clientX
        });
    },
    onTouchMove(e) {
        const touchMoveX = e.changedTouches[0].clientX;
        const diffX = this.data.startX - touchMoveX;
        console.log(diffX)
        // 计算左滑距离
        if (diffX > 30) {
            console.log("左滑")
            const itemId = e.currentTarget.dataset.id;
            const updatedItems = this.data.items.map(item => {
                if (item.id === itemId) {
                    item.showDelete = true; // 显示删除按钮
                }
                return item;
            });
            this.setData({
                items: updatedItems,
                isSliding: true,
            });
        }
        // 右滑取消删除按钮
        else if (diffX < -30 && this.data.isSliding) {
            console.log("右滑")
            const itemId = e.currentTarget.dataset.id;
            const updatedItems = this.data.items.map(item => {
                if (item.id === itemId) {
                    item.showDelete = false; // 隐藏删除按钮
                }
                return item;
            });
            this.setData({
                items: updatedItems,
                isSliding: false,
            });
        }
    },

    onTouchEnd() {
        this.setData({
            isSliding: false
        });
    },
    // 删除文件
    deleteItem(e) {
        const {
            id
        } = e.currentTarget.dataset;
        const updatedItems = this.data.items.filter(item => item.id !== id);
        this.setData({
            items: updatedItems
        });

        // 调用删除接口
        request('/source/folder/delete', 'post', {
                id
            })
            .then((res) => {
                if (res.code === 0) {
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                } else {
                    wx.showToast({
                        title: '删除失败',
                        icon: 'none'
                    });
                }
            })
            .catch((err) => {
                console.log('删除失败：', err);
                wx.showToast({
                    title: '删除失败',
                    icon: 'none'
                });
            });
    },

    // 打开手机媒体库并上传文件
    onUpload() {
        wx.chooseMedia({
            count: 9, // 最多选择 9 个文件
            mediaType: ['image', 'file'], // 支持图片和文件类型
            sourceType: ['album'], // 从相册中选择
            success: (res) => {
                this.uploadFiles(res.tempFiles); // 调用上传函数
            },
        });
    },

    // 上传文件到后端并新增记录
    uploadFiles(files) {
        this.setData({
            isUploading: true
        }); // 设置上传状态

        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: app.BaseUrl + '/base/upload', // 替换为后端的上传接口
                    filePath: file.tempFilePath, // 文件路径
                    name: 'file', // 文件表单字段名
                    formData: {
                        folderId: this.data.folderId, // 附带参数
                    },
                    header: {
                        Authorization: `Bearer ${wx.getStorageSync('token')}`, // 鉴权头部
                    },
                    success: (res) => {
                        const data = JSON.parse(res.data); // 解析返回的 JSON 数据
                        if (data.code === 0) {
                            resolve(data.data.file.url); // 只需要文件地址
                        } else {
                            reject(data.msg || '上传失败');
                        }
                    },
                    fail: (err) => {
                        reject(err); // 上传失败
                    },
                });
            });
        });

        // 上传完成后新增记录
        Promise.all(uploadPromises)
            .then((urls) => {
                this.addFolderRecord(urls); // 调用新增接口
            })
            .catch((err) => {
                console.log("上传失败：", err);
                wx.showToast({
                    title: '上传失败',
                    icon: 'none'
                }); // 提示上传失败
            })
            .finally(() => {
                this.setData({
                    isUploading: false
                }); // 恢复上传状态
            });
    },

    // 调用新增记录接口
    addFolderRecord(imgUrls) {
        request('/source/folder/add', 'post', {
                imgUrl: imgUrls, // 所有上传的文件地址
                albumId: parseInt(this.data.folderId, 10), // 当前文件夹 ID
            })
            .then((res) => {
                if (res.code === 0) {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                    this.setData({
                        page: 1,
                        items: [],
                        hasMore: true
                    }); // 重置分页参数
                    this.getItems(); // 刷新文件列表
                } else {
                    wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                }
            })
            .catch((err) => {
                console.log("保存失败：", err);
                wx.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
            });
    },

    // 单击查看详情
    viewDetail(e) {
        const {
            id
        } = e.currentTarget.dataset;
        const selectedItem = this.data.items.find((item) => item.id === id);
        this.setData({
            selectedItem
        });
    },

    // 点击大图退出详情
    closeDetail() {
        this.setData({
            selectedItem: null
        });
    },

    // 显示/隐藏照片信息蒙版
    toggleInfo() {
        if (!this.data.selectedItem) {
            wx.showToast({
                title: '未选中任何文件',
                icon: 'none',
            });
            return;
        }
        this.setData({
            showInfo: !this.data.showInfo,
        });
    },


    // 关闭照片信息蒙版
    closeInfo() {
        this.setData({
            showInfo: false,
            isEditing: false
        });
    },

    // 开始编辑名称
    startEditing() {
        this.setData({
            isEditing: true
        });
    },

    // 更新输入框中的名称
    updateNameInput(e) {
        const newName = e.detail.value.trim();
        const selectedItem = {
            ...this.data.selectedItem,
            name: newName
        };
        this.setData({
            selectedItem
        });
    },

    // 保存编辑的名称
    saveName() {
        const {
            id,
            name
        } = this.data.selectedItem;
        request('/source/folder/update', 'post', {
            id,
            name
        }).then(() => {
            const items = this.data.items.map((item) =>
                item.id === id ? {
                    ...item,
                    name
                } : item
            );
            this.setData({
                items,
                isEditing: false
            });
        });
    },
      // 点击名称输入框时选中所有文字
      focusNameInput(e) {
        const input = e.detail.value;
        this.setData({
            selectionStart: 0,
            selectionEnd: input.length,
        });
    },

    // 阻止蒙版关闭（点击内容区域时）
    preventClose() {},
});