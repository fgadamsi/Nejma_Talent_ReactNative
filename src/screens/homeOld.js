import React, { Component } from 'react';
import { Platform, Dimensions, SafeAreaView, ScrollView, Alert, Text, View, Image, TouchableOpacity, AsyncStorage, PermissionsAndroid, RefreshControl, FlatList } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import I18n from 'react-native-i18n';
import axios from 'axios';
import Spinner from 'react-native-spinkit';
import LinearGradient from 'react-native-linear-gradient';
import Permissions from 'react-native-permissions'
// import OneSignal from 'react-native-onesignal';
import FastImage from 'react-native-fast-image';
import colors  from '../../theme/colors';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isDisabled: false,
      refreshing: false,
      render: false,
      cameraPermission: false,
      photoPermission: false,
      microphonePermission: false
    }
    AsyncStorage.getItem('lang')
    .then((lang) => {
      if(lang==null) {
        if(I18n.currentLocale()=='ar') {
          this.asqw('ar');
          I18n.locale = 'ar';
          I18n.currentLocale();
        }
        else {
          this.asqw('en');
          I18n.locale = 'en';
          I18n.currentLocale();
        }
      }
      else {
        let getlang = JSON.parse(lang);
        if(getlang=='ar') {
          this.asqw('ar');
          I18n.locale = 'ar';
          I18n.currentLocale();
        }
        else {
          this.asqw('en');
          I18n.locale = 'en';
          I18n.currentLocale();
        }
      }
    })
  }
  asqw = async (getwq)=> {
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq)
    console.log(this.props.user.lang)
  }
  componentWillMount() {
    this.onOpened = this.onOpened.bind(this);
    this.onReceived = this.onReceived.bind(this);
    // OneSignal.addEventListener('received', this.onReceived);
    // OneSignal.addEventListener('opened', this.onOpened);
    // OneSignal.addEventListener('registered', this.onRegistered);
    // OneSignal.addEventListener('ids', this.onIds);
    // OneSignal.inFocusDisplaying(2)
  }
  loggedout = ()=>{
    return Alert.alert(
      '',
      string('globalValues.loggedout'),
      [
        {
          text: string('globalValues.AlertOKBtn'),
          onPress: async ()=> {
            this.setState({isDisabled: false, visible: false});
            try{
              this.setState({isDisabled: false})
            //  OneSignal.deleteTag("phone");
              this.props.actions.clearOnLogout()
              await AsyncStorage.removeItem('talent');
              Navigation.startSingleScreenApp({
                screen: {
                  screen: 'FamCamTalent.Splash',
                },
                appStyle: {
                  orientation: 'portrait'
                }
              })
            }
            catch(error){}
          }
        }
      ],
      { cancelable: false }
    )
  }
  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if(connectionInfo.type=='none' || connectionInfo.type=='unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);

    setTimeout(() => {
      if(!this.props.user.netStatus) {
        this.setState({isDisabled: false})
        return Alert.alert(
          '',
          string('globalValues.NetAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: ()=> {
              }
            }
          ],
          { cancelable: false }
        );
      }
      else{
        try {
          AsyncStorage.getItem('talent')
          .then((talent) => {
            if(talent!=null) {
              let qwe = JSON.parse(talent);
              let {actions} = this.props;
              console.log(qwe)
              actions.setLoginDetails(qwe.talentId, qwe.talentName, qwe.talentBio, qwe.talentImage, qwe.handel, qwe.professions, qwe.talentEmail);
              this.firstLoad(qwe.talentId)
            }
            else {

            }
          })
        }
        catch(error) {
          this.loggedout()
        }
      }
    }, 200);
  }

  componentWillUnmount() {
    this.props.actions.ButtonDisabled(false)
   //   OneSignal.removeEventListener('received', this.onReceived);
     // OneSignal.removeEventListener('opened', this.onOpened);
    //  OneSignal.removeEventListener('registered', this.onRegistered);
    //  OneSignal.removeEventListener('ids', this.onIds);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  componentWillReceiveProps() {
    this.setState({render: true})
  }

  onReceived(notification) {
    this.notificationRefresh()
  }
  onOpened(openResult) {
    this.notificationRefresh()
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
    if(openResult.notification.payload.additionalData) {
      if(openResult.notification.payload.additionalData.orderCompleted=='true') {
        Navigation.push(this.props.componentId, {
          component: {
            name: 'FamCamTalent.Profile',
            options: {
              topBar: {
                  visible: false
              }
            }
          }
        });
      
      }
    }
  }
  onRegistered(notifData) {
      console.log("Device had been registered for push notifications!", notifData);
  }
  onIds(device) {
    console.log(device);
  }
  firstLoad = async (talentid)=> {
    this.setState({isDisabled: true, visible: true})
    let values = {'talentId' : talentid}
    await axios.post(`${Appurl.apiUrl}talentBlockUnBlockStatus`, values)
    .then((response) => {
      console.log(response.data.userStatus)
      if(response.data.userStatus) {
        return this.loggedout()
      }
    }).catch((error) => {
      console.log(error)
      if(error.response.data.success == 0) {
        Alert.alert(
          '',
          error.response.data.msg,
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false})
              }
            }
          ],
          { cancelable: false }
        );
      }
    })
    await axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, values)
    .then((response) => {
      console.log(response)
      this.props.actions.setUserRequests(response.data.data)
      this.props.actions.setOnline(response.data.online)
      this.props.actions.setVip(response.data.vipAccepted)
    }).catch((error) => {
      console.log(error.response)
      if(error.response.data.success == 0) {
        Alert.alert(
          '',
          error.response.data.msg,
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false})
              }
            }
          ],
          { cancelable: false }
        );
      }
    })
    await axios.post(`${Appurl.apiUrl}checkTalentEmailverified`, values)
    .then((response) => {
      console.log(response)
      this.props.actions.setEmailVerified(response.data.isEmailVerified);
    }).catch((error) => {
      console.log(error.response)
      if(error.response.data.success == 0) {
        Alert.alert(
          '',
          error.response.data.msg,
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false})
              }
            }
          ],
          { cancelable: false }
        );
      }
    })
    setTimeout(()=> {
      this.setState({visible: false, isDisabled: false})
    }, 1000)
  }
  renderList = async ()=> {
    if(!this.props.user.netStatus) {
      this.setState({isDisabled: false, visible: false, refreshing: false})
      return Alert.alert(
        '',
        string('globalValues.NetAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: ()=> {
            }
          }
        ],
        { cancelable: false }
      );
    }
    else{
      this.setState({isDisabled: true})
      let values = {'talentId' : this.props.user.loginID}
      await axios.post(`${Appurl.apiUrl}talentBlockUnBlockStatus`, values)
      .then((response) => {
        console.log(response.data.userStatus)
        if(response.data.userStatus) {
          return this.loggedout()
        }
      }).catch((error) => {
        console.log(error)
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false, refreshing: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
      await axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, values)
      .then((response) => {
        console.log(response)
        this.props.actions.setUserRequests(response.data.data)
        this.props.actions.setOnline(response.data.online)
        this.props.actions.setVip(response.data.vipAccepted)
      }).catch((error) => {
        console.log(error.response)
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false, refreshing: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
      await axios.post(`${Appurl.apiUrl}checkTalentEmailverified`, values)
      .then((response) => {
        console.log(response)
        this.props.actions.setEmailVerified(response.data.isEmailVerified);
      }).catch((error) => {
        console.log(error.response)
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false, refreshing: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
      setTimeout(()=> {
        this.setState({isDisabled: false, visible: false, refreshing: false})
      }, 1000)
    }
  }
  showEmailResend = ()=> {
    let { isDisabled } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return <SafeAreaView style={{flex:0.07,backgroundColor: '#2D2929', justifyContent: 'center'}}>
            <View style={{minHeight: 48,flexDirection: flexDirection, marginHorizontal: 12, alignItems: 'center'}}>
              <View style={{flex: 0.8, justifyContent: 'center', marginLeft: 10}}>
                <Text style={{textAlign: textAlign, color: '#FFFFFF', fontSize: 12, fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('Home.emailCheckText')}</Text>
              </View>
              <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{flex:0.2,height: 32,backgroundColor: '#BF4D73', justifyContent: 'center', alignItems: 'center', borderRadius: 4}} onPress={this.emailResend}>
                <Text style={{color: '#FFFFFF', fontSize: 12, paddingBottom: 2, fontFamily: lang=='en'?'SFProText-Semibold':'HelveticaNeueLTArabic-Roman'}}>{string('Home.emailCheckBTN')} </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
  }
  emailResend = ()=> {
    if(!this.props.user.netStatus) {
      this.setState({isDisabled: false, visible: false})
      return Alert.alert(
        '',
        string('globalValues.NetAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: ()=> {
            }
          }
        ],
        { cancelable: false }
      );
    }
    else{
      this.setState({isDisabled: true, visible: true})
      let values = {'talentId' : this.props.user.loginID}
      console.log(values)
      return axios.post(`${Appurl.apiUrl}resendTalentEmail`, values)
      .then((response) => {
        console.log(response)
        Alert.alert(
          '',
          string('Home.ResendEmailText'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false})
              }
            }
          ],
          { cancelable: false }
        );
      }).catch((error) => {
        console.log(error)
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }
  }
  viewProfile = ()=> {
    this.props.actions.ButtonDisabled(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.Profile',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  }
  reject = (reject, user, i)=> {
    let {actions} = this.props;
    actions.setRejectId(reject, user, i);
    this.setState({isDisabled: false})
    Navigation.showLightBox({
      screen: 'FamCamTalent.RejectReason',
      style: {
        backgroundBlur: 'none',
        backgroundColor: 'rgba(0,0,0,0.85)',
        tapBackgroundToDismiss: false
      }
    });
  }
  openCam = async (userid, requestid, name, msg, i)=> {
    let { cameraPermission, photoPermission, microphonePermission } = this.state;
    let { actions } = this.props;
    this.setState({isDisabled: true})
    actions.setCameraMsgId(userid, requestid, name, msg, i)
    if(Platform.OS == 'android' && Platform.Version > 22) {
      this.setState({isDisabled: false})
      const granted = await PermissionsAndroid.requestMultiple (
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ]
      )
      if (granted['android.permission.CAMERA'] != 'granted' || granted['android.permission.RECORD_AUDIO'] != 'granted' || granted['android.permission.READ_EXTERNAL_STORAGE'] != 'granted' || granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
        return Alert.alert(
          '',
          string('Home.RecordPermission'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false})
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
    else if(Platform.OS=='ios') {
      await Permissions.checkMultiple(['camera', 'photo', 'microphone']).then(async response => {
        console.log(response)
        if (response.camera!="authorized" && response.photo!="authorized" && response.microphone!="authorized") {
          await Permissions.request('camera').then(async response => {
            // Returns once the user has chosen to 'allow' or to 'not allow' access
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            // this.setState({ photoPermission: response })
            console.log(response)
            if(response!="authorized") {
              return Alert.alert(
                '',
                string('Home.RecordPermission'),
                [
                  {
                    text: string('globalValues.AlertOKBtn'),
                    onPress: () => {
                      this.setState({isDisabled: false})
                    }
                  }
                ],
                { cancelable: false }
              );
            }
            else {
              await Permissions.request('microphone').then(async response => {
                // Returns once the user has chosen to 'allow' or to 'not allow' access
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                // this.setState({ photoPermission: response })
                console.log(response)
                if(response!="authorized") {
                  return Alert.alert(
                    '',
                    string('Home.RecordPermission'),
                    [
                      {
                        text: string('globalValues.AlertOKBtn'),
                        onPress: () => {
                          this.setState({isDisabled: false})
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                }
                else {
                  await Permissions.request('photo').then(async response => {
                    // Returns once the user has chosen to 'allow' or to 'not allow' access
                    // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                    // this.setState({ photoPermission: response })
                    console.log(response)
                    if(response!="authorized") {
                      return Alert.alert(
                        '',
                        string('Home.RecordPermission'),
                        [
                          {
                            text: string('globalValues.AlertOKBtn'),
                            onPress: () => {
                              this.setState({isDisabled: false})
                            }
                          }
                        ],
                        { cancelable: false }
                      );
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
    this.props.actions.CamDisabled(true)
    this.setState({isDisabled: false})
    setTimeout(()=> {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.CameraScreen',
          options: {
            topBar: {
                visible: false
            }
          }
        }
      });
      
    }, 600)
  }
  _onRefresh() {
    this.setState({refreshing: true})
    this.renderList();
  }
  notificationRefresh = ()=> {
    this.setState({refreshing: true})
    this.renderList();
  }
  timeAgo = (timegot)=> {
    const utc1=new Date(timegot);
    const utc2=new Date();
    const day=Math.floor((utc2-utc1)/(1000*24*60*60));
    var timetosend;
    if(day==1) {
      return timetosend=day+' '+string('Home.DayAgo');
    }
    else if(day>1) {
      return timetosend=day+' '+string('Home.DaysAgo');
    }
    else {
      const hour=Math.floor((utc2-utc1)/(1000*60*60));
      if(hour==1) {
        return timetosend=hour+' '+string('Home.HourAgo');
      }
      else if(hour>1) {
        return timetosend=hour+' '+string('Home.HoursAgo');
      }
      else {
        const minuts=Math.floor((utc2-utc1)/(1000*60));
        if(minuts==1) {
          return timetosend=minuts+' '+string('Home.MinuteAgo');
        }
        else if(minuts>1) {
          return timetosend=minuts+' '+string('Home.MinutesAgo');
        }
        else {
          const seconds=Math.floor((utc2-utc1)/(1000));
          if(seconds==1) {
            return timetosend=seconds+' '+string('Home.SecondAgo');
          }
          else if(seconds<0) {
            return timetosend='0'+' '+string('Home.SecondAgo')
          }
          else {
            return timetosend=seconds+' '+string('Home.SecondsAgo')
          }
        }
      }
    }
  }
  timeLeft = (timeleft)=> {
    const utc1=new Date(timeleft);
    const utc2=new Date();
    const hour=24-Math.floor((utc2-utc1)/(1000*60*60));
    var timetosend;
    if(hour==1) {
      return timetosend=hour+' '+string('Home.HourLeft');
    }
    else if(hour>1 && hour<25) {
      return timetosend=hour+' '+string('Home.HoursLeft');
    }
    else if(hour>24) {
      return timetosend='24'+' '+string('Home.HoursLeft');
    }
    else {
      const minuts=60-Math.floor((utc2-utc1)/(1000*60));
      if(minuts==1) {
        return timetosend=minuts+' '+string('Home.MinuteLeft');
      }
      else if(minuts>1) {
        return timetosend=minuts+' '+string('Home.MinutesLeft');
      }
      else {
        const seconds=60-Math.floor((utc2-utc1)/(1000));
        if(seconds==1) {
          return timetosend=seconds+' '+string('Home.SecondLeft');
        }
        else {
          return timetosend=seconds+' '+string('Home.SecondsLeft')
        }
      }
    }
  }
  renderItem(data) {
    let { item, index } = data;
    let { isDisabled, refreshing } = this.state;
    let { flexDirection, textAlign, lang, camAllow } = this.props.user;
    return (
      <View style={{flex:1}}>
        <View style={{justifyContent: 'center', marginVertical: 25}}>
          <View style={{flexDirection: flexDirection, alignItems: 'center'}}>
            <View style={{flex:0.82}}>
            <View style={{flex:0.3}}>
              <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 12, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Home.forText')}</Text>
            </View>
            <View style={{flex:0.7}}>
              <Text style={{textAlign: textAlign, color: '#BF4D73', fontSize: 20, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{item.forWhome}</Text>
            </View>
          </View>
          <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={camAllow || refreshing} style={{flex:0.18, alignItems: 'center'}} onPress={()=>this.openCam(item.userId, item.requestId, item.name, item.message, index)}>
            <View style={{backgroundColor: 'transparent', shadowOffset: {width: 0, height: 8}, shadowColor: 'rgba(0,0,0,0.12)', shadowOpacity: 1, shadowRadius: 16, elevation: 2}}>
              <Image style={{height: 48, width: 48}} source={require('./../../images/Group1.png')}/>
            </View>
          </TouchableOpacity>
          </View>
          <View style={{marginVertical: 10}}>
            <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 14, fontFamily: lang=='en'?'Georgia':'HelveticaNeueLTArabic-Light'}}>{item.message}</Text>
          </View>
          <View style={{flexDirection: flexDirection}}>
            <View style={{flex:0.7}}>
              <Text style={{textAlign: textAlign, color: '#1E1C1C', fontSize: 12, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{item.name}
                <Text style={{textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}> · {this.timeAgo(item.create_at)}</Text>
              </Text>
            </View>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled || refreshing} style={{flex:0.3, alignItems: lang=='en'?'flex-end':'flex-start'}} onPress={()=>this.reject(item.requestId, item.userId, index)}>
              <Text style={{textAlign: textAlign, color: '#FF6262', fontSize: 12, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}> {string('Home.rejectBTN')} </Text>
            </TouchableOpacity>
          </View>
          {item.isVip?<View style={{flexDirection: flexDirection, marginTop: 10}}>
            <View>
              <Image style={{height: 24, width: 24}} source={require('./../../images/VIPP.png')}/>
            </View>
            <View style={{marginHorizontal: 5, justifyContent: 'center'}}>
              <Text style={{fontSize: 12, textAlign: 'left', color: '#000000', fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Home.VIPLabel')} </Text>
            </View>
            <View style={{justifyContent: 'center'}}>
              <Text style={{fontSize: 12, textAlign: 'left', color: '#FF6262', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>({this.timeLeft(item.create_at)}) </Text>
            </View>
          </View>:null}
        </View>
        <View style={{borderBottomWidth: 0.5, borderBottomColor: '#474D57'}}></View>
      </View>
    )
  }
  render() {
    let { visible, id, isDisabled, refreshing } = this.state;
    let { flexDirection, textAlign, lang, allow, loginName, loginImage, arr, emailVerified } = this.props.user;
    let heightRatio = Dimensions.get('window').height/840
    return (
      <View style={{flex:1}}>
        <View style={{flex:0.2, minHeight: heightRatio*50}}>
          <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{flex:1}} start={{x:0, y:0}} end={{x:1, y:0}}>
            <SafeAreaView style={{flex:1, flexDirection: flexDirection, marginHorizontal: 24, marginTop: 20, marginBottom: 20}}>
              <View style={{flex:0.75}}>
                <View style={{flex:0.2, alignItems: lang=='en'?'flex-start':'flex-end', backgroundColor: 'transparent'}}>
                  <Text style={{color: '#FFFFFF', fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Home.welcomeText')}</Text>
                </View>
                <View style={{flex:0.7, alignItems: this.props.user.lang=='en'?'flex-start':'flex-end', backgroundColor: 'transparent'}}>
                  <Text numberOfLines={2} style={{color: '#FFFFFF', fontSize: 34, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{loginName} </Text>
                </View>
              </View>
              <TouchableOpacity disabled={allow || refreshing || visible} hitSlop={{top:7, bottom:7, left:7, right:7}} style={{flex:0.25, backgroundColor: 'transparent'}} onPress={this.viewProfile}>
                <View style={{flex:0.75, alignItems: 'center', justifyContent: 'center'}}>
                  <View style={{height: 50, width: 50, borderRadius: 25, borderWidth: 0.5, borderColor: '#474D57', alignItems: 'center', justifyContent: 'center'}}>
                    <FastImage style={{height: 50, width: 50, borderRadius: 25}} source={{uri : `${Appurl.apiUrl}resizeimage?imageUrl=`+loginImage+'&width=100&height=100'}}/>
                  </View>
                </View>
                <View style={{flex:0.25}}>
                  <Text style={{color: '#FFFFFF', fontSize: 12, textAlign: 'center', fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Home.profileBTN')} </Text>
                </View>
              </TouchableOpacity>
            </SafeAreaView>
            <View style={{height: 10}}></View>
          </LinearGradient>
        </View>
        <View style={{flex: 0.08}}>
        {arr.length?<View style={{flex:1, flexDirection: flexDirection, borderBottomWidth: 0.5, borderBottomColor: '#474D57', marginHorizontal: 24, alignItems: 'center'}}>
          <Text style={{color: '#1E1C1C', fontSize: 16, textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}> {arr.length} </Text>
          <Text style={{color: '#1E1C1C', fontSize: 16, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}> {string('Home.requestsText')}  </Text>
        </View>:visible?null:<Text style={{color: colors.themeColor,textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('globalValues.NothingText')}</Text>}
      </View>
        <View style={{flex: emailVerified?0.72:0.65, marginHorizontal: 24}}>
          {visible?<View style={{flex: 1, alignItems: 'center'}}>
            <Spinner isVisible={visible} size={100} type="ThreeBounce" color={colors.themeColor} />
          </View>:
          <FlatList
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index}
            data={arr}
            renderItem={this.renderItem.bind(this)}
            style={{flex:1}}
            refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={['#BF4D73', '#D8546E', '#8D3F7D']}
                        />
                    }
          />}
        </View>
        {emailVerified?null:this.showEmailResend()}
        
      </View>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
      user: state.user
  };
}

function mapDispatchToProps(dispatch) {
  return {
      actions: bindActionCreators(userActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
