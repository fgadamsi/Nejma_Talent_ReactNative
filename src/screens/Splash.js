import React,{ Component } from 'react';
import { Platform, Text, View, ImageBackground, Alert, StyleSheet,SafeAreaView, TouchableOpacity, Dimensions, Image, AsyncStorage } from 'react-native';

import { Navigation } from 'react-native-navigation';
import Icon from 'react-native-vector-icons/EvilIcons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';
import I18n from 'react-native-i18n';
import axios from 'axios';
import { ScaledSheet } from "react-native-size-matters";
import Spinner from 'react-native-loading-spinner-overlay';
import FBSDK from 'react-native-fbsdk';
import { LoginManager,   AccessToken } from 'react-native-fbsdk';
import firebase from 'react-native-firebase';
// import Auth0 from 'react-native-auth0';
// var credentials = require('../auth0-credentials');
// const auth0 = new Auth0(credentials);
import NetInfo from "@react-native-community/netinfo";
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Splash extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    statusBarTextColorScheme: 'light'
  };
  constructor(props) {
    super(props);
    this.state = {
      langColor : true,
      fbEmail : '',
      visible: false
    };
    AsyncStorage.getItem('lang')
    .then((lang) => {
      if(lang!=null) {
        let getlang = JSON.parse(lang);
        if(getlang=='ar') {
          this.setState({langColor:false});
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
        if(I18n.currentLocale()=='ar') {
          this.setState({langColor:false});
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
 
  componentDidMount() {
    this.checkPermission();
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if(connectionInfo.type=='none' || connectionInfo.type=='unknown') {
        this.props.actions.checkInternet(false);
        return Alert.alert(
          '',
          string('globalValues.NetAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
    
              }
            }
          ],
          { cancelable: false }
        );
      }
      else
      {
        this.props.actions.checkInternet(true);
      }
    });
  }
  
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
      //  console.log('fcmToken:', fcmToken);
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
    console.log('fcmToken:', fcmToken);
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }
  onReceived(notification) {
      console.log("Notification received: ", notification);
  }
  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }
  onRegistered(notifData) {
      console.log("Device had been registered for push notifications!", notifData);
  }
  onIds(device) {
    console.log(device);
  }
  appLang = (selectedLg)=> {
    let { langColor } = this.state;
    if(selectedLg === 'en') {
      this.setState({langColor:true});
      I18n.locale = 'en';
      I18n.currentLocale();
    }
    else {
      this.setState({langColor:false});
      I18n.locale = 'ar';
      I18n.currentLocale();
    }
    this.asqw(selectedLg);
  }
  asqw = async (getwq)=> {
    console.log(getwq);
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq);
  }
  // webAuth(connection) {
  //   this.props.actions.ButtonDisabled(true);
  //   this.setState({visible: true})
  //     auth0.webAuth
  //         .authorize({
  //             scope: 'openid profile email',
  //             connection: connection,
  //             // prompt: 'consent',
  //             audience: 'https://' + credentials.domain + '/userinfo'
  //         })
  //         .then(credentials => {
  //             this.onSuccess(credentials);
  //         })
  //         .catch(error => {
  //           console.log(error)
  //           this.props.actions.ButtonDisabled(false)
  //           this.props.actions.ButtonDisabled1(false)
  //           this.setState({visible: false})
  //         });
  // }
  // this.alert('Error', error.error_description)
  alert(title, message) {
        Alert.alert(
            title,
            message,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.props.actions.ButtonDisabled(false)
                  this.props.actions.ButtonDisabled1(false)
                  this.setState({visible: false})
                }
              }
            ],
            { cancelable: false }
        );
    }

    facebookLogin = ()=> {
      if(!this.props.user.netStatus) {
        return Alert.alert(
          '',
          string('globalValues.NetAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: ()=> {
                this.setState({isDisabled: false, visible: false});
              }
            }
          ],
          { cancelable: false }
        );
      }
      else{
        let _this = this;
        LoginManager.logOut();
        LoginManager.logInWithPermissions(['public_profile','email'])
        .then(
          function(result) {
            console.log('working')
            console.log(result)
            if (result.isCancelled) {
              console.log('Login cancelled');
            }
            else {
              _this.setState({visible: true})
              AccessToken.getCurrentAccessToken()
              .then(
                (data) => {
                  console.log(data)
                  fetch('https://graph.facebook.com/v2.6/me?fields=email&access_token='+data.accessToken)
                  .then((response) => response.json())
                  .then((json) => {
                    console.log(json)
                    // let values = {'provider_user_id': json.id, 'provider': 'facebook', 'name': json.name, 'email': json.email, 'profile_pic' : '', 'timezone' : DeviceInfo.getTimezone(), 'fcm_id' : json.email?json.email:json.id};
                    if(json.email) {
                      console.log('ifdataemail')
                      _this.setState({fbEmail: json.email.toLowerCase()})
                      let values = { 'email' : json.email.toLowerCase(), 'langaugeType' : _this.props.user.lang }
                      console.log(values, 'errror')
                      console.log(`${Appurl.apiUrl}TalentfaceBookLogin`, 'fbUrl')
                      return axios.post(`${Appurl.apiUrl}TalentfaceBookLogin`, values)
                     
                      .then((response) => {
                        console.log(response, 'resfb')
                        return _this.getData(response);
                      }).catch((error) => {
                          console.log(error.response, 'err')
                          //_this.props.actions.toggleButton(false);
                          _this.setState({visible: false})
                          setTimeout(()=> {
                            Alert.alert(
                              error.response.data.mgs
                           )
                            // Alert.alert(
                            //   '',
                            //   error.response.data.msg,
                            //   [
                            //     {
                            //       text: string('globalValues.AlertOKBtn'),
                            //       onPress: () => {
                            //       }
                            //     }
                            //   ],
                            //   { cancelable: false }
                            // )
                          }, 600)
                      })
                    }
                    else {
                      _this.props.actions.toggleButton(false);
                      _this.setState({visible: false})
                      setTimeout(()=> {
                        _this.props.navigator.push({
                          screen: 'register'
                        })
                      }, 1000)
                    }
                  })
                  .catch((error) => {
                    console.log(error)
                    // _this.props.actions.toggleButton(false);
                    _this.setState({visible: false})
                  })
                }
              )
            }
          },
          function(error) {
            console.log(error)
            // _this.props.actions.toggleButton(false);
            _this.setState({visible: false})
          }
        );
     }
    }
  // onSuccess(credentials) {
  //   console.log('onSucess')
  //     auth0.auth
  //         .userInfo({ token: credentials.accessToken })
  //         .then((data)=> {
  //           console.log(data)
  //           console.log(data.email)
  //           if(data.email) {
  //             this.setState({fbEmail: data.email})
  //             let values = { 'email' : data.email, 'langaugeType' : this.props.user.lang}
  //             return axios.post(`${Appurl.apiUrl}TalentFacebookLogin`, values)
  //             .then((response) => {
  //               return this.getData(response);
  //             }).catch((error) => {
  //                 console.log(error)
  //                 Alert.alert(
  //                     '',
  //                     error.response.data.msg,
  //                     [
  //                         {
  //                                 text: string('globalValues.AlertOKBtn'),
  //                                 onPress: () => {
  //                                   this.props.actions.ButtonDisabled(false)
  //                                   this.props.actions.ButtonDisabled1(false)
  //                                   this.setState({visible: false})
  //                         } }
  //                     ],
  //                     { cancelable: false }
  //                 )
  //             })
  //           }
  //           else {
  //             this.props.actions.ButtonDisabled(false);
  //             this.setState({visible: false})
  //             this.props.navigator.push({
  //               screen: 'FamCamTalent.Register'
  //             })
  //           }
  //           // Alert.alert(
  //           //     '',
  //           //     'Thanks '+data.name+' Further functionality will be implemented in next build!',
  //           //     [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
  //           //     { cancelable: false }
  //           // );
  //         })
  //         .catch(error => {
  //           this.props.actions.ButtonDisabled(false);
  //           this.setState({visible: false})
  //           this.alert('Error', error.json.error_description)
  //         });
  // }
  getData = (response)=> {
    let { fbEmail } = this.state;
    console.log(response)
    if(response.data.success==1) {
      this.login(response);
    }
    else {
      this.props.actions.setFacebookEmail(fbEmail)
      this.props.actions.ButtonDisabled(false);
      this.setState({visible: false})
      setTimeout(()=> {
        Navigation.push(this.props.componentId, {
          component: {
            name: 'FamCamTalent.Register',
            options: {
              topBar: {
               
                  visible: false
                
              }
            }
          }
        });
       
      }, 1000)
    }
  }
  login = async (response)=> {
    console.log('login')
    let loginDetails = {'talentId' : response.data.talentId, 'talentName' : response.data.talentName,'talentBio' : response.data.talentBio, 'talentImage' : response.data.profilePicUrl, 'handel' : response.data.yourhandel, 'professions' : response.data.professions, 'talentEmail' : response.data.email};
   // OneSignal.sendTag("phone", response.data.email);
    try {
      await AsyncStorage.setItem('talent', JSON.stringify(loginDetails))
      await AsyncStorage.setItem('isOnline', JSON.stringify(response.data.online))
      this.props.actions.ButtonDisabled(false);
      this.setState({visible: false})
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.Home',
          options: {
            topBar: {
             
                visible: false
              
            }
          }
        }
      });
    }
    catch(error){
      console.log(error)
      this.props.actions.ButtonDisabled(false);
      this.setState({visible: false})
    }
  }
  loginFB = (response)=> {
   console.log('fbres')
   Navigation.push(this.props.componentId, {
    component: {
      name: 'FamCamTalent.Home',
      options: {
        topBar: {
            visible: false
        }
      }
    }
  });
  }
  loginBtn = ()=> {
    this.props.actions.ButtonDisabled(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.Login',
        options: {
          topBar: {
           
              visible: false
            
          }
        }
      }
    });
  }
  registerEmail = ()=> {
    this.props.actions.ButtonDisabled(true);
    // this.props.navigator.push({
    //   screen: 'FamCamTalent.Register'
    // })
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.Register',
        options: {
          topBar: {
           
              visible: false
            
          }
        }
      }
    });

  }
  TermsOfService = () => {
    this.props.actions.ButtonDisabled(true);
    this.props.navigator.push({
      screen : 'FamCamTalent.TermsOfService'
    })
  }
  render() {
    let { langColor, visible } = this.state;
    let { textAlign, lang, allow } = this.props.user
    return (
      <SafeAreaView style={{flex:1}}>
      {/* <View source={require('./../Images/pexels-photo-69970.png')} style={styles.backgroundImage}> */}
      <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
      <View style={styles.welcomeInfo}>
      <Image source={require('./../../images/logo.png')} />
      <Text style={styles.textLarge}>{string('home.welcomeText')}</Text>
      <Text style={styles.welcomeTextStyle}>{string('home.bookText')}  {"\n"} {string('home.favPeople')}</Text>
      </View>
       
        <View style={styles.social}>
       
         
        <TouchableOpacity style={styles.btnFb} onPress = {() => this.facebookLogin()}>
              <View style={{flex:0.2, alignItems: 'center'}}>
              <Image source={require('./../../images//ic_facebook.png')} />
              </View>
              <View style={{flex:0.8, marginLeft: -20, backgroundColor: 'transparent'}}>
                <Text style={styles.fbText}>{string('home.fb_button')}</Text>
              </View>
            </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={() => this.registerEmail()}>
                      <Text style={styles.loginButtonText}>{string('home.account')}</Text>
                  </TouchableOpacity>
          <View style={{flex:1/3, backgroundColor: 'transparent'}}>
            <Text style={{color: '#FFFFFF', fontSize: 12, opacity: 0.88, fontFamily: langColor?'SFProText-Regular':'HelveticaNeueLTArabic-Light', textDecorationLine: 'underline'}} onPress={this.termsAndConditions}>{string('home.message')}</Text>
          </View>
        </View>
        <Text style={styles.alreadyUserText}>{string('home.oldUser')} <Text style={styles.logInText} onPress = {() => this.loginBtn()}>{string('home.login')}</Text></Text>
        <View>
         
        </View>
      {/* </View> */}
    </SafeAreaView >
    );
  }
}

const styles=ScaledSheet.create({
  backgroundImage: {
        flex: 1,
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
  },
  imageLogo : {
    
  },
  googleText : {
    textAlign: 'center',
    color:'rgba(72,72,72,0.87)', 
    fontSize:  '16@ms',
    lineHeight: '24@ms',
    fontWeight : '500',
    fontFamily : 'SFUIDisplay-Medium' 
   
  },
  welcomeInfo : {
    alignItems : 'center',
    marginTop : '40@ms'
  },
  textLarge : {
    fontSize : '24@ms', 
    marginTop : '15@ms',
    fontWeight :'600',
    fontFamily : 'SFUIDisplay-Bold',
    lineHeight: '24@ms'
  },
  welcomeTextStyle : {
    marginTop : '5@ms',
    fontSize : '14@ms', 
    textAlign : 'center',
    color: 'rgba(0,0,0,0.6)',
    fontFamily : 'SFUIDisplay-Regular',
    lineHeight: '20@ms'
   
  },
  social: {
   
    marginTop : '70@ms',
    alignItems: 'center'
  },
  btnFb: {
    // height:50,
    // width:Dimensions.get('window').width*0.8,
    height: '50@vs',
    width: '300@s',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#3B5998',
    borderRadius:'8@ms',
    padding: '10@ms',
    marginBottom : '10@ms'
  },
  accountText : {
    textAlign: 'center',color:'rgba(72,72,72,0.87)', fontSize: '16@ms',
    fontWeight : '500',
    fontFamily : 'SFUIDisplay-Medium' 

  },
  fbText : {
    textAlign: 'center',color:'#FFFFFF', fontSize: '16@ms',
    fontWeight : '500',
    fontFamily : 'SFUIDisplay-Medium' 
  },
  btnEmail: {
    height: '50@vs',
    width: '300@s',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#FFFFFF',
    borderWidth:1,
    borderRadius:'8@ms',
    padding: '10@ms',
    marginBottom : '10@ms',
    borderColor : 'rgba(72,72,72,0.87)',
    borderColor : 'rgba(0,0,0,0.16)'
  },
  alreadyUserText : {
    marginTop: '10@ms',
    textAlign : 'center',
    color : 'rgba(0,0,0,0.6)',
    fontFamily : 'SFUIDisplay-Regular',
    lineHeight: '18@ms',
    fontSize: '15@ms'
  },
  logInText : {
    color :  colors.themeColor
  },
  loginButton: {
 
  height: "48@vs",
 width: '300@s',
  borderRadius: "2@ms",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.white,
  alignSelf: "center",
   borderWidth:1,
    borderRadius:'8@ms',
    borderColor : 'rgba(0,0,0,0.16)'
},
loginButtonText: {
  fontSize: '16@ms',
  fontWeight : fontWeight.medium,
  fontFamily : fontFamily.mediumBold,
  color:'rgba(72,72,72,0.87)',
  marginLeft : '15@ms'
  
}
})

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

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
