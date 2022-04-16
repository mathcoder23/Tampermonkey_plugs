// ==UserScript==
// @name         Youtube SupLoop Tools
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      http://code.jquery.com/jquery-2.1.1.min.js
// ==/UserScript==

let showPanel = false
let yuVideo = null
let setuping = false
let tagList = [{
    time: 0
}]
let timeout = null
const setupHtml = () => {
    if(setuping === true){
        return
    }
    tagList = [{
        time: 0
    }]
    $('#supLoopPanel').remove()
    setuping = true
    console.log('set up html', $)
    let ele = `
    <div style="display: flex;cursor:pointer;    margin-top: -5px;
    align-content: center;
    align-items: center;" id="supLoopButton">
       <div class='yt-icon-container yt-icon style-scope ytd-button-renderer' ><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"> <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" class="style-scope yt-icon"></path> </g></svg></div>
       <div id="supLoop" style="font-weight: bold;
    font-size: small;" class="style-scope ytd-button-renderer style-default size-default" aria-label="Loop">SupLoop</div>
    </div>
     `
    $('#top-level-buttons-computed').append(ele)

    // insert panel
    let panel = `
       <div id="supLoopPanel">
           <div style="padding:10px;font-weight: bold;">
           Welcome SupLoop!
           </div>
           <div id="supLoopTagList">

           </div>
       </div>
    `
    $('#meta').before(panel)

    $('#supLoop').click(() => {
        switchPanel()
    })
    setuping = false
}

const switchPanel = (showPanel) => {
    let show = $('#supLoopPanel').toggle()
}

const keyEvent = (e) => {
    console.log('key', e.keyCode)

    if (e.keyCode === 65) {
        insertTag()
        renderTagList()
    } else if (e.keyCode === 71) {
        goTag()
    } else if (e.keyCode === 83) {
        stopTag()
    }
}

const insertTag = () => {
    let v = $('video')[0]
    for (let i = 0; i < tagList.length - 1; i++) {
        tagList[i].isLoop = false

    }
    tagList.push({
        time: v.currentTime,
        isLoop: true
    })


}

const goTag = () => {
    if (null !== timeout) {
        clearTimeout(timeout)
        timeout = null
    }
    if (tagList.length > 1) {
        startVideo(tagList[tagList.length - 2].time, tagList[tagList.length - 1].time)
    }

}

const stopTag = () => {
    if (null !== timeout) {
        clearTimeout(timeout)
        timeout = null
    }
}

const renderTagList = () => {
    let tagListHtml = '<div style="display:flex;">'
    let i = 0
    for (let tag of tagList) {
        let tagId = `supLoopTag${i}`
        tagListHtml += `<div class='loop_tag ${tag.isLoop?'loop_active':''}' id="${tagId}" >${formatTime(tag.time)}</div>`

        i++
    }
    tagListHtml += `
    </div>
    <style>
        .loop_tag{
    margin-left: 10px;
    padding: 5px;
    background: gray;
    cursor: pointer;
        }

        .loop_active{
        background: #3ccccc;
        }


    </style>
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

const checkSetup = ()=>{

    $(document).keydown(function (e) {
        keyEvent(e)
    });

    setInterval(()=>{
        if(!$('#supLoopButton')[0]){
            setupHtml()
        }
    },1000)
}

(function () {
    'use strict';
    checkSetup()

    // Your code here...
})();
