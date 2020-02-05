import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, Text, View, Image, TouchableOpacity, AsyncStorage,  Switch } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
// import OneSignal from 'react-native-onesignal';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors  from '../../theme/colors';

class Settings extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
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
    this.props.actions.ButtonDisabled2(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({ isDisabled: false })
    Navigation.pop(this.props.componentId);
  }
  changePassword = () => {
    this.props.actions.ButtonDisabled2(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.ChangePassword',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  
  }
  changePrice = () => {
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
      this.setState({ isDisabled: true, visible: true })
      let values = { 'talentId': loginID }
      console.log(values)
      return axios.post(`${Appurl.apiUrl}givePriceToTalentToUpdate`, values)
        .then((response) => {
          console.log(response)
          this.props.actions.renderChangePrice(Number(response.data.setPrice[0].price.minPrice), Number(response.data.setPrice[0].price.maxPrice), Number(response.data.data), Number(response.data.percentagePrice[0].price))
          this.setState({ isDisabled: false, visible: false });
          this.props.actions.ButtonDisabled2(true);
          setTimeout(() => {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'FamCamTalent.ChangePrice',
                options: {
                  topBar: {
                      visible: false
                  }
                }
              }
            });
          }, 1000)
        }).catch((error) => {
          console.log(error)
          if (error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.msg,
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
  language = () => {
    this.props.actions.ButtonDisabled2(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.Language',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  }

  bankDetail = () => {
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
      this.setState({ isDisabled: true, visible: true })
      return axios.get(`${Appurl.apiUrl}bankDetail?talentId=` + this.props.user.loginID)
        .then((response) => {
          console.log(response)
          this.props.actions.bankAccountDetails(response.data.data.bankName, response.data.data.accountHolderName, response.data.data.accountNumber, response.data.data.ibanNumber)
          this.setState({ isDisabled: false, visible: false });
          this.props.actions.ButtonDisabled2(true);
          setTimeout(() => {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'FamCamTalent.BankDetail',
                options: {
                  topBar: {
                      visible: false
                  }
                }
              }
            });
          }, 1000)
        }).catch((error) => {
          console.log(error)
          if (error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.msg,
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
  privacyPolicy = () => {
    this.props.actions.ButtonDisabled2(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.PrivacyPolicy',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  }
  contactUs = () => {
    this.props.actions.ButtonDisabled2(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.ContactUs',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  
  }
  termsOfService = () => {
    this.props.actions.ButtonDisabled2(true);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.TermsOfService',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
   
  }
  logout = async () => {
    Alert.alert(
      '',
      string('Settings.LogOutText'),
      [
        {
          text: string('Settings.YesLabel'), onPress: async () => {
            try {
              this.setState({ isDisabled: false })
            //  OneSignal.deleteTag("phone");
              this.props.actions.clearOnLogout()
              await AsyncStorage.removeItem('talent');
              await AsyncStorage.removeItem('fcmToken');
              console.log('m working....')
              Navigation.push(this.props.componentId, {
                component: {
                  name: 'FamCamTalent.Splash',
                  options: {
                    topBar: {
                        visible: false
                    }
                  }
                }
              });
             
            }
            catch (error) { }
          }
        },
        { text: string('Settings.NoLabel'), style: 'cancel' }
      ],
      { cancelable: false }
    );
  }
  render() {
    let { visible, isDisabled } = this.state;
    let { flexDirection, textAlign, lang, loginID, online, allow2 } = this.props.user;
    console.log(online, 'value')
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.07, justifyContent: 'flex-start' }}>
            <Text style={{ textAlign: textAlign, fontSize: 24, color: 'black', fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('Settings.settingsText')}</Text>
          </View>
          <View style={{ flex: 0.06, borderBottomWidth: 0.5, borderBottomColor: '#474D57', justifyContent: 'flex-end' }}>
            <Text style={{ textAlign: textAlign, color: '#474D57', fontSize: 12, marginBottom: 7, fontFamily: lang == 'en' ? 'SFProText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('Settings.label1')}</Text>
          </View>
          <View style={{ flex: 0.40 }}>
            <View style={{ flex: 1 / 5, flexDirection: flexDirection }}>
              <View style={{ flex: 0.4, justifyContent: 'center' }}>
                <Text style={{ color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light', textAlign: textAlign }}>{string('Settings.l1O1')}</Text>
              </View>
              <View style={{ flex: 0.4 }}></View>
              <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'flex-end' }}>
              <Switch
                onValueChange={(online) => {
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
                  let values = { 'talentId': loginID, 'online': online }
                  console.log(values);
                  axios.post(`${Appurl.apiUrl}upForWork`, values)
                    .then(async (response) => {
                      console.log(response)
                      this.props.actions.setOnline(online)
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
                                this.setState({ isDisabled: false, visible: false });
                              }
                            }
                          ],
                          { cancelable: false }
                        );
                      }
                    })
                }
              }}
        
         value = {online}/>
               
              </View>
            </View>
            <View style={{ flex: 1 / 5, flexDirection: flexDirection }}>
              <View style={{ flex: 0.4, justifyContent: 'center' }}>
                <Text style={{ color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light', textAlign: textAlign }}>{string('Settings.l1O2')}</Text>
              </View>
              <View style={{ flex: 0.4 }}></View>
              <View style={{ flex: 0.2, justifyContent: 'center', alignItems: 'flex-end' }}>
              <Switch
                 onValueChange={(vip) => {
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
                    let values = { 'talentId': loginID, 'vipAccepted': vip }
                    console.log(values);
                    axios.post(`${Appurl.apiUrl}talentAllowVipAccessable`, values)
                      .then(async (response) => {
                        console.log(response)
                        this.props.actions.setVip(vip)
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
                                  this.setState({ isDisabled: false, visible: false });
                                }
                              }
                            ],
                            { cancelable: false }
                          );
                        }
                      })
                  }
                }}
         value = {this.props.user.isVip}/>
              </View>
            </View>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={this.changePassword}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l1O3')}</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={this.changePrice}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l1O4')}</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={this.language}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l1O5')}</Text>
            </TouchableOpacity> */}
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 5, justifyContent: 'center' }} onPress={this.bankDetail}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l1O6')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.015 }}></View>
          <View style={{ flex: 0.06, borderBottomWidth: 0.5, borderBottomColor: '#474D57', justifyContent: 'flex-end' }}>
            <Text style={{ textAlign: textAlign, color: '#474D57', fontSize: 12, marginBottom: 7, fontFamily: lang == 'en' ? 'SFProText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('Settings.label2')}</Text>
          </View>
          <View style={{ flex: 0.2 }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 3, justifyContent: 'center' }} onPress={this.privacyPolicy}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l2O1')}</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 3, justifyContent: 'center' }} onPress={this.contactUs}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l2O2')}</Text>
            </TouchableOpacity>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={allow2} style={{ flex: 1 / 3, justifyContent: 'center' }} onPress={this.termsOfService}>
              <Text style={{ textAlign: textAlign, color: '#1A1919', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('Settings.l2O3')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.03 }}></View>
          <View style={{ height: 0.4, backgroundColor: '#474D57' }}></View>
          <View style={{ flex: 0.11, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ flex: 0.6, justifyContent: 'center' }} onPress={this.logout}>
              <Text style={{ textAlign: textAlign, color: 'black', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('Settings.logutBTN')}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
