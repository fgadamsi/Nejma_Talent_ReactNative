import React, { Component } from 'react';
import { Alert, Text, View, Dimensions, TouchableOpacity, TextInput} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { verticalScale, moderateScale, scale } from 'react-native-size-matters';
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import colors  from '../../theme/colors';

class RejectReason extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      option1Selected: false,
      option2Selected: false,
      option3Selected: false,
      option4Selected: false,
      option5Selected: false,
      isSelected: false,
      optionOrText: false,
      selectedOption: '',
      isDisabled: false,
      visible: false
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  selectOption = (option) => {
    let { option1Selected, option2Selected, option3Selected, option4Selected, option5Selected, optionOrText, selectedOption } = this.state;
    if (option === string('RejectReason.option1')) {
      this.setState({ option1Selected: true, option2Selected: false, option3Selected: false, option4Selected: false, option5Selected: false, isSelected: true, selectedOption: option })
    }
    else if (option === string('RejectReason.option2')) {
      this.setState({ option1Selected: false, option2Selected: true, option3Selected: false, option4Selected: false, option5Selected: false, isSelected: true, selectedOption: option })
    }
    else if (option === string('RejectReason.option3')) {
      this.setState({ option1Selected: false, option2Selected: false, option3Selected: true, option4Selected: false, option5Selected: false, isSelected: true, selectedOption: option })
    }
    else if (option === string('RejectReason.option4')) {
      this.setState({ option1Selected: false, option2Selected: false, option3Selected: false, option4Selected: true, option5Selected: false, isSelected: true, selectedOption: option })
    }
    else if (option === string('RejectReason.option5')) {
      this.setState({ option1Selected: false, option2Selected: false, option3Selected: false, option4Selected: false, option5Selected: true, optionOrText: true, selectedOption: '' })
    }
  }
  submit = () => {
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
      let { isSelected, selectedOption } = this.state;
      let { loginID, rejectuser, rejectid } = this.props.user;
      if (isSelected) {
        this.setState({ isDisabled: true, visible: true })
        let values = { 'talentId': loginID, 'userId': rejectuser, 'requestId': rejectid, 'reason': selectedOption }
        console.log(values)
        return axios.post(`${Appurl.apiUrl}rejectUserRequest`, values)
          .then((response) => {
            let value = { 'talentId': loginID }
            axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, value)
              .then((response) => {
                console.log(response)
                this.props.actions.setUserRequests(response.data.data)
                this.props.actions.setOnline(response.data.online)
              }).catch((error) => {
                console.log(error.response)
                if (error.response.data.success == 0) {
                  return Alert.alert(
                    '',
                    error.response.data.msg,
                    [
                      {
                        text: string('globalValues.AlertOKBtn'),
                        onPress: () => {
                          this.setState({ isDisabled: false, visible: false, flip: false })
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                }
              })
            this.setState({ isDisabled: false, visible: false })
            this.closeSubmit()
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
                      this.props.actions.setRejectId('', '', '');
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
          string('RejectReason.ReasonRequired'),
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
    }
  }
  closeSubmit = () => {
    setTimeout(() => {
      Navigation.dismissOverlay(this.props.componentId);
    }, 600)
  }
  options = () => {
    let { option1Selected, option2Selected, option3Selected, option4Selected, option5Selected } = this.state;
    let { lang } = this.props.user;
    return <View style={{ flex: 1, marginHorizontal: 24 }}>
      <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={() => this.selectOption(string('RejectReason.option1'))}>
        <Text style={{ color: option1Selected ? '#FF6262' : '#474D57', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('RejectReason.option1')}</Text>
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={() => this.selectOption(string('RejectReason.option2'))}>
        <Text style={{ color: option2Selected ? '#FF6262' : '#474D57', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('RejectReason.option2')}</Text>
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={() => this.selectOption(string('RejectReason.option3'))}>
        <Text style={{ color: option3Selected ? '#FF6262' : '#474D57', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('RejectReason.option3')}</Text>
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={() => this.selectOption(string('RejectReason.option4'))}>
        <Text style={{ color: option4Selected ? '#FF6262' : '#474D57', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('RejectReason.option4')}</Text>
      </TouchableOpacity>
      <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={() => this.selectOption(string('RejectReason.option5'))}>
        <Text style={{ color: option5Selected ? '#FF6262' : '#474D57', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('RejectReason.option5')}</Text>
      </TouchableOpacity>
    </View>
  }
  other = () => {
    let { textAlign, lang } = this.props.user;
    return <View style={{ flex: 1, marginHorizontal: 24 }}>
      <TextInput
        style={{ fontSize: 14, textAlign: textAlign }}
        placeholder={string('RejectReason.otherPlaceholder')}
        placeholderTextColor="#9B9B9B"
        multiline={true}
        underlineColorAndroid='transparent'
        returnKeyType="done"
        returnKeyLabel="done"
        keyboardType='default'
        autoCorrect={false}
        autoCapitalize='none'
        onChangeText={(inputData) => this.otherInput(inputData)}
      />
    </View>
  }
  otherInput = (daTa) => {
    if (daTa == '') {
      Alert.alert(
        '',
        string('RejectReason.ReasonRequired'),
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
    this.setState({ selectedOption: daTa.trim(), isSelected: true })
  }
  close = () => {
   Navigation.dismissOverlay(this.props.componentId);
  }
  render() {
    let { optionOrText, isDisabled, visible } = this.state;
    let { lang } = this.props.user;
    return (
      <View style={{ height: Dimensions.get('window').height * 0.6, width: Dimensions.get('window').width * 0.8, backgroundColor: 'white', borderRadius: 10,
    marginTop: moderateScale(60), alignSelf: 'center'}}>
        <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
        <View style={{ flex: 1 }}>
          <View style={{ flex: 0.15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' }}>
            <View style={{ flex: 1, marginHorizontal: 24, justifyContent: 'center', backgroundColor: 'transparent' }}>
              <Text style={{ fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold', textAlign: 'center' }}>{string('RejectReason.titleText')}</Text>
            </View>
          </View>
          <View style={{ flex: 0.72 }}>
            {optionOrText ? this.other() : this.options()}
          </View>
          <View style={{ flex: 0.13, borderTopWidth: 1, borderTopColor: '#E0E0E0', flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.close}>
              <Text style={{ fontSize: 14, textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('RejectReason.cancelText')}</Text>
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: '#E0E0E0' }}></View>
            <TouchableOpacity disabled={isDisabled} style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.submit}>
              <Text style={{ fontSize: 14, textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('RejectReason.doneText')}</Text>
            </TouchableOpacity>
          </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(RejectReason);
