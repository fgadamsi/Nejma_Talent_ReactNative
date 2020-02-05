
'use strict';
import React, { Component } from 'react';
import { Platform, SafeAreaView, Image, Alert, Text, View,Dimensions, TouchableOpacity, Slider, StyleSheet } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
// var Slider = require('react-native-slider');
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import * as userActions from '../actions/userActions';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const { width, height } = Dimensions.get('window')
var val = 0;

class ValueText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curValue: props.initial,
    };
    val = props.initial
  }
  onChange(curValue) {
    let roundNumber = Math.round(curValue);
    this.setState({ curValue: roundNumber });
    val = roundNumber;
  }
  render() {
    return (
      <Text style={{ textAlign: 'center', color: colors.themeColor, fontSize: 14, fontFamily: 'SFUIDisplay-Bold' }}> {this.state.curValue}</Text>
    );
  }
}
class CategoryPrice extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isDisabled: false,
      minPrice: 10,
      maxPrice: 10,
      percentageCut: 0
    }
  }
  componentWillReceiveProps() {
    this.setState({ visible: false, isDisabled: false })
  }

  back = () => {
    Navigation.pop(this.props.componentId);
  }

  componentDidMount() {
    const slider1 = this.refs.slider1;
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
        this.setState({isDisabled: false})
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
        this.setState({ isDisabled: true })
        let values = { 'talentId': this.props.user.registerID }
        return axios.post(`${Appurl.apiUrl}renderSelectedProfessions`, values)
          .then((response) => {
            this.setState({ isDisabled: false, visible: false, minPrice: Number(response.data.data[0].price.minPrice), maxPrice: Number(response.data.data[0].price.maxPrice), percentageCut: Number(response.data.percentage[0].price) });
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
    val = 0;
    this.props.actions.ButtonDisabled1(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  done = () => {
    if (!this.props.user.netStatus) {
      this.setState({isDisabled: false})
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
    else{
     // this.getData()
      let values = { 'talentId': this.props.user.registerID, 'price': val, 'brandPrice' : val }
      console.log(values, 'val')
      this.setState({ visible: true, isDisabled: true })
      return axios.post(`${Appurl.apiUrl}setPriceOfTalent`, values)
        .then((response) => {
          console.log(response);
          return this.getData(response);
        })
        .catch((error) => {
          console.log('error', error.response)
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
  getData = (response) => {
    let { isDisabled, visible } = this.state;
    this.setState({ isDisabled: false, visible: false });
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        this.goToPage()
      }, 1000)
    }
    else {
     this.goToPage()
    }
  }
  goToPage = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.Profile1',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  }
  render() {
    let { minPrice, maxPrice, percentageCut, visible, isDisabled } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
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
            <Text style={{ color: '#000000', fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold', textAlign: textAlign }}>{string('CategoryPrice.categoryPriceText')}</Text>
          </View>
          <View style={{ flex: 0.25, marginLeft: -10, justifyContent: 'center' }}>
          {/* <MKSlider
              ref="slider1"
              min={minPrice}
              max={maxPrice}
              value={val == 0 ? minPrice : val}
              trackSize={10}
              lowerTrackColor="#BF4D73"
              upperTrackColor="#EBEBEB"
              step={10}
              thumbRadius={10}
              onChange={(curValue) => this.refs.valueText.onChange(curValue)}
            /> */}
         <Slider 
          style={styles.slider}
          minimumValue={minPrice}
          value={val == 0 ? minPrice : val}
          maximumValue={maxPrice}
          trackStyle = {{color : colors.themeColor}}
          step={10}
          onValueChange={e => {
            this.refs.valueText.onChange(e)
          }}
         
        />
            
            <View style={{ flex: 0.35, flexDirection: 'row', marginHorizontal: 20 }}>
              <View style={{ flex: 1 / 3, flexDirection: 'row', justifyContent: 'flex-start' }}>
                <Text style={{ textAlign: 'left', fontSize: 14, fontFamily: 'SFUIText-Medium' }}>{string('globalValues.Currency')}</Text><Text style={{ fontSize: 14, paddingTop: lang == 'ar' ? 6 : 0 }}> {minPrice}</Text>
              </View>
              <View style={{ flex: 1 / 3, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
                <Text style={{ textAlign: 'center', fontSize: 14, fontFamily: 'SFUIText-Bold' }}>{string('globalValues.Currency')} </Text><Text style={{ fontSize: 14, paddingTop: lang == 'ar' ? 6 : 0 }}><ValueText ref="valueText" initial={minPrice} /></Text>
              </View>
              <View style={{ flex: 1 / 3, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Text style={{ textAlign: 'right', fontSize: 14, fontFamily: 'SFUIText-Medium' }}>{string('globalValues.Currency')}</Text><Text style={{ fontSize: 14, paddingTop: lang == 'ar' ? 6 : 0 }}> {maxPrice}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 0.1, marginVertical: 15 }}>
            <Text style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center' }}>* {percentageCut}% <Text style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Light' : 'HelveticaNeueLTArabic-Light' }}>{string('globalValues.DiductionText')}</Text></Text>
          </View>
                <TouchableOpacity style={styles.loginButton} onPress={() => this.done()}>
                      <Text style={styles.loginButtonText}>{string('ProfileDiscover.Next')}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPrice);
const styles = ScaledSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  slider: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '95%'
  },
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
  }
});