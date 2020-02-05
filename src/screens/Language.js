import React, { Component } from 'react';
import { SafeAreaView, Alert, Text, View, Image, TouchableOpacity, AsyncStorage} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import I18n from 'react-native-i18n';
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors  from '../../theme/colors';

class Language extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      enSelected: false,
      arSelected: false
    }
    if (I18n.currentLocale() == 'ar') {
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
  asqw = async (getwq) => {
    await AsyncStorage.setItem('lang', JSON.stringify(getwq));
    this.props.actions.setLanguage(getwq);
    if (getwq == 'ar') {
      this.setState({ arSelected: true });
    }
    else {
      this.setState({ enSelected: true });
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
  english = () => {
    console.log('english')
    this.setState({ enSelected: true, arSelected: false })
  }
  arabic = () => {
    console.log('arabic')
    this.setState({ enSelected: false, arSelected: true })
  }
  save = async () => {
    let { enSelected, arSelected } = this.state;
    if (enSelected) {
      I18n.locale = 'en';
      I18n.currentLocale();
      await this.asqw('en');
      this.sendLang('en');
    }
    if (arSelected) {
      I18n.locale = 'ar';
      I18n.currentLocale();
      await this.asqw('ar');
      this.sendLang('ar')
    }
  }
  sendLang = (lang) => {
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
      let { loginID } = this.props.user;
      this.setState({ visible: true, isDisabled: true })
      let values = { 'talentId': loginID, 'langaugeType': lang }
      console.log(values)
      axios.post(`${Appurl.apiUrl}updateTalentLangauge`, values)
        .then((response) => {
          console.log(response)
          Alert.alert(
            '',
            response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false })
                  this.props.navigator.pop()
                }
              }
            ],
            { cancelable: false }
          );
        })
        .catch((error) => {
          console.log(error.response)
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
  render() {
    let { enSelected, arSelected, isDisabled, visible } = this.state;
    let { textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ color: '#000000', fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold', textAlign: textAlign }}>{string('Language.LanguageText')}</Text>
          </View>
          <View style={{ flex: 0.15 }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.arabic}>
              <Text style={{ color: arSelected ? '#FF6262' : '#4A4A4A', fontSize: 16, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman', textAlign: textAlign }}>{string('Language.ArabicText')}</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ flex: 0.5, justifyContent: 'center' }} onPress={this.english}>
              <Text style={{ color: enSelected ? '#FF6262' : '#4A4A4A', fontSize: 16, fontFamily: lang == 'en' ? 'SFUIDisplay-Medium' : 'HelveticaNeueLTArabic-Roman', textAlign: textAlign }}>{string('Language.EnglishText')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.55 }}></View>
          <View style={{ flex: 0.12, justifyContent: 'center' }}>
            <TouchableOpacity style={{ flex: 0.75, justifyContent: 'center', borderRadius: 2 }} onPress={this.save}>
              <LinearGradient colors={['#8D3F7D', '#D8546E']} style={{ flex: 1, borderRadius: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'transparent' }}>
                  <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{string('Language.SaveBTN')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(Language);
