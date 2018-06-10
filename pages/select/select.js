// pages/select/select.js
var util = require('../../utils/util');
var app=getApp();

Page({
  data: {
    songs:[],
    song_id:null,
    openId: "",
    userAvatar: "",
    clips:[],
    createdSongId:"",
    allOriginData:[],
  },

  onLoad: function (options) {
    var openid = wx.getStorageSync('openid');
    if(openid){
        var userAvatar = app.globalData.userInfo.avatarUrl;
        this.setData({
          openId: openid,
          userAvatar: userAvatar,
        })
    }

    // wx.getSetting({
    //   success: function (res) {
    //     console.log(res);
    //     if (res.authSetting['scope.userInfo']) {
    //       var userAvatar = app.globalData.userInfo.avatarUrl;
    //       var openid = wx.getStorageSync('openid');
    //       that.setData({
    //         openId: openid,
    //         userAvatar: userAvatar,
    //       })
    //     }
    //   }
    // })

    var isShare=options.isShare;
    var createdSongId=options.created_song_id;
    var songId = options.song_id;
    var that=this;

    //console.log(options);


    this.setData({
      createdSongId: createdSongId,
      song_id: songId,
      isShare:isShare
    })
    this.setSongsLyricsData();
  },

<<<<<<< HEAD
  // onUnload:function(){
  //   wx.switchTab({
  //     url: '../post/post',
  //   })
  // },
=======
>>>>>>> 00773c5a7930a469e2b1e127a6a6b92954243654

  //获取歌曲详细信息
  setSongsLyricsData: function () {

    var that=this;
    var data={
      requestType: "GetClips",
      song_id: this.data.song_id
    }

    util.requestFromServer("GetClips", data).then((res) => {
      //console.log("select: GetClips");
      //console.log(res);
      that.processRequestData(res);
      that.getGetCreatedClips();
    }).catch((err) => {
      console.log("请求失败");
    })

  },

  //获取歌曲已经被选择的情况
  getGetCreatedClips: function () {
    var that = this;
    var data = {
      requestType: "GetCreatedClips",
      createdSongId: this.data.createdSongId,
    }

    util.requestFromServer("GetCreatedClips", data).then((res) => {
      //console.log("select: request success");
      //console.log(res);
      that.processRequestData_Create(res);
    }).catch((err) => {
      console.log("请求失败");
    })
  },
  
  //绑定请求后的数据
  processRequestData_Create:function(res){
    var selected = res.data.selected_info;
    var songs = this.data.songs;
    var lyrics = songs.lyrics;
    var clips=[];
    for(var i in selected){

      if (selected[i].openid == this.data.openId){
        clips.push(selected[i].clip_count);
      }
      for(var j in lyrics){
        if (lyrics[j].clipCount == selected[i].clip_count){
          lyrics[j].selected_user_avatar = selected[i].avatar;
          lyrics[j].selected_user_openId = selected[i].openid;
          lyrics[j].isSelected = true;
          //isSing变量待确定
          // lyrics[selected[i].clip_count].isSing = null;
        }
      } 
    }

    this.setData({
      songs: songs,
      clips: clips
    })
  },


  //处理数据
  processRequestData:function(res){
    
    var allOriginData = res.data;

    var that = this;
    var songs={
      songId:res.data.song_id,
      music:{
        title:res.data.title,
        coverImg:res.data.cover_url,
        singer:res.data.artist,
      },
      lyrics:[],
    }


    for (var i in res.data.songs){
      var song =res.data.songs[i];
      //console.log(song);
      for (var j in song.lyric.lyrics) {
         var temp={
           lyric: song.lyric.lyrics[j].lyric,
           clipCount: song.clipCount,
           selected_user_avatar:null,
           selected_user_openId: null,
           isSelected: null,
           isSing:null,
         }
         songs.lyrics.push(temp);
      }
    }
    that.setData({
      songs:songs,
      allOriginData:allOriginData,
    })
  },


  selectLyrics:function(event){

    var lyricId = event.currentTarget.dataset.lyricId;
    var songs = this.data.songs;
    var lyrics = songs.lyrics[lyricId];
    var clipCount = songs.lyrics[lyricId].clipCount;

    if(this.check()){
      if (this.data.openId == lyrics.selected_user_openId || lyrics.selected_user_openId == null) {
        var clips = [];
        if (lyrics.isSelected) {
          for (var i in this.data.clips) {
            if (this.data.clips[i] != lyrics.clipCount) {
              clips.push(this.data.clips[i])
            }
          }
        } else {
          for (var i in this.data.clips) {
            clips.push(this.data.clips[i])
          }
          clips.push(lyrics.clipCount);
        }

        for (var i in songs.lyrics) {
          if (songs.lyrics[i].clipCount == clipCount) {

            var lyric = songs.lyrics[i];
            //对未选择的歌词换头像,修改OpenId
            if (!lyric.isSelected) {
              lyric.selected_user_avatar = this.data.userAvatar;
              lyric.selected_user_openId = this.data.openId;
            } else {
              lyric.selected_user_avatar = null;
              lyric.selected_user_openId = null;
            }
            lyric.isSelected = !lyric.isSelected;
          }
        }

        this.setData({
          songs: songs,
          clips: clips
        })
      }
    }   
  },


  // 锁定已选择歌词，给出交互信息，
  // 对成功锁定的歌词进行成功反馈，对锁定失败的歌词进行失败反馈
  // 锁定后可再次进行，锁定，解锁
  lock:function(){

    if(this.check()){
      var that = this;
      var data = {
        requestType: "CreateClips",
        createdSongId: this.data.createdSongId,
        openid: this.data.openId,
        clips: this.data.clips.sort(function (a, b) {
          return a - b;
        }),
      }

      util.requestFromServer("CreateClips", data).then((res) => {

        this.processRequestData_Create(res);

        var failedString = "";
        var successString = "";
        var success = res.data.succeed.sort(function (a, b) {
          return a - b;
        });
        var failed = res.data.failed.sort(function (a, b) {
          return a - b;
        });

        if (success.length > 0) {
          successString = '成功锁定第';
          for (var i in success) {
            if (i == 0) {
              successString = successString + '' + success[i];
            } else {
              successString = successString + '.' + success[i];
            }
          }
          successString = successString + "段";
        }



        if (failed.length > 0) {
          failedString = " 失败锁定第";
          for (var i in failed) {
            if (i == 0) {
              failedString = failedString + '' + failed[i];
            } else {
              failedString = failedString + '.' + failed[i];
            }
          }
          failedString = failedString + "段";
        }

        var content = successString + failedString;
        if (content == "") {
          wx.showModal({
            title: "提示",
            content: "你还没选任何数据喔",
          })
        } else {
          wx.showModal({
            title: '提示',
            content: successString + failedString,
            showCancel: false,
            confirmText: "确定",
          })
        }
      }).catch((err) => {
        console.log("请求失败");
      })
    }

  },

  // 对整个选择整体提交服务器，点击后不能再选
  //提交后跳转至唱歌界面
  handon:function(){

    if(this.data.clips.length==0){
      wx.showModal({
        title:"提示",
        content:"你还没选任何数据喔",
      })
      return;
    }

    this.lock();
    wx.setStorageSync("selectedData", this.data);
    wx.redirectTo({
      url: '../sing/sing?songId=' + this.data.song_id,
    })
  },


  onShareAppMessage:function(res){
    if (res.from === 'menu') {
      console.log(res.target)
    }
    var isShare=true;
    var category='Select';
    return {
      title: '连音符', 
      path: '/pages/welcome/welcome?isShare=' + isShare + '&created_song_id=' + this.data.createdSongId + '&song_id=' + this.data.songs.songId + '&category=' + category,
      imageUrl:this.data.songs.music.coverImg,
    }
  },


  check:function(){
    //未授权无法使用该功能
    var openid = wx.getStorageSync("openid");
    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '未授权，该功能无法使用，请前往"我的-设置-授权"进行授权',
        showCancel: true,
        confirmText: "前往",
        confirmColor: "#52a2d8",
        success: function (res) {
          //确认打开设置界面进行授权
          if (res.confirm) {
            wx.switchTab({
              url: '../me/me',
            })
          }
        }
      });
      return false;
    }else{
      return true;
    }
  },



})

