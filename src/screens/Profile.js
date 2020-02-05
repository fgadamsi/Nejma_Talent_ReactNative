import React, { Component } from 'react';
import { Platform, SafeAreaView, Text, Alert, ScrollView, View, Image, TouchableOpacity, Dimensions, AsyncStorage} from 'react-native';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from 'react-native-fast-image';
import NetInfo from "@react-native-community/netinfo";
import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import LatestVideos from './../components/LatestVideos';
import Payments from './../components/Payments';
import colors  from '../../theme/colors';

class Profile extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      navbarStatus: [true, true],
      tab: 0,
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
    this.props.actions.ButtonDisabled(false)
    this.props.actions.ButtonDisabled1(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  edit = async () => {
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
      this.props.actions.ButtonDisabled1(true);
      this.setState({ visible: true })
      let values = { 'talentId': this.props.user.loginID }
      await axios.post(`${Appurl.apiUrl}checkTalentEmailverified`, values)
        .then((response) => {
          console.log(response)
          this.setState({ visible: false })
          this.props.actions.setEmailVerified(response.data.isEmailVerified);
          console.log(this.props,'thea oaofsjopaj')
          Navigation.push(this.props.componentId, {
            component: {
              name: 'FamCamTalent.EditProfile',
              options: {
                topBar: {
                    visible: false
                }
              }
            }
          });
        }).catch((error) => {
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
  navbarToggle = (to) => {
    let { tab, navbarStatus } = this.state;
    if (to == 'hidden') {
      navbarStatus[tab] = false;
    }
    else {
      navbarStatus[tab] = true;
    }
    this.setState({ navbarStatus });
  }
  back = () => {
    this.setState({ isDisabled: false })
    Navigation.pop(this.props.componentId);
  }
  setting = () => {
    this.props.actions.ButtonDisabled1(true);
    this.setState({ isDisabled: false })
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.Settings',
          options: {
            topBar: {
                visible: false
            }
          }
        }
      });
  }
  render() {
    let { tab, navbarStatus, isDisabled, visible } = this.state;
    let { flexDirection, textAlign, lang, allow1, loginImage, loginName, loginBio } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1 }}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.05, marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, alignItems: 'flex-start', justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
            <TouchableOpacity disabled={allow1} hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ height: 30, width: 30, alignItems: 'flex-end', justifyContent: 'center' }} onPress={this.setting}>
              <Image source={require('./../../images/ic_settings.png')} style={{ height: 20, width: 20 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.25, marginHorizontal: 24 }}>
            <View style={{ flex: 0.65, flexDirection: flexDirection, alignItems: 'center' }}>
              <View style={{ height: 80, width: 80 }}>
                <FastImage style={{ height: 80, width: 80, borderRadius: 40 }} source={{ uri: `${Appurl.apiUrl}resizeimage?imageUrl=` + loginImage + '&width=160&height=160' }} />
                <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', position: 'absolute', top: 0, bottom: -10, left: 0, right: -10 }}>
                  <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow1} onPress={this.edit}>
                    <Image style={{  tintColor:colors.themeColor}} source={require('./../../images/edit.png')} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 100, width: Dimensions.get('window').width - 114, alignItems: lang == 'en' ? 'flex-start' : 'flex-end' }}>
                <Text numberOfLines={2} style={{ marginLeft: lang == 'en' ? 17 : null, marginRight: lang == 'ar' ? 17 : null, color: '#1A1919', fontSize: 36, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFProText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{loginName}</Text>
              </View>
            </View>
            <View style={{ flex: 0.25 }}>
              <Text numberOfLines={2} style={{ color: '#474D57', fontSize: 12, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{loginBio}</Text>
            </View>
            <View style={{ flex: 0.1 }}></View>
          </View>
          <View style={{ flex: 0.7 }}>
            <ScrollableTabView
              onChangeTab={({ i }) => { this.setState({ tab: i }); this.navbarToggle('shown') }}
              style={{ borderColor: 'transparent', borderWidth: 0 }}
              tabBarUnderlineStyle={{ backgroundColor: colors.themeColor, height: 2 }}
              tabBarTextStyle={{ fontSize: 12, backgroundColor: 'transparent', top: 2, borderColor: 'transparent', borderWidth: 0 }}
              tabBarActiveTextColor={colors.themeColor}
              tabBarInactiveTextColor='black'
              tabBarBackgroundColor='transparent'
              tabBarTextStyle={{ fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}
              prerenderingSiblingsNumber={Infinity}>
              <LatestVideos tabLabel={string('Profile.VideoTabLabel')} navbarToggle={this.navbarToggle}  {...this.props} />
              <Payments tabLabel={string('Profile.PaymentTabLabel')} navbarToggle={this.navbarToggle}  {...this.props} />
            </ScrollableTabView>
          </View>
        </View>
      </SafeAreaView>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
