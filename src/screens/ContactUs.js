import React, { Component } from 'react';
import { SafeAreaView, TextInput, Alert, Text, View, Dimensions, Image, TouchableOpacity, ScrollView } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import colors  from '../../theme/colors';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class ContactUs extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      contactText: ''
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
    this.props.actions.ButtonDisabled2(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    Navigation.pop(this.props.componentId);
  }
  validationRules = () => {
    return [
      {
        field: this.state.contactText,
        name: 'Message',
        rules: 'required|min:1|max:120'
      },
    ]
  }
  validationArRules = () => {
    return [
      {
        field: this.state.contactText,
        name: 'رسالة',
        rules: 'required|min:1|max:120'
      },
    ]
  }
  send = () => {
    let { contactText, visible, isDisabled } = this.state;
    let validation = this.props.user.lang == 'en' ? Validation.validate(this.validationRules()) : ValidationAr.validate(this.validationArRules())
    if (validation.length != 0) {
      return Alert.alert(
        '',
        validation[0],
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
      this.setState({ visible: true, isDisabled: true })
      let values = { 'talentId': this.props.user.loginID, 'message': contactText }
      return axios.post(`${Appurl.apiUrl}talentContactToadmin`, values)
        .then((response) => {
          Alert.alert(
            '',
            string('ContactUs.SuccessAlert'),
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false });
                  Navigation.pop(this.props.componentId);
                }
              }
            ]
          )
        })
        .catch((error) => {
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
  render() {
    let { isDisabled, visible } = this.state;
    let { textAlign, lang } = this.props.user;
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView
          style={{ height: windowHeight, backgroundColor: '#ffffff' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: windowHeight, marginHorizontal: 24 }}>
            <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
            <View style={{ flex: 0.1, justifyContent: 'center' }}>
              <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
                <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
              <Text style={{ color: '#000000', textAlign: textAlign, fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('ContactUs.ContactUsText')}</Text>
            </View>
            <View style={{ flex: 0.09 }}>
              <Text style={{ textAlign: textAlign, fontSize: 14, color: '#474D57', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('ContactUs.MainText')}</Text>
            </View>
            <View style={{ flex: 0.06 }}></View>
            <View style={{ flex: 0.4, borderWidth: 0.5, borderColor: '#474D57', borderRadius: 2 }}>
              <TextInput
                placeholder={string('ContactUs.InputText')}
                placeholderTextColor="#D5D5D5"
                style={{ fontSize: 12, textAlign: textAlign }}
                multiline={true}
                maxLength={120}
                underlineColorAndroid='transparent'
                returnKeyType="done"
                keyboardType='default'
                autoCorrect={false}
                autoCapitalize='sentences'
                onChangeText={(text) => this.setState({ contactText: text.trim() })}
              />
            </View>
            <View style={{ flex: 0.05 }}></View>
            <View style={{ flex: 0.12, justifyContent: 'center' }}>
              <TouchableOpacity style={{ flex: 0.75, justifyContent: 'center', borderRadius: 2 }} onPress={this.send}>
                <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{ flex: 1, borderRadius: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{string('ContactUs.SendBTN')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ContactUs);
