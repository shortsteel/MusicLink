var util = require('../../utils/util');
var app=getApp();

Page({

  data: {
    // tab切换  
    currentTab: 1,
    compatibility: app.globalData.compatibility,
    statusBarHeight: app.globalData.statusBarHeight,
    windowHeight: app.globalData.windowHeight
  },


  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getAllDataFromServer();
  },

  swichNav: function (e) {
    var that = this;
    var current = e.target.dataset.current;
    if (this.data.currentTab === current) {
      return false;
    } else {
      that.setData({
        currentTab: current,
      })
    }
  },

  swiperChange: function (e) {
    this.setData({
      currentTab: e.detail.current,
    })
  },

  //重新绑定数据，刷新world界面
  onShow: function () {
    this.getAllDataFromServer();
  },

  onPullDownRefresh:function(){
    var that=this;
    that.getAllDataFromServer();
    wx.stopPullDownRefresh();
  },

  upper: function (e) {
    var that = this;
    that.getAllDataFromServer();
    wx.stopPullDownRefresh();
  },

  getAllDataFromServer: function () {

    var that = this;

    var data = {
      requestType: "GetWorldSongs"
    }
    wx.showLoading({
      title: '加载中',
    })

    util.requestFromServer("GetWorldSongs", data).then((res) => {
      that.setAllData(res.data);
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  setAllData:function(data){

    var songs = data.songs;
    var worldList = [];

    for(var i in songs){
      var song = songs[i];
      var progress =  parseInt(song.reserved_clips / song.clip_number * 100);
      var create_time_read = util.getDiffTime(song.song_created_time/1000, true);
      var temp = {
        ids: {
          created_song_id: song.created_song_id,
          song_id: song.song_id,
        },
        avatar: song.avatar_url,
        initiatorNick: song.nickname,
        created_time: song.song_created_time,
        create_time_read: create_time_read,
        comment:song.message,
        music:{
          coverImg: song.cover_url,
          singer:song.artist,
          title: song.title,
        },
        progress: progress,
      }

      worldList.push(temp);
      
    }
    
    worldList = util.getSortedListByTime(worldList);
    wx.hideLoading();
    this.setData({
      worldList:worldList,
    })

  },

  onTapToDetail(event) {
    var ids = event.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '../select/select?created_song_id=' +ids.created_song_id+"&song_id="+ids.song_id+"&isShare="+'false', 
    })
  },

})