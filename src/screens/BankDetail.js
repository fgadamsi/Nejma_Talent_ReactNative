import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, Text, View, Image, TouchableOpacity,  Dimensions, TextInput } from 'react-native'; 
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import colors  from '../../theme/colors';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
const { width, height } = Dimensions.get('window')
import { connect } from 'react-redux';

class BankDetail extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      bankName: '',
      accHolderName: '',
      accNumber: '',
      ibanNumber: '',
      visible: false,
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
    this.props.actions.ButtonDisabled(false)
    this.props.actions.ButtonDisabled2(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }
  componentWillMount() {
    let { bankName, accHolderName, accNumber, ibanNumber } = this.props.user;
    this.setState({bankName: bankName, accHolderName: accHolderName, accNumber: accNumber, ibanNumber: ibanNumber});
  }
  back = () => {
    this.setState({isDisabled: false})
    Navigation.pop(this.props.componentId);
  }
  validationRules= () => {
    return [
      {
        field: this.state.bankName,
        name: 'Bank Name',
        rules: 'required'
      },
      {
        field: this.state.accHolderName,
        name: 'Account Holder Name',
        rules: 'required'
      },
      {
        field: this.state.accNumber,
        name: 'Account Number',
        rules: 'required|no_space|numeric'
      },
      {
        field: this.state.ibanNumber,
        name: 'IBAN Number',
        rules: 'required|no_space'
      },
    ]
  }
  validationArRules= () => {
    return [
      {
        field: this.state.bankName,
        name: 'اسم البنك',
        rules: 'required'
      },
      {
        field: this.state.accHolderName,
        name: 'اسم صاحب الحساب',
        rules: 'required'
      },
      {
        field: this.state.accNumber,
        name: 'رقم الحساب',
        rules: 'required|no_space|numeric'
      },
      {
        field: this.state.ibanNumber,
        name: 'رقم الايبان',
        rules: 'required|no_space'
      },
    ]
  }
  addBankDetails = ()=> {
    let { actions } = this.props;
    let { registerID, loginID } = this.props.user;
    let { bankName, accHolderName, accNumber, ibanNumber, visible, isDisabled } = this.state;
    let validation= this.props.user.lang=='en'?Validation.validate(this.validationRules()):ValidationAr.validate(this.validationArRules())
    if(validation.length!=0) {
      return Alert.alert(
        '',
        validation[0],
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
      this.setState({isDisabled: true, visible: true})
      let talendId = this.props.signUp?registerID:loginID
      let values = {'bankName' : bankName, 'accountHolderName': accHolderName, 'accountNumber': accNumber, 'ibanNumber' : ibanNumber, 'talentId' : talendId, 'status' : 'DETAIL'}
      console.log(values)
      return axios.post(`${Appurl.apiUrl}addAccountDetails`, values)
      .then((response) => {
        console.log(response)
        return this.getData(response, values);
      }).catch((error) => {
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
    let {visible, isDisabled} = this.state;
    this.setState({isDisabled: false, visible: false});
    if(Platform.OS=='ios') {
      setTimeout(()=> {
        if(this.props.signUp) {
          setTimeout(()=> {
            Navigation.push(this.props.componentId, {
              component: {
                name: 'FamCamTalent.Thanks',
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
          Alert.alert(
            '',
            string('BankDetail.addedALert'),
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false});
                  this.props.navigator.pop()
                }
              }
            ],
            { cancelable: false }
          )
        }
      }, 1000)
    }
    else {
      if(this.props.signUp) {
        setTimeout(()=> {
          Navigation.push(this.props.componentId, {
            component: {
              name: 'FamCamTalent.Thanks',
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
        Alert.alert(
          '',
          string('BankDetail.addedALert'),
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
        )
      }
    }
  }
  skipButton = ()=> {
    this.setState({isDisabled: true, visible: true})
    let values = {'talentId' : this.props.user.registerID, 'status' : 'SKIP'}
    console.log(values)
    return axios.post(`${Appurl.apiUrl}addAccountDetails`, values)
    .then((response) => {
      return this.getData(response, values);
    }).catch((error) => {
      if(error.response.data.success == 0) {
        console.log()
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
  render() {
    let { visible, isDisabled } = this.state;
    let { textAlign, lang, bankName, accHolderName, accNumber, ibanNumber } = this.props.user;
    return (
      <SafeAreaView style={{flex:1, backgroundColor: 'white'}}>
        <View style={{flex:1, marginHorizontal: 24}}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{color: '#000000', fontSize: 24, textAlign: textAlign, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('BankDetail.bankDetailText')}</Text>
          </View>
          <View style={{flex:0.09, marginTop:moderateScale(10)}}>
            <Text style = {{fontSize: 14, color: '#474D57', textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('BankDetail.mainText')}</Text>
          </View>
          <View style = {{flex:0.45, marginTop:moderateScale(10)}}>
           
            <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('BankDetail.bankName')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                          ref="bank"
                          editable={bankName==''?true:false}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('BankDetail.bankName')}
                          autoCapitalize="none"
                          keyboardType = "default"
                          returnKeyType={"next"}
                          onChangeText = {(text) => this.setState({bankName: text.trim()})}
                          value={bankName==''?null:bankName} />
                      <View style={styles.inputLine} />
                  </View>
           
          
            <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('BankDetail.accHolderName')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                        ref="accHolder"
                        editable={accHolderName==''?true:false}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('BankDetail.accHolderName')}
                          autoCapitalize="none"
                          keyboardType = "default"
                          returnKeyType={"next"}
                          onChangeText = {(text) => this.setState({accHolderName: text.trim()})}
                          value={accHolderName==''?null:accHolderName} />
                      <View style={styles.inputLine} />
                  </View>
         
            <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('BankDetail.accNumber')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                        ref="acc"
                        editable={accNumber==''?true:false}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder = {string('BankDetail.accNumber')}
                          autoCapitalize="none"
                          keyboardType={'numeric'}
                          returnKeyType={"next"}
                          onChangeText = {(text) => this.setState({accNumber: text})}
                          value={accNumber==''?null:accNumber} />
                      <View style={styles.inputLine} />
                
            </View>
            
            <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('BankDetail.ibanNumber')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                        ref="iban"
                        editable={ibanNumber==''?true:false}
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder = {string('BankDetail.ibanNumber')}
                          autoCapitalize="none"
                          keyboardType={'numeric'}
                          returnKeyType={"next"}
                          onChangeText = {(text) => this.setState({ibanNumber: text})}
                          value={ibanNumber==''?null:ibanNumber} />
                      <View style={styles.inputLine} />
                  </View>
           
          </View>
          <View style={{flex:0.05}}></View>
          {accNumber==''? <TouchableOpacity style={styles.loginButton} onPress={() => this.addBankDetails()}>
                      <Text style={styles.loginButtonText}>{string('ProfileDiscover.Next')}</Text>
                  </TouchableOpacity> :null}
          {/* {this.props.signUp? */}
          {this.props.signUp?<View style={{flex:1}}>
            <View style={{flex:0.05}}></View>
            <View style = {{height: 30,alignSelf : 'center', position: 'absolute', bottom : moderateScale(50)}}>
              <TouchableOpacity hitSlop={{top:15, bottom:15, left:15, right:15}} style={{alignSelf : 'center'}} activeOpacity={0.5} onPress={this.skipButton}>
                <Text style = {{fontSize: 14, color: colors.themeColor, textAlign:'center', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('BankDetail.skipButton')}</Text>
              </TouchableOpacity>
            </View>
          </View>
           :null} 
          <View style={{height: 20}}></View>
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
export default connect(mapStateToProps, mapDispatchToProps)(BankDetail);
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
  inputLabel: {
    lineHeight: '16@ms',
    fontSize: '14@ms',
    color: colors.labelColor,
    opacity: 0.50,
    fontFamily: fontFamily.regular,
    textAlign: 'left'
},
  loginButtonText: {
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    color:colors.white,
    fontSize: '16@ms',
    fontWeight : fontWeight.medium,
    fontFamily : fontFamily.mediumBold,
  },
  inputLine: {
    height: '1@ms',
    width: width - 46,
    backgroundColor: colors.black,
    opacity: 0.10,
    borderRadius: '4@ms',
    marginTop: '10@ms',
    alignSelf: 'center'
}
});
