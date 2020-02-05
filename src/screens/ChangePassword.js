import React, { Component } from 'react';
import { SafeAreaView, TextInput, Alert, Text, View, Dimensions, Image, TouchableOpacity, ScrollView} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import { verticalScale, moderateScale, scale, ScaledSheet} from 'react-native-size-matters';
const { width, height } = Dimensions.get('window')
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class ChangePassword extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      password: '',
      confirmPassword: '',
      showpassword: true,
      crossIcon: false,
      showpassword2: true,
      crossIcon2: false
    }
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
  }
  _showHidePassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
    this.setState({ crossIcon: !this.state.crossIcon });
}
_showHidePassword2 = () => {
  this.setState({ showPassword2: !this.state.showPassword2 });
  this.setState({ crossIcon2: !this.state.crossIcon2 });
}
  componentWillUnmount() {
    this.props.actions.ButtonDisabled2(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = ()=> {
    Navigation.pop(this.props.componentId);
  }
  validationRules= ()=> {
    return [
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|no_space|min:6'
      },
      {
        field: this.state.confirmPassword,
        name: 'Confirm Password',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.password,
        name: 'كلمة السر',
        rules: 'required|no_space|min:6'
      },
      {
        field: this.state.confirmPassword,
        name: 'تأكيد كلمة المرور',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  done = ()=> {
    let { password, confirmPassword, visible, isDisabled } = this.state;
    let { lang, loginID } = this.props.user;
    let validation= lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validation.length!=0) {
      return Alert.alert(
        '',
        validation[0],
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
    else if(password!=confirmPassword) {
      return Alert.alert(
        '',
        string('ChangePassword.noMatch'),
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
    else if(!this.props.user.netStatus) {
      this.setState({isDisabled: false,visible: false});
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
    //  this.setState({visible: true, isDisabled: true})
      let values = {'talentId' : loginID, 'password' : password}
      return axios.post(`${Appurl.apiUrl}changePasswordOfTalent`, values)
      .then((response) => {
        console.log(response, 'ressjjsjs')
        Alert.alert(
          '',
          string('ChangePassword.SuccessAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false,visible: false});
                Navigation.pop(this.props.componentId);
              }
            }
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
        console.log(error.response, 'shshhshshs')
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: 'Okay',
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
  render() {
    let { password, confirmPassword, visible, isDisabled } = this.state;
    let { textAlign, lang } = this.props.user;
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        <ScrollView
          style={{height: windowHeight, backgroundColor: '#ffffff'}}
          showsVerticalScrollIndicator={false}
          >
          <View style={{height: windowHeight, marginHorizontal: 24}}>
            <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
            <View style={{flex: 0.1, justifyContent: 'center'}}>
              <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
                <Image source={require('./../../images/ic_back.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
              </TouchableOpacity>
            </View>
            <View style={{flex:0.08, justifyContent: 'flex-start'}}>
              <Text style = {{color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{string('ChangePassword.passwordText')}</Text>
            </View>
            <View style={{flex:0.09}}>
              <Text style = {{textAlign: textAlign,fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('ChangePassword.mainText')}</Text>
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
               <Image source={require('./../../images/hide_button.png')} />
                </TouchableOpacity>
              ) : (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.visibilityIconStyle}
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onPress={() => this._showHidePassword()}
                  >
               	  <Image source={require('./../../images/visibility-button.png')} />
                  </TouchableOpacity>
                )}
            </View>
            <View style={styles.inputLine} />
          </View>
          <View style={{ height: verticalScale(18) }} />
          <View style={styles.inputMainView}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View>
              <TextInput
                selectionColor={colors.tabsActiveColor}
                style={styles.textInputStyle}
                ref={confirmPassword => (this.confirmPassword = confirmPassword)}
                underlineColorAndroid="transparent"
                placeholder="Confirm Password"
                autoCapitalize="none"
                placeholderTextColor={colors.textColor}
                keyboardType="default"
                secureTextEntry={this.state.showPassword2}
                returnKeyType={"done"}
                onChangeText={confirmPassword => this.setState({ confirmPassword })}
                value={this.state.confirmPassword}
              />
              {this.state.crossIcon2 == false ? (
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.visibilityIconStyle}
                  hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  onPress={() => this._showHidePassword2()}
                >
               <Image source={require('./../../images/hide_button.png')} />
                </TouchableOpacity>
              ) : (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.visibilityIconStyle}
                    hitSlop={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    onPress={() => this._showHidePassword2()}
                  >
               	  <Image source={require('./../../images/visibility-button.png')} />
                  </TouchableOpacity>
                )}
            </View>
            <View style={styles.inputLine} />
          </View>
            {/* <View style = {{flex:0.15}}>
                <MKTextField
                  placeholder = {string('ChangePassword.passwordLabel')}
                  ref="password"
                  placeholderTextColor='#AAAFB9'
                  floatingLabelEnabled
                  password={true}
                  keyboardType = "default"
                  returnKeyType = "next"
                  textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                  style = {{marginTop:10}}
                  underlineSize={1}
                  highlightColor='#474D57'
                  tintColor='#C2567A'
                  autoCorrect={false}
                  autoCapitalize= 'none'
                  onChangeText = {(text) => this.setState({password: text.trim()})}
                  onSubmitEditing = {(event) => {this.refs.confirmPass.focus()}}
                />
            </View>
            <View style = {{flex:0.15}}>
                <MKTextField
                  placeholder = {string('ChangePassword.confirmPasswordLabel')}
                  ref="confirmPass"
                  placeholderTextColor='#AAAFB9'
                  floatingLabelEnabled
                  keyboardType = "default"
                  password={true}
                  returnKeyType = "done"
                  returnKeyLabel = "done"
                  textInputStyle = {{fontSize: 16, color: '#474D57', textAlign: textAlign}}
                  style = {{marginTop:10}}
                  underlineSize={1}
                  highlightColor='#474D57'
                  tintColor='#C2567A'
                  autoCorrect={false}
                  autoCapitalize= 'none'
                  onChangeText = {(text) => this.setState({confirmPassword: text.trim()})}
                />
            </View> */}
          
            {/* <View style={{flex: 0.12, justifyContent: 'center', marginTop : moderateScale(10)}}>
              <TouchableOpacity style={{flex: 0.75, justifyContent: 'center', borderRadius: 2}} onPress={this.done}>
                <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{flex:1, borderRadius: 2}} start={{x:0, y:0}} end={{x:1, y:0}}>
                  <View style={{flex:1, justifyContent: 'center', backgroundColor: 'transparent'}}>
                    <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{string('ContactUs.SendBTN')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View> */}
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.loginButton} onPress={() => this.done()}>
                      <Text style={styles.loginButtonText}>Send</Text>
                  </TouchableOpacity>
      </SafeAreaView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
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
  height: '22@vs',
  width: '70@s',
},
countryInnerContainer: {
 
  width: width - 46,
  
  marginLeft:'2@ms'
},
countryView: {
  height: '19@vs',
  width: width - 46,
  position: 'absolute',
  
 // marginTop:'16@vs',
 
  
  //alignItems: 'center'
},
countryText: {
  lineHeight: '19@ms',
  fontSize: '16@ms',
  color: colors.black,
  opacity: 0.80,
 // marginTop:'5@vs',
  
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
  width: '70@s',
  position: 'absolute',
  justifyContent: 'center',
  //justifyContent: 'center',
  //alignItems: 'center'
},
countryCodeText: {
  //lineHeight: '19@ms',
  fontSize: '16@ms',
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
}

  
})