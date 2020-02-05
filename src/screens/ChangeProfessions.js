import React, { Component } from 'react';
import { SafeAreaView, ScrollView, Alert, Text, View, Dimensions, Image, TouchableOpacity, AsyncStorage} from 'react-native';

import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from "@react-native-community/netinfo";
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import colors  from '../../theme/colors';
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setTimeout } from 'core-js';

class ChangeProfessions extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      arr: null,
      arra: [''],
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

    setTimeout(() => {
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
        let { selected, arra } = this.state;
        let values = { 'talentId': this.props.user.loginID }
        this.setState({ visible: true});
        return axios.post(`${Appurl.apiUrl}listofprofessions`, values)
          .then((response) => {
            console.log(response);
            this.setState({ isDisabled: false, visible: false, arr: response.data.data });
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
                      this.setState({ isDisabled: false, visible: false });
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          })
      }
    }, 200);
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({ isDisabled: false, visible: false })
    Navigation.pop(this.props.componentId);
  }
  update = () => {
    let { selected, visible } = this.state;
    if (selected.length < 1) {
      Alert.alert(
        '',
        string('ProfileDiscover.CategoryRequired'),
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
      this.setState({ isDisabled: true, visible: true })
      console.log(selected)
      let values = { 'talentId': this.props.user.loginID, 'list': selected }
      return axios.post(`${Appurl.apiUrl}updateTalentProfessions`, values)
        .then((response) => {
          this.getData(response)
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
  }
  getData = async (response) => {
    this.setState({ isDisabled: false, visible: false });
    let loginDetails = { 'talentId': this.props.user.loginID, 'talentName': this.props.user.loginName, 'talentBio': this.props.user.loginBio, 'talentImage': this.props.user.loginImage, 'handel': this.props.user.loginHandel, 'professions': this.state.selected, 'talentEmail': this.props.user.loginEmail };
    try {
      await AsyncStorage.setItem('talent', JSON.stringify(loginDetails))
      this.props.actions.setLoginDetails(this.props.user.loginID, this.props.user.loginName, this.props.user.loginBio, this.props.user.loginImage, this.props.user.loginHandel, this.state.selected, this.props.user.loginEmail);
      Alert.alert(
        '',
        string('ProfileDiscover.updateSuccessAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({ isDisabled: false, visible: false });
              Navigation.pop(this.props.componentId);
            }
          }
        ],
        { cancelable: false }
      );
    }
    catch (error) {
      console.log(error)
    }
  }
  selectCategory = (category) => {
    console.log(category)
    let { selected, arra } = this.state;
    console.log(selected, arra)
    console.log(selected.indexOf(category))
    if (selected.indexOf(category) > -1) {
      let index = selected.indexOf(category);
      selected.splice(index, 1);
      arra[this.props.user.lang == 'en' ? category.professionCatagory.en : category.professionCatagory.ar] = false;
      this.setState({ selected, arra });
    }
    else if (selected.length < 2) {
      selected.push(category);
      arra[this.props.user.lang == 'en' ? category.professionCatagory.en : category.professionCatagory.ar] = true;
      this.setState({ selected, arra });
    }
  }
  render() {
    let { arra, visible, isDisabled, arr } = this.state;
    let { lang } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ color: '#000000', fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('ProfileDiscover.ProfileDiscoverText')}</Text>
          </View>
          <View style={{ flex: 0.09 }}>
            <Text style={{ fontSize: 14, color: '#474D57', textAlign: 'left', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('ProfileDiscover.mainText')}
              <Text style={{ fontSize: 14, color: '#B5B5B5', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}> {string('ProfileDiscover.conditionText')}</Text>
            </Text>
          </View>
          <View style={{ flex: 0.55 }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginVertical: 15 }}>
              <View style={{ flex: 1, width: Dimensions.get('window').width - 50, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {arr ? arr.map((val, i) => {
                  return <TouchableOpacity key={i} style={{ width: (Dimensions.get('window').width - 20) / 3.5, height: 40, backgroundColor: '#FFFFFF', justifyContent: 'center', borderColor: colors.themeColor, borderWidth: 1, borderRadius: 24, marginBottom: 16, marginRight: 5, alignItems: 'center', alignSelf: 'center' }}
                    onPress={() => { this.selectCategory(val) }}>
                    {arra[lang == 'en' ? val.professionCatagory.en : val.professionCatagory.ar] ?
                      <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{ width: (Dimensions.get('window').width - 20) / 3.5, height: 40, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                        <Text style={{ textAlign: 'center', color: '#FFFFFF', fontSize: 14, backgroundColor: 'transparent', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{lang == 'en' ? val.professionCatagory.en : val.professionCatagory.ar}</Text>
                      </LinearGradient>
                      :
                      <View style={{ width: (Dimensions.get('window').width - 20) / 3.5, height: 40, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: 'center', color: colors.themeColor, fontSize: 14, backgroundColor: 'transparent', fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>
                          {lang == 'en' ? val.professionCatagory.en : val.professionCatagory.ar}
                        </Text>
                      </View>
                    }
                  </TouchableOpacity>
                }) : null}
              </View>
            </ScrollView>
          </View>
          <View style={{ flex: 0.12, justifyContent: 'center' }}>
            <TouchableOpacity style={{ flex: 0.75, justifyContent: 'center', borderRadius: 2 }} onPress={this.update}>
              <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{ flex: 1, borderRadius: 2 }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'transparent' }}>
                  <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Medium' : 'HelveticaNeueLTArabic-Roman' }}>{string('ChangePrice.UpdateBTN')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.07 }}></View>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangeProfessions);
