<template>
    <div id="root"></div>
</template>

<script>
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
export default {
    mounted() {
        function getUrlParams(url) {
            let urlStr = url.split('?')[1];
            const urlSearchParams = new URLSearchParams(urlStr);
            const result = Object.fromEntries(urlSearchParams.entries());
            return result;
        }
        const roomID = getUrlParams(window.location.href)['roomId'];
        const userID = Math.floor(Math.random() * 10000) + "";
        const userName = getUrlParams(window.location.href)['username'] || "userName" + userID;
        const appID = 1318607626;
        const serverSecret = "3c9b7c7e438691867e3bff362692e46b";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, userID, userName);

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: document.querySelector("#root"),
            sharedLinks: [{
                name: 'Personal link',
                url: window.location.protocol + '//' + window.location.host  + window.location.pathname + '?roomID=' + roomID,
            }],
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
                
            turnOnMicrophoneWhenJoining: false,
            turnOnCameraWhenJoining: false,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 2,
            layout: "Auto",
            showLayoutButton: false, 
        });
    }
}
</script>

<style>
#root {
    width: 100vw;
    height: 100vh;
}
</style>
    