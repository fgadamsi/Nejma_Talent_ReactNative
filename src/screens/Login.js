import React, { Component } from 'react';
import { Platform, SafeAreaView, TextInput, Alert, Text, View,Dimensions, Image, TouchableOpacity, AsyncStorage } from 'react-native';
import { ScaledSheet } from "react-native-size-matters";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from "@react-native-community/netinfo";
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import * as userActions from '../actions/userActions';
const { width, height } = Dimensions.get('window')
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Login extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      emailPhone: '',
      password: '',
      show_password: true,
      isPasswordValid: false,
      isEmailPhoneValid: false,
      visible: false,
      isDisabled: false,
      crossIcon: false, 
      fcmToken : ""
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('fcmToken')
    .then((token) => {
    console.log('fcmToken', token)
    this.setState({fcmToken : token})
    });
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
        this.props.actions.checkInternet(false);
      }
      else {
        this.props.actions.checkInternet(true);
      }
    });
    NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled(false)
    this.props.actions.ButtonDisabled1(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({ isDisabled: false })
    Navigation.pop(this.props.componentId);
  }
  _showHidePassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
    this.setState({ crossIcon: !this.state.crossIcon });
}

  validationRules = () => {
    return [
      {
        field: this.state.emailPhone,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      },
      {
        field: this.state.password,
        name: 'Password',
        rules: 'required|no_space|min:6'
      },
    ]
  }
  validationArRules = () => {
    return [
      {
        field: this.state.emailPhone,
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
  login2Screen = () => {
    let { actions } = this.props;
    let { emailPhone, isEmailPhoneValid, password, isPasswordValid, visible } = this.state;
    let { lang } = this.props.user;
    let validation = lang == 'en' ? Validation.validate(this.validationRules()) : ValidationAr.validate(this.validationArRules())
    if (validation.length != 0) {
      return Alert.alert(
        '',
        validation[0],
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
    else if (!this.props.user.netStatus) {
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
    else {
      this.setState({ isDisabled: true, visible: true })
   //   OneSignal.sendTag("phone", emailPhone);
      actions.setLoginEmailPhone(emailPhone);
      let values = { 'authfield': emailPhone, 'password': password, 'langaugeType': lang,  "deviceToken" : this.state.fcmToken }
      console.log('loginData', values)
      console.log('url', `${Appurl.apiUrl}loginTalent`)
      return axios.post(`${Appurl.apiUrl}loginTalent`, values)
        .then((response) => {
          console.log('$$$$$$$$$$$$$$$$$$', response)
          this.props.actions.ButtonDisabled(false)
          this.props.actions.ButtonDisabled1(false)
          return this.getData(response, values);
        }).catch((error) => {
          console.log(error.response);
          if (error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({ isDisabled: false, visible: false })
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
    let { visible } = this.state;
    let { actions } = this.props;
    this.setState({ isDisabled: false, visible: false })
    this.login(response);
  }
  login = async (response) => {
    let loginDetails = { 'talentId': response.data.talentId, 'talentName': response.data.name, 'talentBio': response.data.Bio, 'talentImage': response.data.profilePicUrl, 'handel': response.data.yourHandle, 'professions': response.data.professions, 'talentEmail': response.data.email, 'accessToken'  : response.data.accessToken};
    try {
      await AsyncStorage.setItem('talent', JSON.stringify(loginDetails));
      await AsyncStorage.setItem('isOnline', JSON.stringify(response.data.online))
        this.goToHome()
    }
    catch (error) {
      console.log(error)
    }
  }

  goToHome = () => {
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
  forgot = () => {
    this.props.actions.ButtonDisabled1(true);
    this.setState({ isDisabled: false, visible: false })
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.ForgotPassword',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
   
  }
  render() {
    let { emailPhone, isEmailPhoneValid, password, show_password, isPasswordValid, visible, isDisabled } = this.state;
    let { textAlign, lang, allow1 } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <KeyboardAwareScrollView keyboardShouldPersistTaps="always" style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center', marginTop: moderateScale(20)}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
            <Image source={require('./../../images/ic_close_login.png')} />
            </TouchableOpacity>
          </View>
          <View style={styles.topView}>
          <Image   source={require('./../../images/smallLogo.png')}  />
          </View>
          <View style={{flex:0.07}}>
            <Text style = {styles.registerHeading}>{string('Login1.gladText')}</Text>
          </View>
          <View style = {{flex:0.15, marginTop:moderateScale(20)}}>
             <View style={{ height: verticalScale(18) }} />
                    <View style={styles.inputMainView}>
                        <Text style={styles.inputLabel}>{string('Login1.email')}</Text>
                        <TextInput style={styles.textInputStyle}
                          selectionColor={colors.themeColor}
                            ref={email => this.emailPhone = emailPhone}
                            underlineColorAndroid="transparent"
                            placeholderTextColor={colors.textColor}
                            placeholder={string('register.email')}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType={"next"}
                            onChangeText={(emailPhone) => this.setState({ emailPhone })}
                            value={this.state.emailPhone} />
                        <View style={styles.inputLine} />
                    </View>
            
          </View>
          <View style = {{flex:0.12, flexDirection: 'row',marginTop:moderateScale(10)}}>
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
            </View>
          
          <View style={{flex: 0.1, justifyContent: 'flex-start',marginTop:moderateScale(10)}}>
            <TouchableOpacity style={{justifyContent: 'flex-start'}} onPress = {() => {this.forgot()}}>
              <Text style={{fontSize: moderateScale(12), color: colors.themeColor, textAlign: 'right', fontFamily: fontFamily.regular, lineHeight : moderateScale(16)}}> {string('Login1.forgotPassword')} </Text>
            </TouchableOpacity>
          </View>
         
        
           <TouchableOpacity style={styles.loginButton} onPress={() => this.login2Screen()}>
                        <Text style={styles.loginButtonText}>{string('Login1.login')}</Text>
                    </TouchableOpacity>
        </KeyboardAwareScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
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
    marginTop:'10@ms'
    // flex:0.10, 
    // justifyContent: 'flex-start',
    // flexDirection : 'row'
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
imageLogo : {}
  
})

