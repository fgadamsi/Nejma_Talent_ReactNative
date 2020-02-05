'use strict';
import * as type from '../constants/ActionTypes'
import{AsyncStorage} from 'react-native'

export const checkInternet = (netStatus)=> {
  return {
    type: type.CHECK_INTERNET_CONNECTION,
    netStatus
  }
}

export const setLoginEmailPhone = (LoginEmailPhone)=> {
  return {
    type: type.LOGIN_EMAIL_PHONE,
    LoginEmailPhone
  }
}
export const setRegisterEmail = (ThanksEmail)=> {
  return {
    type: type.THANKS_REGISTER_EMAIL,
    ThanksEmail
  }
}
export const setLoginDetails = (loginID, loginName, loginBio, loginImage, loginHandel, loginProfessions, loginEmail, accessToken)=> {
  return {
    type: type.LOGIN_DETAILS,
    loginID,
    loginName,
    loginBio,
    loginImage,
    loginHandel,
    loginProfessions,
    loginEmail, accessToken
  }
}
export const setEmailVerified = (emailVerified)=> {
  return {
    type: type.EMAIL_VERIFIED,
    emailVerified
  }
}
export const setRegisterEmailPhone = (RegisterEmail, RegisterCallingCode, RegisterPhone)=> {
  return {
    type: type.REGISTER_EMAIL_PHONE,
    RegisterEmail,
    RegisterCallingCode,
    RegisterPhone
  }
}
export const setRegisterId = (registerID)=> {
  return {
    type: type.REGISTER_ID,
    registerID
  }
}
export const setLanguage = (lang)=> {
  return {
    type: type.APP_LANG,
    lang
  }
}
export const setCameraMsgId = (userid, requestid, requestname, msg, requestindex)=> {
  return {
    type: type.CAMERA_ID_MSG,
    userid,
    requestid,
    requestname,
    msg,
    requestindex
  }
}
export const setRejectId = (rejectid, rejectuser, rejectindex)=> {
  return {
    type: type.REJECT_ID,
    rejectid,
    rejectuser,
    rejectindex
  }
}
export const setUserRequests = (arr)=> {
  return {
    type: type.USER_REQUESTS,
    arr
  }
}
export const setVideosList = (videosArr)=> {
  return {
    type: type.VID_PATH,
    videosArr
  }
}
export const setPaymentList = (paymentsArr)=> {
  return {
    type: type.PAY_LIST,
    paymentsArr
  }
}
export const setTotalAmount = (totalAmount, pendingAmount)=> {
  return {
    type: type.TOTAL_AMOUNT,
    totalAmount,
    pendingAmount
  }
}
export const setProfileImage = (avatarSource)=> {
  return {
    type: type.PROFILE_PIC,
    avatarSource
  }
}
export const ButtonDisabled = (allow)=> {
  return {
    type: type.BUTTON_DISABLED,
    allow
  }
}
export const ButtonDisabled1 = (allow1)=> {
  return {
    type: type.BUTTON_DISABLED1,
    allow1
  }
}
export const ButtonDisabled2 = (allow2)=> {
  return {
    type: type.BUTTON_DISABLED2,
    allow2
  }
}
export const CamDisabled = (camAllow)=> {
  return {
    type: type.CAM_DISABLED,
    camAllow
  }
}
export const setOnline = (online)=> {
  return {
    type: type.IS_ONLINE,
    online
  }
}
export const setVip = (isVip)=> {
  return {
    type: type.IS_VIP,
    isVip
  }
}
export const setThumbnail = (thumbnail)=> {
  return {
    type: type.THUMBNAIL_PATH,
    thumbnail
  }
}
export const setThumbnailUpload = (thumbnailUpload)=> {
  return {
    type: type.THUMBNAIL_UPLOAD_PATH,
    thumbnailUpload
  }
}
export const setVideo = (videoPath)=> {
  return {
    type: type.VIDEO_PATH,
    videoPath
  }
}
export const setVideoUpload = (videoPathUpload)=> {
  return {
    type: type.VIDEO_UPLOAD_PATH,
    videoPathUpload
  }
}
export const setPlayVideo = (playpath)=> {
  return {
    type: type.VIDEO_PLAY_PATH,
    playpath
  }
}
export const setFacebookEmail = (fbEmail)=> {
  return {
    type: type.FACEBOOK_EMAIL,
    fbEmail
  }
}
export const renderChangePrice = (minPrice, maxPrice, gotPrice, percentageCut)=> {
  return {
    type: type.RENDER_CHANGE_PRICE,
    minPrice,
    maxPrice,
    gotPrice,
    percentageCut
  }
}
export const bankAccountDetails = (bankName, accHolderName, accNumber, ibanNumber)=> {
  return {
    type: type.BANK_ACCOUNT_DETAILS,
    bankName,
    accHolderName,
    accNumber,
    ibanNumber
  }
}
export const previewPause = (previewIsPause)=> {
  return {
    type: type.PREVIEW_PAUSE,
    previewIsPause
  }
}
export const clearOnLogout = ()=> {
  return {
    type: type.CLEAR_ON_LOGOUT
  }
}
