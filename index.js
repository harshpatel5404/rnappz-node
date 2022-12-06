var express = require("express");
var app = express();

const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const dotenv = require('dotenv');


const APP_ID = "b5f0a556875747a7a39aa9b75246e76d"
const APP_CERTIFICATE = "20141a8c96c145f297c3128c4d728984"


app.get("/", (req,res)=>{
  res.send("demo start....");
})

  
const nocache = (_, resp, next) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
  }
  
  
  const generateRTCToken = (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');
  
    const channelName = req.params.channel;
    if (!channelName) {
      return resp.status(500).json({ 'error': 'channel is required' });
    }
    let uid = req.params.uid;
    if (!uid || uid === '') {
      return resp.status(500).json({ 'error': 'uid is required' });
    }
    // get role
    let role;
    if (req.params.role === 'publisher') {
      role = RtcRole.PUBLISHER;
    } else if (req.params.role === 'audience') {
      role = RtcRole.SUBSCRIBER
    } else {
      return resp.status(500).json({ 'error': 'role is incorrect' });
    }
  
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
      expireTime = 3600;
    } else {
      expireTime = parseInt(expireTime, 10);
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    let token;
    if (req.params.tokentype === 'userAccount') {
      token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else if (req.params.tokentype === 'uid') {
      token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else {
      return resp.status(500).json({ 'error': 'token type is invalid' });
    }
  
    return resp.json({ 'rtcToken': token })
  };


app.get('/rtc/:channel/:role/:tokentype/:uid', nocache, generateRTCToken)

app.listen(process.env.PORT || 3000, () => {
 console.log('Server running on 3000');
});