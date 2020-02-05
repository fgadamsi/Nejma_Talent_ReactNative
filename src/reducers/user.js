'use-strict'
import * as type from '../constants/ActionTypes'

const initialState = {
  netStatus: false,
  lang: 'en',
  textAlign: 'left',
  flexDirection: 'row',
  arr: [],
  videosArr: [],
  paymentsArr: [],
  avatarSource:null,
  allow: false,
  allow1: false,
  allow2: false,
  camAllow: false,
  refreshing: false,
  emailVerified: true,
  fbEmail: '',
  bankName: '',
  accHolderName: '',
  accNumber: '',
  ibanNumber: '',
  previewIsPause: false
};

const user = (state = initialState, action) => {

  switch (action.type) {
    case type.CHECK_INTERNET_CONNECTION:
    return {
      ...state,
      netStatus: action.netStatus
    }
    case type.LOGIN_EMAIL_PHONE:
    return {
      ...state,
      LoginEmailPhone: action.LoginEmailPhone
    }
    case type.THANKS_REGISTER_EMAIL:
    return {
      ...state,
      ThanksEmail: action.ThanksEmail
    }
    case type.LOGIN_DETAILS:
    return {
      ...state,
      loginID: action.loginID,
      loginName: action.loginName,
      loginBio: action.loginBio,
      loginImage: action.loginImage,
      loginHandel: action.loginHandel,
      loginProfessions: action.loginProfessions,
      loginEmail: action.loginEmail,
      accessToken : action.accessToken
    }
    case type.EMAIL_VERIFIED:
    return {
      ...state,
      emailVerified: action.emailVerified
    }
    case type.REGISTER_EMAIL_PHONE:
    return {
      ...state,
      RegisterEmail: action.RegisterEmail,
      RegisterCallingCode: action.RegisterCallingCode,
      RegisterPhone: action.RegisterPhone
    }
    case type.REGISTER_ID:
    return {
      ...state,
      registerID: action.registerID
    }
    case type.APP_LANG:
    return {
      ...state,
      lang: action.lang,
      textAlign: action.lang=='en'?'left':'right',
      flexDirection: action.lang=='en'?'row':'row-reverse',
    }
    case type.CAMERA_ID_MSG:
    return {
      ...state,
      userid: action.userid,
      requestid: action.requestid,
      requestname: action.requestname,
      msg: action.msg,
      requestindex: action.requestindex
    }
    case type.REJECT_ID:
    return {
      ...state,
      rejectid: action.rejectid,
      rejectuser: action.rejectuser,
      rejectindex: action.rejectindex
    }
    case type.USER_REQUESTS:
    return {
      ...state,
      arr: action.arr
    }
    case type.PROFILE_PIC:
    return {
      ...state,
      avatarSource: action.avatarSource
    }
    case type.VID_PATH:
    return {
      ...state,
      videosArr: action.videosArr
    }
    case type.PAY_LIST:
    return {
      ...state,
      paymentsArr: action.paymentsArr
    }
    case type.TOTAL_AMOUNT:
    return {
      ...state,
      totalAmount: action.totalAmount,
      pendingAmount: action.pendingAmount
    }
    case type.BUTTON_DISABLED:
    return {
      ...state,
      allow: action.allow
    }
    case type.BUTTON_DISABLED1:
    return {
      ...state,
      allow1: action.allow1
    }
    case type.BUTTON_DISABLED2:
    return {
      ...state,
      allow2: action.allow2
    }
    case type.CAM_DISABLED:
    return {
      ...state,
      camAllow: action.camAllow
    }
    case type.IS_ONLINE:
    return {
      ...state,
      online: action.online
    }
    case type.IS_VIP:
    return {
      ...state,
      isVip: action.isVip
    }
    case type.THUMBNAIL_PATH:
    return {
      ...state,
      thumbnail: action.thumbnail
    }
    case type.THUMBNAIL_UPLOAD_PATH:
    return {
      ...state,
      thumbnailUpload: action.thumbnailUpload
    }
    case type.VIDEO_PATH:
    return {
      ...state,
      videoPath: action.videoPath
    }
    case type.VIDEO_UPLOAD_PATH:
    return {
      ...state,
      videoPathUpload: action.videoPathUpload
    }
    case type.VIDEO_PLAY_PATH:
    return {
      ...state,
      playpath: action.playpath
    }
    case type.FACEBOOK_EMAIL:
    return {
      ...state,
      fbEmail: action.fbEmail
    }
    case type.RENDER_CHANGE_PRICE:
    return {
      ...state,
      minPrice: action.minPrice,
      maxPrice: action.maxPrice,
      gotPrice: action.gotPrice,
      percentageCut: action.percentageCut
    }
    case type.BANK_ACCOUNT_DETAILS:
    return {
      ...state,
      bankName: action.bankName,
      accHolderName: action.accHolderName,
      accNumber: action.accNumber,
      ibanNumber: action.ibanNumber
    }
    case type.PREVIEW_PAUSE:
    return {
      ...state,
      previewIsPause: action.previewIsPause
    }
    case type.CLEAR_ON_LOGOUT:
    return {
      ...state,
      arr: [],
      videosArr: [],
      paymentsArr: [],
      avatarSource:null,
      allow: false,
      allow1: false,
      allow2: false,
      camAllow: false,
      refreshing: false,
      emailVerified: true,
      fbEmail: '',
      bankName: '',
      accHolderName: '',
      accNumber: '',
      ibanNumber: ''
    }
    default:
    return state
  }
}

export default user
