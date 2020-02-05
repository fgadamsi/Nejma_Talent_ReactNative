import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, Text, View, Image, TouchableOpacity,Dimensions, TextInput, AsyncStorage} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import CountryPicker from 'react-native-country-picker-modal';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import { ScaledSheet } from "react-native-size-matters";
import * as userActions from '../actions/userActions';
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
const { width, height } = Dimensions.get('window')
import { bindActionCreators } from 'redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux';

class Register extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      email : this.props.user.fbEmail==''?'':this.props.user.fbEmail,
      phone : '',
      selectedCountryCode: "+91",
      selectedCountry: '',
      cca2: "IN",
      isEmailValid : false,
      isPhoneValid : false,
      password: '',
      show_password: true,
      isPasswordValid: false,
      visible : false,
      isDisabled: false,
      crossIcon: false,
      name : '',
      username : ''
    }
  }

  componentDidMount() {
   
    AsyncStorage.getItem('fcmToken')
    .then((token) => {
    console.log('fcmToken', token)
    this.setState({fcmToken : token})
    });
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if(connectionInfo.type=='none' || connectionInfo.type=='unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }
  componentWillUnmount() {
    this.props.actions.setFacebookEmail('');
    this.props.actions.ButtonDisabled(false);
   NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  loginScreen = () => {
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
  back = () => {
    this.setState({isDisabled: false})
    Navigation.pop(this.props.componentId);
  }
  _showHidePassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
    this.setState({ crossIcon: !this.state.crossIcon });
}

  validationRules= () => {
    return [
      {
        field: this.state.email,
        name: 'Email Id',
        rules: 'required|email|max:100'
      },
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|min:6'
      },
      {
        field: this.state.phone,
        name: 'Phone Number',
        rules: 'required|no_space|numeric'
      },
        {
        field: this.state.name,
        name: 'name',
        rules: 'required|min:3'
      },
      {
        field: this.state.username,
        name: 'username',
        rules: 'required|min:6'
      }
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.email,
        name: 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.password,
        name: 'كلمة السر',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  register2Screen = ()=> {
    let { actions } = this.props;
    let { email, phone, selectedCountryCode, cca2, isPhoneValid, isPasswordValid, visible, isDisabled, password, username, name  } = this.state;
    let { lang } = this.props.user;
    let validation = lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validation.length!=0) {
      return Alert.alert(
        '',
        validation[0],
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
      else if(  name.trim() == '' || username.trim() == '' || password.trim() == '') {
      Alert.alert('Fields cannot be empty')
      }
    else if(!this.props.user.netStatus) {
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
    else {
      this.setState({isDisabled: true, visible: true})
      actions.setRegisterEmailPhone(email, selectedCountryCode, phone, password);
      let values = {'email' : email.toLowerCase(), 'userName' : username , "name" : name, 'deviceType' : (Platform.OS == 'ios') ? 'IOS' : 'ANDROID', 'password' : password, 'langaugeType' : "en", "phoneNumber" : phone, "callingCode" :selectedCountryCode, "cca2" : cca2,  "deviceToken" : this.state.fcmToken}
      console.log(values)
      this.props.actions.setRegisterEmail(email)
      return axios.post(`${Appurl.apiUrl}registerTalent`, values)
      .then((response) => {
        console.log(response, 'ressssssssssss')
        return this.getData(response, values);
      }).catch((error) => {
        console.log(error, 'skskks')
        if(error.response.data.success == 0) {
          console.log()
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false});
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }
  }
  getData = (response, values) => {
    let {visible} = this.state;
    let {actions} = this.props;
    this.setState({isDisabled: false, visible: false});
    let id = response.data.talentId;
    actions.setRegisterId(id);
    setTimeout(()=> {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.OTPScreen',
          options: {
            topBar: {
                visible: false
            }
          }
        }
      });
     
    }, 1000)
  }
  func = (item, index)=> {
    this.setState({callingCode: item})
  }
  countryPickerModal = ()=> {
    this.refs.CountryPicker.openModal();
  }
  render() {
    let { email, phone, cca2, callingCode, password, show_password, visible, isDisabled } = this.state;
    let { flexDirection, textAlign, lang, fbEmail } = this.props.user;
    return (
      <View  style={{flex:1, backgroundColor: 'white'}}>
      <View style={{flex:1, marginHorizontal: moderateScale(24)}}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always"  style={{flex:1, backgroundColor: 'white'}}>
      <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
        <View style={{flex: 0.1, marginTop:moderateScale(20), flexDirection : 'row'}}>
          <TouchableOpacity  hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
          <Image source={require('./../../images/ic_close_login.png')} />
          </TouchableOpacity>
          <View style={{width:'85%'}}>
          <Text style={styles.alignLogin} onPress = {() => this.loginScreen()}>{string('Login1.login')}</Text>
          </View>
          
        </View>
        <View style={styles.topView}>
        <Image   source={require('./../../images/smallLogo.png')}  />
        </View>
        <View style={{flex:0.07}}>
          <Text style = {styles.registerHeading}>{string('register.heading')}</Text>
        </View>
       
        <View style={{ height: verticalScale(18) }} />
                  <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('register.name')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                          ref={name => this.name = name}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('register.name')}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          returnKeyType={"next"}
                          onChangeText={(name) => this.setState({ name })}
                          value={this.state.name} />
                      <View style={styles.inputLine} />
                  </View>
                  <View style={{ height: verticalScale(18) }} />
                  <View style={{width:'100%'}}>
                      <Text style={styles.inputLabel}>{string('register.email')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                          ref={email => this.email = email}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('register.email')}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          returnKeyType={"next"}
                          onChangeText={(email) => this.setState({ email })}
                          value={this.state.email} />
                      <View style={styles.inputLine} />
                  </View>
                     <View style={{ height: verticalScale(18) }} />
                  <View style={styles.inputMainView}>
                      <Text style={styles.inputLabel}>{string('register.username')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                          ref={username => this.username = username}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('register.username')}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          returnKeyType={"next"}
                          onChangeText={(username) => this.setState({ username })}
                          value={this.state.username} />
                      <View style={styles.inputLine} />
                  </View>
                  <View style={{ height: verticalScale(18) }} />
          <View style={styles.inputMainView}>
            <Text style={styles.inputLabel}>{string('register.password')}</Text>
            <View>
              <TextInput
                selectionColor={colors.tabsActiveColor}
                style={styles.textInputStyle}
                ref={password => (this.password = password)}
                underlineColorAndroid="transparent"
                placeholder={string('register.password')}
                autoCapitalize="none"
                placeholderTextColor={colors.textColor}
                keyboardType="default"
                secureTextEntry={this.state.showPassword}
                returnKeyType={"done"}
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
              {this.state.crossIcon == false ? (
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.visibilityIconStyle}
                  hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  onPress={() => this._showHidePassword()}
                >
               <Image source={require('./../../images/visibility-button.png')} />
                </TouchableOpacity>
              ) : (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.visibilityIconStyle}
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onPress={() => this._showHidePassword()}
                  >
               	  <Image source={require('./../../images/hide_button.png')} />
                  </TouchableOpacity>
                )}
            </View>
            <View style={styles.inputLine} />
          </View>
  
                   
                    <View style={{marginTop: moderateScale(20)}}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={{ flexDirection: 'row', marginHorizontal: moderateScale(10) }}>
                            <View style={styles.countryCodeInnerContainer}>
                                <CountryPicker style={styles.countryCodeInnerContainer}
                                    onChange={value => {
                                        console.log(value, 'hte value')
                                        this.setState({ cca2: value.cca2, selectedCountry: value.cca2, selectedCountryCode: '+' + value.callingCode })
                                    }}
                                    cca2={this.state.cca2}
                                    filterable
                                    autoFocusFilter={false}
                                    closeable={true}
                                />
                                <View pointerEvents="none" style={styles.countryCodeView}>
                                    <Text pointerEvents="none" numberOfLines={1} ellipsizeMode='tail' style={styles.countryCodeText}>({this.state.selectedCountryCode})</Text>
                                </View>
                                <Image style={{ position: "absolute", right: 0, height: verticalScale(10), width: scale(10), marginTop: 6, marginLeft:moderateScale(-5) }} source={require('./../../images/drop-down.png')} />
                            </View>
                            <TextInput style={styles.textInputPhoneStyle}
                                selectionColor={colors.tabsActiveColor}
                                ref={phone => this.phone = phone}
                                underlineColorAndroid="transparent"
                                placeholder=""
                                textContentType='telephoneNumber'
                                contextMenuHidden={true}
                                dataDetectorTypes='phoneNumber'
                                maxLength={10}
                                keyboardType='number-pad'
                                onChangeText={phone => this.setState({ phone })}
                                returnKeyType={"next"}
                                value={this.state.phone} />
                        </View>
                        <View style={styles.inputLinePhone} />
                    </View>
          
         
          

          
         
                <TouchableOpacity style={styles.loginButton} onPress={() => this.register2Screen()}>
                      <Text style={styles.loginButtonText}>{string('home.account')}</Text>
                  </TouchableOpacity>
            {/* <View style={styles.social}>
         
          
          <TouchableOpacity  style={styles.btnEmail} onPress = {() => this.createScreen()}>
            <View style={{flex:0.2, alignItems: 'center'}}>
            </View>
            <View style={{flex:0.8, marginLeft: -20, backgroundColor: 'transparent'}}>
              <Text style={styles.accountText}>{strings('home.account')}</Text>
            </View>
          </TouchableOpacity>
         
        </View> */}
        <View>
        <Text style={styles.bycreatingText}>{string('register.byCreating')} <Text style={styles.termsofServiceText} onPress = {() => this.loginScreen()}> {string('register.terms')}</Text><Text> {string('register.and')}</Text><Text style={styles.termsofServiceText}> {string('register.privacy')}</Text></Text>
        </View>
        </KeyboardAwareScrollView>
      </View>
     
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);

const styles=ScaledSheet.create({

  registerHeading : {
    marginTop:'20@ms',
     color: colors.regHeading,
     fontSize:  '20@ms',
     lineHeight: '24@ms',
     fontWeight : fontWeight.medium,
     fontFamily : fontFamily.mediumBold 
  },
  topView : {
     marginTop:'10@ms',
  },
  alignLogin : {
    textAlign : 'right',
    marginTop:'5@ms',
    fontSize :'14@ms',
    fontWeight : fontWeight.medium,
    lineHeight : '16@ms',
    fontFamily : fontFamily.mediumBold,
    color : colors.themeColor

  },
  inputLine: {
    height: '1@ms',
    width: width - 46,
    backgroundColor: colors.black,
    opacity: 0.10,
    borderRadius: '4@ms',
    marginTop: '10@ms',
    alignSelf: 'center'
},
countryCodeInnerContainer: {
  height: '12@vs',
  width: '80@s',
  marginLeft:'-10@ms'
},
countryInnerContainer: {
 
  width: width - 46,
  
  marginLeft:'2@ms'
},

countryCodeText: {
  //lineHeight: '19@ms',
  fontSize: '12@ms',
  color: colors.black,
  opacity: 0.80,
  fontFamily: fontFamily.regularFont,
},
inputLineCountry: {
  height: '1@ms',
  width: '147@s',
  backgroundColor: colors.black,
  opacity: 0.10,
  borderRadius: '4@ms',
  position:'absolute',
  bottom:0,
  alignSelf: 'center'
},
inputLinePhone: {
  height: '1@ms',
  width: width - 46,
  backgroundColor: colors.black,
  opacity: 0.10,
  borderRadius: '4@ms',
  marginTop: '8@ms',
  alignSelf: 'center'
},
countryCodeView: {
  height: '22@vs',
  width: '80@s',
  position: 'absolute',
  justifyContent: 'center',
  marginTop : moderateScale(2),
  marginLeft:moderateScale(-11)
  //justifyContent: 'center',
  //alignItems: 'center'
},
countryCodeText: {
  //lineHeight: '19@ms',
  fontSize: '14@ms',
  color: colors.black,
  opacity: 0.80,
  fontFamily: fontFamily.regularFont,
},
editProfileText: {
  color : colors.textColor,
  fontFamily : fontFamily.bold,
  fontSize : '20@ms',
  lineHeight : '24@ms',
  fontWeight : fontWeight.bold,
  textAlign : 'center'
},
editProfileInfo : {
textAlign : 'center',
color : colors.smallText, 
fontSize : '13@ms',
fontFamily : fontFamily.regular,
lineHeight : '24@ms',
marginTop:'5@ms'

},
headerBackGround : {

height : '90@ms'
},
profilePic : {
width: '96@s', height: '96@vs', borderRadius: '48@ms', opacity: '0.8@ms',
marginTop:'20@ms'
},
cameraImage : {
width:'20@s',
 height:'16@vs', 
 position: 'absolute',
  marginTop: moderateScale(90),
   marginLeft:moderateScale(70)
},
inputLabel: {
lineHeight: '16@ms',
fontSize: '14@ms',
color: colors.labelColor,
opacity: 0.50,
fontFamily: fontFamily.regular,
textAlign: 'left'
},
textInputStyle: {
// lineHeight: '19@vs',
fontSize: '16@ms',
width :width/1.5,
color: colors.textColor,
opacity: 0.80,
marginTop: '5@ms',
fontFamily: fontFamily.mediumBold,
padding: 0,
paddingRight: '24@ms',
textAlign: 'left'
},
width20 : {
width : "20%"
},
textInputStyleRow: {
// lineHeight: '19@vs',
width :'80%',
fontSize: '16@ms',
color: colors.textColor,
opacity: 0.80,
marginTop: '5@ms',
fontFamily: fontFamily.mediumBold,
padding: 0,
paddingRight: '24@ms',
textAlign: 'left'
},
inputLine: {
height: '1@ms',
width: width - 46,
backgroundColor: colors.black,
opacity: 0.10,
borderRadius: '4@ms',
marginTop: '10@ms',
alignSelf: 'center'
},
verifyText : {
textAlign : "right",
fontSize : "13@ms",
marginTop: "5@ms",
fontFamily : fontFamily.regular,
color : colors.themeColor,
lineHeight : "15@ms"
},
verifyTextEmail: {
textAlign : "right",
 fontSize : "13@ms",
 marginTop: "5@ms",
 fontFamily : fontFamily.regular,
 color : colors.themeColor,
 lineHeight : "15@ms",
 marginLeft : "10@ms"
},
textInputPhoneStyle: {
//lineHeight: '17@vs',
width: width/1.79,
fontSize: '16@ms',
color: colors.black,
opacity: 0.80,
fontFamily: fontFamily.regularFont,
padding: 0,
paddingLeft: '8@ms',
paddingRight: '24@ms',
textAlign: 'left'
},
verifiedText : {
textAlign : "right",
 fontSize : "13@ms",
 marginTop: "5@ms",
 fontFamily : fontFamily.regular,
 color : colors.green
},
containerBorder : {
borderTopLeftRadius: moderateScale(30),
borderTopRightRadius: moderateScale(30), borderWidth : 1, borderColor : colors.borderColor,
backgroundColor : 'white',
 flex:1},
loginButton: {
  position : 'absolute',
 bottom : '10@ms',
  height: "48@vs",
  width: width - 46,
  borderRadius: "2@ms",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.themeColor,
  alignSelf: "center"
},
loginButtonText: {
  fontFamily: fontFamily.regular,
  textAlign: 'center',
  color:colors.white,
  fontSize: '16@ms',
  fontWeight : fontWeight.medium,
  fontFamily : fontFamily.mediumBold,
},

width80 : {
  width : '80%'
},
width90 : {
  width : '82%'
},
  textInputStyle: {
    // lineHeight: '19@vs',
    fontSize: '16@ms',
    color: colors.textColor,
    opacity: 0.80,
    marginTop: '5@ms',
    fontFamily: fontFamily.mediumBold,
    padding: 0,
    paddingRight: '24@ms',
    textAlign: 'left'
},
  btnEmail: {
    height: '50@vs',
    width: '300@s',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:colors.themeColor,
    borderWidth:1,
    borderRadius:'8@ms',
    padding: '10@ms',
    marginBottom : '10@ms',
    borderColor : colors.themeColor
  },
  social: {
    marginTop : '70@ms',
    alignItems: 'center'
  },
  accountText : {
    textAlign: 'center',
    color:colors.white,
    fontSize: '16@ms',
    fontWeight : fontWeight.medium,
    fontFamily : fontFamily.mediumBold,
    lineHeight: '24@ms'

  },
  bycreatingText : {
    marginTop: '10@ms',
  
    color : colors.creatingAccount,
    fontFamily : fontFamily.regular,
    lineHeight: '18@ms',
    fontSize: '12@ms'
  },
  termsofServiceText : {
    color :  'black'
  },
  inputLabel: {
    lineHeight: '16@ms',
    fontSize: '14@ms',
    color: colors.labelColor,
    opacity: 0.50,
    fontFamily: fontFamily.regular,
    textAlign: 'left'
},
visibilityIconStyle: {
  position: "absolute",
  right: 0,
  top: "5@ms",
  marginRight: "23@ms",
  alignItems: "center"
},
loginButton: {
  marginTop : '20@ms',
  height: "48@vs",
  width: width - 46,
  borderRadius: "2@ms",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: colors.themeColor,
  alignSelf: "center"
},
loginButtonText: {
  fontFamily: fontFamily.regular,
  textAlign: 'center',
  color:colors.white,
  fontSize: '16@ms',
  fontWeight : fontWeight.medium,
  fontFamily : fontFamily.mediumBold,
},
countryCodeView: {
  height: '22@vs',
  width: '80@s',
  position: 'absolute',
  justifyContent: 'center',
  marginTop : moderateScale(2),
  marginLeft:moderateScale(-11)
  //justifyContent: 'center',
  //alignItems: 'center'
},
countryCodeText: {
  //lineHeight: '19@ms',
  fontSize: '14@ms',
  color: colors.black,
  opacity: 0.80,
  fontFamily: fontFamily.regularFont,
},
inputLinePhone: {
  height: '1@ms',
  width: width - 46,
  backgroundColor: colors.black,
  opacity: 0.10,
  borderRadius: '4@ms',
  marginTop: '8@ms',
  alignSelf: 'center'
},
countryCodeInnerContainer: {
  height: '12@vs',
  width: '84@s'
},
countryInnerContainer: {
 
  width: width - 56,
  
  marginLeft:'10@ms'
}
  
})

