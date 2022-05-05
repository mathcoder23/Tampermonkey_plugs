// ==UserScript==
// @name         Drive Google SupLoop Tools
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       You
// @match        https://youtube.googleapis.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @require      https://code.jquery.com/jquery-2.2.4.js
// @require      https://raw.githubusercontent.com/mathcoder23/Tampermonkey_plugs/main/youtube_SupLoop/framework/vue%402.5.16.js
// ==/UserScript==

const supLoopPanelVueHtml = `
      <div id="supLoopPanel" style="display: none;">
           <div style="padding:10px;font-weight: var(--ytd-tab-system_-_font-weight);color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));font-size: small;">

           <span>Welcome {{name}}!</span>
           <span style="margin-left:20px;" >Status:{{status}}</span> <span style="margin-left:10px;" v-if="status==='Looping'">{{loopCount}}</span>
           </div>
            <div id="supLoopTagList" >
                <div style="display:flex;flex-wrap: wrap;" >
                    <div v-for="(item,index) in timePointList" class='loop_tag ' :class="{'loop_active':item.isLoop,'loop_select':item.isSelect}"
                    @click="clickTimePoint(index,item)"
                    @dblclick="dblclickTimePoint(index,item)"
                    >{{formatTime(item.time)}}</div>
                </div>
            </div>

            <div style="padding:10px;font-weight: var(--ytd-tab-system_-_font-weight);color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));font-size: small;">
                <p>Help: </p>
                <p>keydown: key a is insert point</p>
                <p>keydown: key g is start loop</p>
                <p>keydown: key s is stop loop</p>
                <p>click timePoint is switch loop section</p>
                <p>double click timePoint is delete timePoint</p>
                <p>version: 1.0.0</p>
            </div>
       </div>
       <style>
            .loop_tag{
                margin-left: 10px;
                padding: 5px;
                background: gray;
                cursor: pointer;
                margin-bottom: 10px;
            }
            .loop_active{
                background: #3ccccc;
            }
            .loop_select {
                border-bottom: 4px solid #FF9966;
                margin-bottom: 6px;
            }
        </style>
`

const supLoopPanelHandler = () => {
    window.supLoopVueApp = new Vue({
        el: "#supLoopPanel",
        data: {
            name: "SupLoop",
            timePointList: [
                {
                    time: 0,
                    isLoop: false
                }
            ],

            loopTimeout: null,
            status: 'StopLoop',
            currentHref: '',
            lastSelectIndex: null,
            loopCount: 0
        },
        methods: {
            formatTime(time) {
                var ms = (time - parseInt(time)).toFixed(3) * 1000
                var h = Math.floor(time / 3600);
                var m = Math.floor((time / 60 % 60));
                var s = Math.floor((time % 60));
                if (h < 1) {
                    return (m < 10 ? ('0' + m) : (m)) + ":" + (s < 10 ? ('0' + s) : (s)) + "." + ms;
                } else {
                    return (h < 10 ? ('0' + h) : (h)) + ":" + (m < 10 ? ('0' + m) : (m)) + ":" + (s < 10 ? ('0' + s) : (s)) + "." + ms;
                }
            },
            clickTimePoint(index, timePoint) {
                let video = $('video')[0]
                video.currentTime = timePoint.time
                this.clearTimePointStatus()
                this.stopLoop()

                this.timePointList[index].isLoop = true
                this.timePointList[index].isSelect = true

                if (index < this.timePointList.length - 1) {
                    this.timePointList[index + 1].isLoop = true
                }
            },
            dblclickTimePoint(index, timePoint) {
                this.stopLoop()
                this.timePointList.splice(index, 1)
                this.saveRecord()
            },
            onKeydown(e) {
                console.log('key', e.keyCode)

                if (e.keyCode === 65) {
                    // key a
                    this.insertTimePoint()
                } else if (e.keyCode === 71) {
                    // key g

                    this.goLoop()
                } else if (e.keyCode === 83) {
                    // key s

                    this.stopLoop()
                } else if (e.keyCode === 81) {
                    // key q
                    this.qucklyModifyTimePoint(-0.25)
                } else if (e.keyCode === 82) {
                    // key r
                    this.qucklyModifyTimePoint(0.25)
                }
            },
            clearTimePointStatus() {
                for (let item of this.timePointList) {
                    item.isLoop = false
                    item.isSelect = false
                }
            },
            insertTimePoint() {
                let v = $('video')[0]
                this.clearTimePointStatus()
                this.timePointList[this.timePointList.length - 1].isLoop = true
                this.timePointList.push({
                    time: v.currentTime,
                    isLoop: true,
                    isSelect: true
                })
                this.saveRecord()
            },
            qucklyModifyTimePoint(time) {
                for (let index in this.timePointList) {
                    if (this.timePointList[index].isSelect) {
                        this.modifyTimePoint(index, { time: this.timePointList[index].time + time })
                        return
                    }
                }
            },
            modifyTimePoint(index, obj) {
                this.stopLoop()

                this.$set(this.timePointList, index, Object.assign(this.timePointList[index], obj))

                let video = $('video')[0]
                video.currentTime = this.timePointList[index].time
                video.play()

                this.saveRecord()
            },
            goLoop() {
                this.stopLoop()

                this.status = 'Looping'
                if (this.timePointList.length > 1) {
                    // search loop index
                    let startLoop = null
                    let endLoop = null
                    for (let i = 0; i < this.timePointList.length; i++) {
                        if (null === startLoop && this.timePointList[i].isLoop) {
                            startLoop = this.timePointList[i]
                        }
                        let j = this.timePointList.length - i - 1
                        if (null === endLoop && this.timePointList[j].isLoop) {
                            endLoop = this.timePointList[j]
                        }
                    }
                    console.log('startLoop', startLoop, 'endLoop', endLoop)
                    this.startVideo(startLoop.time, endLoop.time)
                }

            },
            stopLoop() {
                this.status = 'Stop Loop'
                if (null !== this.loopTimeout) {
                    clearTimeout(this.loopTimeout)
                    this.loopTimeout = null
                }
                this.loopCount = 0

            },
            startVideo(startTime, endTime) {
                if (this.currentHref !== location.href) {
                    console.log('close loop:', this.currentHref, location.href)
                    this.stopLoop()
                    return
                }

                if (!startTime || !endTime) {
                    console.log('close loop')
                    this.stopLoop()
                    return
                }

                if (endTime - startTime < 0.5) {
                    console.log('close loop,endTime - startTime=', endTime - startTime)
                    this.stopLoop()
                    return
                }

                console.log('startVideoLoop', startTime, endTime)
                let video = $('video')[0]
                video.currentTime = startTime
                video.play()
                this.loopTimeout = setTimeout(() => {
                    this.loopCount++
                    this.startVideo(startTime, endTime)

                }, (endTime - startTime) * 1000)
            },
            saveRecord() {
                let record = {
                    showPanel: this.showPanel,
                    timePointList: this.timePointList
                }
                localStorage.setItem('supLoopRecord-' + location.href, JSON.stringify(record))
            },
            loadRecord() {
                let str = localStorage.getItem('supLoopRecord-' + location.href)
                if (str && str.length > 0) {
                    try {
                        this.record = JSON.parse(str)
                        this.timePointList = this.record.timePointList
                        this.showPanel = this.record.showPanel
                        console.log('load record', this.record)
                    } catch (e) {
                        console.log('err', e)
                        localStorage.removeItem('supLoopRecord-' + location.href)
                    }
                }
            }
        },
        mounted() {
            $(document).keydown((e) => {
                this.onKeydown(e)
            });
            this.currentHref = location.href
            console.log('mounted supLoopPanel')
            this.stopLoop()

            this.loadRecord()
        }
    });
}

let showPanel = false
let yuVideo = null
let setuping = false
let tagList = [{
    time: 0
}]
let timeout = null
const setupHtml = () => {
    if (setuping === true) {
        return
    }
    tagList = [{
        time: 0
    }]
    $('#supLoopContainer').remove()
    setuping = true
    console.log('set up html', $)
    let eleBtn = `
    <div style="display: flex;cursor:pointer;    margin-top: -5px;
    align-content: center;
    align-items: center;" id="supLoopButton">
       <div style="width: 24px;height: 24px;color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));" class='yt-icon-container yt-icon style-scope ytd-button-renderer' ><svg style="width: 100%;height: 100%;" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" class="style-scope yt-icon"></path> </g></svg></div>
       <div id="supLoop" style="font-weight: var(--ytd-tab-system_-_font-weight);color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));
    font-size: small;" class="style-scope ytd-button-renderer style-default size-default" aria-label="Loop">SupLoop</div>
    </div>
     `
    let eleBtn2 = `
    <button id="supLoopButton" class="ytp-subtitles-button ytp-button" aria-label="Subtitles/closed SupLoop ()" style="" aria-pressed="false" title="Subtitles/closed SupLoop ()"><svg class="ytp-subtitles-button-icon" height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-16"></use><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" ></path></svg></button>
     `
    let supLoopContainer = `
    <div id="supLoopContainer"></div>
    `
    $('.ytp-right-controls').prepend(eleBtn2)

    // insert panel

    $('#supLoopContainer').append(supLoopPanelVueHtml)

    $('#supLoop').click(() => {
        switchPanel()
    })
    supLoopPanelHandler()

    setuping = false
}

const switchPanel = (showPanel) => {
    let show = $('#supLoopPanel').toggle()
}



const renderTagList = () => {
    let tagListHtml = '<div style="display:flex;">'
    let i = 0
    for (let tag of tagList) {
        let tagId = `supLoopTag${i}`
        tagListHtml += `<div class='loop_tag ${tag.isLoop ? 'loop_active' : ''}' id="${tagId}" >${formatTime(tag.time)}</div>`

        i++
    }
    tagListHtml += `
    </div>

    `
    $('#supLoopTagList').html(tagListHtml)

    for (let ii = 0; ii < tagList.length; ii++) {
        let tagId = `supLoopTag${ii}`
        $(`#${tagId}`).click(() => {
            clickTag(ii)
        })
        $(`#${tagId}`).dblclick(() => {
            doubleClickTag(ii)
        })
    }
}

const formatTime = (time) => {
    var h = Math.floor(time / 3600);
    var m = Math.floor((time / 60 % 60));
    var s = Math.floor((time % 60));
    if (h < 1) {
        return (m < 10 ? ('0' + m) : (m)) + ":" + (s < 10 ? ('0' + s) : (s));
    } else {
        return (h < 10 ? ('0' + h) : (h)) + ":" + (m < 10 ? ('0' + m) : (m)) + ":" + (s < 10 ? ('0' + s) : (s));
    }
}
const doubleClickTag = (index) => {
    console.log('tag', index)
    let time = prompt("Input modify time:", tagList[index].time)
    if (time) {
        tagList[index].time = time
    }

    renderTagList()
}
const clickTag = (index) => {
    let video = $('video')[0]
    video.currentTime = tagList[index].time
}

const loopVideo = (index) => {
    if (index > tagList.length - 1) {
        return
    }

}
const startVideo = (startTime, endTime) => {
    console.log('startVideo', startTime, endTime)
    let video = $('video')[0]
    video.currentTime = startTime
    video.play()
    timeout = setTimeout(() => {
        startVideo(startTime, endTime)
    }, (endTime - startTime) * 1000)
}

const checkSetup = () => {



    setInterval(() => {
        if (!$('#supLoopButton')[0]) {
            setupHtml()
        }
    }, 1000)
}

(function () {
    'use strict';

    checkSetup()

})();
