# SupLoop概述
> SupLoop可以帮助你自定义时间段的重复播放Youtube的视频。常见的应用可以是英语听力等训练，至于其他的应用场景，欢迎挖掘

# SupLoop支持
- 支持原生Youtube视频的播放，比如:https://youtube.com/ 的站点视频内容
- 支持基于内嵌Youtube视频的第三方网站，在很多情况下第三方网站会选择内嵌Youtube视频，SupLoop也支持它

# SupLoop安装指南
- 本插件基于[Tampermonkey插件](https://www.tampermonkey.net/)开发
- 在你的浏览器(推荐Firefox、Chrome)安装Tampermonkey插件,安装以及简单的安装详见官网
- 了解基本的Tampermonkey插件的使用

## SupLoop(原生Youtube版)安装
- 拷贝 `https://raw.githubusercontent.com/mathcoder23/Tampermonkey_plugs/main/youtube_SupLoop/Youtube_SupLoop_Tools.js`的js文件到Tampermonkey
- 进入Y站视频，视频右下方会多出`SupLoop`, 点击它便可开始使用

## SupLoop(内嵌Youtube版)安装
- 拷贝 `https://raw.githubusercontent.com/mathcoder23/Tampermonkey_plugs/main/youtube_SupLoop/YoutubeApi_SupLoop_Tool.js`的js文件到Tampermonkey
- 进入内嵌Y站视频的第三方网站(比如Google Drive视频)，视频右下方会多出一个循环按钮图标, 点击它便可开始使用

# 使用说明
> 插件的大部分功能是通过按快捷键完成的，这将提升你的使用效率，同时也增加了学习成本，但这对于一个下定决心要学习的小伙伴不是一件难事 
`内嵌Youtbue的视频，只能在获取视频焦点的条件下，快捷键才会生效`

## 快捷键说明
### 按键"a"
> 将当前时间点插入时间列表
> 
### 按键"g"
> 开始Loop选中(高亮)的时间片段

### 按键"s"
> 停止Loop

## 时间点操作
- 单击切换Video到该时间点，并自动选中改时间点以及下一个时间点为一个Loop时间片
- 双击时间点，删除时间

## 特点说明
- 按g后，会有Status现实状态
- 被暂停后，会自动取消Looping状态


# To Do
- audio waves by wavesurfer https://www.zhangxinxu.com/wordpress/2018/12/wavesurfer-js-mp3-audio-wave/  
- 支持实时语音波形比较
- 支持查看本地所有记录列表
- 支持通过github的json文件，读取共享的视频分段数据
- 合并Youtube原始与内嵌的代码

# 版本日志
## 0.0.1
- 新增 Loop计数器
- 修复 异常选中时，开始时间与结束时间异常的无限轮询bug
- 新增 版本号显示
- 支持 内嵌Youtbue视频
