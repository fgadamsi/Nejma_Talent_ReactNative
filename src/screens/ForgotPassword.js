import React, { Component } from 'react';
import { SafeAreaView, Alert, Text, View, Image, TouchableOpacity, Dimensions,TextInput } from 'react-native';
import { ScaledSheet } from "react-native-size-matters";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import CountryPicker from 'react-native-country-picker-modal';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import NetInfo from "@react-native-community/netinfo";
import fontWeight from '../../theme/fontWeight';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
const { width, height } = Dimensions.get('window')
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
import { connect } from 'react-redux';

class ForgotPassword extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      email : '',
      callingCode: '+966',
      cca2: 'SA',
      visible: false,
      isPhoneValid: false,
      isDisabled: false
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
  componentWillUnmount() {
    this.props.actions.ButtonDisabled1(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    Navigation.pop(this.props.componentId);
  }
  validationRules= () => {
    return [
      {
        field: this.state.email,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      },
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.phone,
        name: 'رقم الجوال',
        rules: 'required|no_space|numeric'
      },
    ]
  }
  done = ()=> {
    let { actions } = this.props;
    let { email, callingCode, isPhoneValid, visible, isDisabled } = this.state;
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
              this.setState({isDisabled: false, visible: false});
            }
          }
        ],
        { cancelable: false }
      );
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
    //  this.setState({visible: true, isDisabled: true})
      let values = {'email' : email, 'langaugeType': 'en'}
      console.log(values, 'val')
      return axios.post(`${Appurl.apiUrl}forgotTalent`, values)
      .then((response) => {
        console.log(response, 'res')
        return this.getData(response, values);
      }).catch((error) => {
        console.log(error.response.data, 'error')
        if(error.response.data.success == 0) {
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
    let { visible } = this.state;
    this.setState({isDisabled: false, visible: false});
    Alert.alert(
      '',
      response.data.msg,
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
  }
  countryPickerModal = ()=> {
    this.refs.CountryPicker.openModal();
  }
  render() {
    let { callingCode, phone, visible, isDisabled, cca2 } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop = {{top:7, left:7, bottom:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={() => {this.back()}}>
                <Image source={require('./../../images/ic_close_login.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
           <View style={styles.topView}>
          <Image source={require('./../../images/smallLogo.png')} />
          </View>
          <View style={{flex:0.09, marginTop : moderateScale(30) }}>
            <Text style = {{fontSize: 14, color: '#474D57', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light', textAlign: textAlign}}> {string('ForgotPassword.heading')} </Text>
          </View>
          <View style = {{flex: 0.15, flexDirection: flexDirection,  marginTop : moderateScale(20)}}>
           
           
                  <View style={{ height: verticalScale(18) }} />
                    <View style={styles.inputMainView}>
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
          
          </View>
           <TouchableOpacity style={styles.loginButton} onPress={() => this.done()}>
                        <Text style={styles.loginButtonText}>{string('ForgotPassword.submit')}</Text>
                    </TouchableOpacity>
          
        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
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
    flex:0.07, 
    justifyContent: 'flex-start',
    flexDirection : 'row'
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
  top: "10@ms",
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
}
  
})



