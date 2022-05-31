// ==UserScript==
// @name         Youtube Download Tools
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @require      https://code.jquery.com/jquery-2.2.4.js
// @require      https://raw.githubusercontent.com/mathcoder23/Tampermonkey_plugs/main/youtube_SupLoop/framework/vue%402.5.16.js
// ==/UserScript==



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
    $('#downloadButton').remove()
    setuping = true
    console.log('set up html', $)
    let ele = `
    <div style="display: flex;cursor:pointer;    margin-top: -5px;
    align-content: center;
    align-items: center;" id="downloadButton">
       <div style="width: 24px;height: 24px;color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));" class='yt-icon-container yt-icon style-scope ytd-button-renderer' ><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon"><path d="M17 18V19H6V18H17ZM16.5 11.4L15.8 10.7L12 14.4V4H11V14.4L7.2 10.6L6.5 11.3L11.5 16.3L16.5 11.4Z" class="style-scope yt-icon"></path></g></svg></div>
       <div id="supLoop" style="font-weight: var(--ytd-tab-system_-_font-weight);color:var(--yt-button-icon-button-text-color,var(--yt-spec-text-secondary));
    font-size: small;" class="style-scope ytd-button-renderer style-default size-default" aria-label="Loop">Download</div>
    </div>
     `
    $('#top-level-buttons-computed').append(ele)

    // insert panel


    $('#downloadButton').click(() => {
        window.open('https://audio.rip/'+location.href)
    })
   

    setuping = false
}




const checkSetup = () => {



    setInterval(() => {
        if (location.href !='https://www.youtube.com/' && !$('#downloadButton')[0]) {
            setupHtml()
        }
    }, 1000)
}

(function () {
    'use strict';

    checkSetup()

})();
