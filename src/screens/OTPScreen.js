import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, TextInput, Text, View, Image,Dimensions,TouchableOpacity } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
const { width, height } = Dimensions.get('window')
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors  from '../../theme/colors';

class OTPScreen extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      one: '',
      two: '',
      three: '',
      four: '',
      isOneValid: false,
      isTwoValid: false,
      isThreeValid: false,
      isFourValid: false,
      visible: false,
      isDisabled: false
    }
  }

  componentDidMount() {
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({ isDisabled: false })
    Navigation.pop(this.props.componentId);
  }
  resendOtp = () => {
    if (!this.props.user.netStatus) {
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
      this.setState({ isDisabled: true, visible: true });
      let values = { 'talentId': this.props.user.registerID };
      return axios.post(`${Appurl.apiUrl}resendTalentOtp`, values)
        .then((response) => {
          this.setState({ isDisabled: false, visible: false });
          if (Platform.OS == 'ios') {
            setTimeout(() => {
              Alert.alert(
                '',
                string('OTPScreen.OtpSuccess'),
                [
                  {
                    text: string('globalValues.AlertOKBtn'),
                    onPress: () => {

                    }
                  }
                ],
                { cancelable: false }
              )
            }, 600)
          }
          else {
            Alert.alert(
              '',
              string('OTPScreen.OtpSuccess'),
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {

                  }
                }
              ],
              { cancelable: false }
            )
          }
        }).catch((error) => {
          if (error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({ isDisabled: false, visible: false });
                  }
                }
              ],
              { cancelable: false }
            );
          }
        })
    }
  }
  validate = (field, value) => {
    let { actions } = this.props;
    let { email, callingCode, phone } = this.state;
    this.setState({ [field]: value });
    var Regex = /^[0-9]$/;
    switch (field) {
      case 'one': {
        if (!value.match(Regex)) {
          this.setState({ isOneValid: true });
        }
        else {
          this.setState({ isOneValid: false });
          this.setState({ one: value.trim() })
        }
        break;
      }
      case 'two': {
        if (!value.match(Regex)) {
          this.setState({ isTwoValid: true });
        }
        else {
          this.setState({ isTwoValid: false });
          this.setState({ two: value.trim() })
        }
        break;
      }
      case 'three': {
        if (!value.match(Regex)) {
          this.setState({ isThreeValid: true });
        }
        else {
          this.setState({ isThreeValid: false });
          this.setState({ three: value.trim() })
        }
        break;
      }
      case 'four': {
        if (!value.match(Regex)) {
          this.setState({ isFourValid: true });
        }
        else {
          this.setState({ isFourValid: false });
          this.setState({ four: value.trim() })
        }
        break;
      }
      case 'default': {
        alert(string('OTPScreen.IncorrectOtpAlert'));
        break;
      }
    }
  }
  register2 = () => {
    let { one, two, three, four, isOneValid, isTwoValid, isThreeValid, isFourValid, visible } = this.state;
    if (!one || !two || !three || !four) {
      Alert.alert(
        '',
        string('OTPScreen.4DigitAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: () => {

            }
          }
        ],
        { cancelable: false }
      )
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
    else if (!isOneValid && !isTwoValid && !isThreeValid && !isFourValid) {
      this.setState({ isDisabled: true, visible: true })
      let otp = one + two + three + four;
      let values = { 'otp': otp, 'talentId': this.props.user.registerID }
      console.log(values)
      // return this.verifyotp();
      return axios.post(`${Appurl.apiUrl}verifyTalentOtp`, values)
        .then((response) => {
          console.log(response)
          return this.verifyotp(response, values);
        }).catch((error) => {
          console.log(error)
          console.log(error.response)
          if (Platform.OS == 'ios') {
            setTimeout(() => {
              Alert.alert(
                '',
                error.response.data.msg,
                [
                  {
                    text: string('globalValues.AlertOKBtn'),
                    onPress: () => {
                      this.setState({ isDisabled: false, visible: false });
                    }
                  }
                ],
                { cancelable: false }
              );
            }, 600)
          }
          else {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({ isDisabled: false, visible: false });
                  }
                }
              ],
              { cancelable: false }
            );
          }
        })
    }
    else {
      Alert.alert(
        '',
        string('OTPScreen.IncorrectOtpAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ isDisabled: false, visible: false });
            }
          }
        ],
        { cancelable: false }
      );
    }
  }

  goToProfileDiscover = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.ProfileDiscover',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  }
  verifyotp = () => {
    this.setState({ isDisabled: false, visible: false });
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        Navigation.push(this.props.componentId, {
          component: {
            name: 'FamCamTalent.ProfileDiscover',
            options: {
              topBar: {
                  visible: false
              }
            }
          }
        });
      }, 1000)
    }
    else {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.ProfileDiscover',
          options: {
            topBar: {
                visible: false
            }
          }
        }
      });
    }
  }
  render() {
    let { email, phone, visible, isDisabled } = this.state;
    let { textAlign, lang, RegisterCallingCode, RegisterPhone, RegisterEmail } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ color: '#000000', textAlign: textAlign, fontSize: 24, fontFamily: lang == 'en' ? 'SFUIDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('OTPScreen.OTPText')}</Text>
          </View>
          <View style={{ flex: 0.09 }}>
            <Text style={{ fontSize: 14, textAlign: textAlign, color: '#474D57', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('OTPScreen.mainText')}</Text>
            <Text style={{ textAlign: textAlign, fontSize: 14, color: 'black', fontFamily: 'SFUIText-Bold' }}>{RegisterEmail}</Text>
          </View>
          <View style={{ flex: 0.15, flexDirection: 'row', justifyContent: 'space-around', }}>
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="first"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(one) => {
                this.validate('one', one)
                if (one && one.length == 1) {
                  this.refs.second.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="second"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(two) => {
                this.validate('two', two)
                if (two && two.length == 1) {
                  this.refs.third.focus();
                }
                else if (two.length == 0 || !two) {
                  this.refs.first.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="third"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="next"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(three) => {
                this.validate('three', three)
                if (three && three.length == 1) {
                  this.refs.forth.focus();
                }
                else if (three.length == 0 || !three) {
                  this.refs.second.focus();
                }
              }
              }
            />
            <TextInput
              style={{ width: 48, borderBottomColor: '#E9EAED', borderBottomWidth: 2, fontSize: 40, width: 48, textAlign: 'center' }}
              ref="forth"
              maxLength={1}
              underlineColorAndroid='transparent'
              returnKeyType="done"
              returnKeyLabel="done"
              keyboardType='numeric'
              autoCorrect={false}
              autoCapitalize='none'
              onChangeText={(four) => {
                this.validate('four', four)
                if (four.length == 0 || !four) {
                  this.refs.third.focus();
                }
              }
              }
            />
          </View>
          <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'flex-end', marginRight: 15 }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ flex: 1, marginTop: 20 }} onPress={this.resendOtp}>
              <Text style={{ fontSize: 14, color: colors.themeColor, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('OTPScreen.resendLabel')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={() => this.register2()}>
                      <Text style={styles.loginButtonText}>Submit</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(OTPScreen);
const styles = ScaledSheet.create({
  loginButton: {
    bottom : '20@ms',
    position : 'absolute',
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
});

