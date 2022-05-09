// ==UserScript==
// @name         Youtube Api SupLoop Tool
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       You
// @match        https://youtube.googleapis.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      https://code.jquery.com/jquery-2.2.4.js
// @require      https://raw.githubusercontent.com/mathcoder23/Tampermonkey_plugs/main/youtube_SupLoop/framework/vue%402.5.16.js
// ==/UserScript==

const supLoopPanelVueHtml = `
<style>
               .sup-loop-panel-head{
                    justify-content: space-between;
                    display: flex;
                    padding:10px;
                    font-weight: var(--ytd-tab-system_-_font-weight);
                    color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));
                    font-size: small;
               }

           </style>
      <div id="supLoopPanel" >

           <div class="sup-loop-panel-head" style="">
               <div>
                <span>Welcome {{name}}(v0.0.1)</span>
                <span style="margin-left:20px;" >Status:{{status}}</span> <span style="margin-left:10px;" v-if="status==='Looping'">{{loopCount}}</span>
               </div>
               <div>
                 <span><a style="text-decoration:none;color:#CCFFFF" target="_blank" href="https://github.com/mathcoder23/Tampermonkey_plugs/tree/main/youtube_SupLoop">Help</a></span>
               </div>

           </div>
            <div id="supLoopTagList" >
                <div style="display:flex;flex-wrap: wrap;" >
                    <div v-for="(item,index) in timePointList" class='loop_tag ' :class="{'loop_active':item.isLoop,'loop_select':item.isSelect}"
                    @click="clickTimePoint(index,item)"
                    @dblclick="dblclickTimePoint(index,item)"
                    >{{formatTime(item.time)}}</div>
                </div>
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
                } else if (e.keyCode === 32){
                    // key space
                    this.stopLoop()
                } else if (e.keyCode === 84){
                    // key t
                    $('#supLoopContainer').toggle()
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
                let realSpaceTime = (endTime - startTime)/(video.playbackRate)
                console.log('real space time',realSpaceTime)
                this.loopTimeout = setTimeout(() => {
                    this.loopCount++
                    this.startVideo(startTime, endTime)

                }, realSpaceTime * 1000)
            },
            saveRecord() {
                let record = {
                    showPanel: this.showPanel,
                    timePointList: this.timePointList
                }
                // close storage. iframe can't read location.href
                //localStorage.setItem('supLoopRecord-' + location.href, JSON.stringify(record))
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

            $('video')[0].addEventListener("pause",()=>{
                console.log('yb pause')
                this.stopLoop()
            })

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
    <button id="supLoopButton" class="ytp-subtitles-button ytp-button" aria-label="Subtitles/closed SupLoop ()" style="margin: 0px auto;display: inline-flex;justify-content: center;align-items: center;" aria-pressed="false" title="Subtitles/closed SupLoop ()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="100%" class="ytp-subtitles-button-icon"><path fill="none" d="M0 0h24v24H0z"></path><path d="M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3A8 8 0 0 0 6.46 6.228l-.997-1.795zm13.074 15.134A9.961 9.961 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 0 13.54 5.772l.997 1.795z" fill="rgba(255,255,255,1)"></path></svg></button>
     `
    let supLoopContainer = `
    <style>
       .sup-loop-container{
           padding:10px;
           min-width:50%;
           max-width: 95%;
       }
    </style>
    <div id="supLoopContainer" class="html5-video-info-panel sup-loop-container" ></div>
    `
    $('.ytp-right-controls').prepend(eleBtn2)

    // insert panel

    $('body').append(supLoopContainer)
    $('#supLoopContainer').append(supLoopPanelVueHtml)

    $('#supLoopButton').click(() => {
        switchPanel()
    })
    supLoopPanelHandler()

    setuping = false
}

const switchPanel = (showPanel) => {
    let show = $('#supLoopContainer').toggle()
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
