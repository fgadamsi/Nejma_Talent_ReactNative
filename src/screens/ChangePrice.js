import React, { Component } from 'react';
import { Image, SafeAreaView, Alert, Text, View, TouchableOpacity, Slider, Dimensions} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
const { width, height } = Dimensions.get('window')
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var val=0;

class ValueText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curValue: props.initial,
    };
    val= props.initial
  }
  onChange(curValue) {
    let roundNumber = Math.round(curValue);
    this.setState({curValue: roundNumber});
    val=roundNumber;
  }
  render() {
    return (
      <Text style={{textAlign: 'center', color: colors.themeColor, fontSize: 14, fontFamily: 'SFUIDisplay-Bold'}}> {this.state.curValue}</Text>
    );
  }
}
class ChangePrice extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isDisabled: false,
      minPrice: 0,
      maxPrice: 10,
      percentageCut: 0
    }
  }
 
  back = () => {
    Navigation.pop(this.props.componentId);
  }

  componentDidMount() {
    const slider1 = this.refs.slider1;
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
    val=0;
    this.props.actions.ButtonDisabled2(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  update = ()=> {
   if(!this.props.user.netStatus) {
    this.setState({isDisabled: false})
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
    else{
      let values = {'talentId' : this.props.user.loginID, 'price' : val}
      this.setState({visible: true, isDisabled: true})
      return axios.post(`${Appurl.apiUrl}updateTalentPrice`, values)
      .then((response) => {
        console.log(response);
        Alert.alert(
          '',
          response.data.mgs,
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false});
                 Navigation.pop(this.props.componentId);
              }
            }
          ],
          { cancelable: false }
        );
      })
      .catch((error) => {
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
  render() {
    let { visible, isDisabled  } = this.state;
    let { flexDirection, textAlign, lang, minPrice, maxPrice, percentageCut, gotPrice } = this.props.user;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{string('ChangePrice.PriceText')}</Text>
          </View>
          <View style={{flex:0.25, marginLeft: -10, justifyContent: 'center'}}>
            {/* <MKSlider
              ref="slider1"
              min={minPrice}
              max={maxPrice}
              value={val==0?gotPrice:val}
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
          step={1}
          onValueChange={e => {
            this.refs.valueText.onChange(e)
          }}
         
        />
            <View style={{flex:0.05}}></View>
            <View style={{flex:0.35, flexDirection: 'row', marginHorizontal: 20}}>
              <View style={{flex:1/3, flexDirection: 'row', justifyContent: 'flex-start'}}>
                <Text style={{textAlign: 'left', fontSize: 14, fontFamily: 'SFUIText-Medium'}}>{string('globalValues.Currency')}</Text><Text style={{fontSize: 14, paddingTop: lang=='ar'?6:0}}> {minPrice}</Text>
              </View>
              <View style={{flex:1/3, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center'}}>
                <Text style={{textAlign: 'center', fontSize: 14, fontFamily: 'SFUIText-Bold'}}>{string('globalValues.Currency')}</Text><Text style={{fontSize: 14, paddingTop: lang=='ar'?6:0}}><ValueText ref="valueText" initial={gotPrice} /></Text>
              </View>
              <View style={{flex:1/3, flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Text style={{textAlign: 'right', fontSize: 14, fontFamily: 'SFUIText-Medium'}}>{string('globalValues.Currency')}</Text><Text style={{fontSize: 14, paddingTop: lang=='ar'?6:0}}> {maxPrice}</Text>
              </View>
            </View>
          </View>
          <View style={{flex: 0.1, marginVertical: 15}}>
            <Text style={{fontSize: 13, color: '#9B9B9B', textAlign: 'center'}}>* {percentageCut}% <Text style={{fontSize: 13, color: '#9B9B9B', textAlign: 'center', fontFamily: lang=='en'?'SFUIText-Light':'HelveticaNeueLTArabic-Light'}}>{string('globalValues.DiductionText')}</Text></Text>
          </View>
          <View style={{flex: 0.12, justifyContent: 'center'}}>
            <TouchableOpacity style={{flex: 0.75, justifyContent: 'center', borderRadius: 2}} onPress={this.update}>
              <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{flex:1, borderRadius: 2}} start={{x:0, y:0}} end={{x:1, y:0}}>
                <View style={{flex:1, justifyContent: 'center', backgroundColor: 'transparent'}}>
                  <Text style={{color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontFamily: lang=='en'?'SFUIText-Medium':'HelveticaNeueLTArabic-Roman'}}>{string('ChangePrice.UpdateBTN')}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePrice);
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