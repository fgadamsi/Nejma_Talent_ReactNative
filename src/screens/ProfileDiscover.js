import React, { Component } from 'react';
import { Platform, SafeAreaView, ScrollView, Alert, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
const { width, height } = Dimensions.get('window')
import { connect } from 'react-redux';
import { THANKS_REGISTER_EMAIL } from '../constants/ActionTypes';

class ProfileDiscover extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      selected: [],
      arr: null,
      arra : [''],
      visible: false,
      isDisabled: false,
      hidden : true
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

    setTimeout(() => {
      if(!this.props.user.netStatus) {
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
        let values = {'talentId' : this.props.user.registerID}
        this.setState({ visible: true});
        return axios.post(`${Appurl.apiUrl}listofprofessions`, values)
        .then((response) => {
          console.log(response);
          if(response.data == "The network connection was lost."){
            Alert.alert("The network connection was lost.")
          }
          this.setState({isDisabled: false, visible: false, arr: response.data.data});
        }).catch((error) => {
          console.log(error.response)
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
    }, 200);
  }

  tryAgain = () => {
    let values = {'talentId' : this.props.user.registerID}
    this.setState({ visible: true});
    axios.post(`${Appurl.apiUrl}listofprofessions`, values)
        .then((response) => {
          console.log(response);
          if(response.data == "The network connection was lost."){
            this.setState({hidden : false})
            Alert.alert("The network connection was lost.")
          }
          this.setState({isDisabled: false, visible: false, arr: response.data.data});
        }).catch((error) => {
          console.log(error.response)
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
  componentWillUnmount() {
    this.props.actions.ButtonDisabled(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({isDisabled: false, visible: false})
    Navigation.pop(this.props.componentId);
  }
  profile1 = ()=> {
    let { selected, visible } = this.state;
    if(selected.length<1) {
      Alert.alert(
        '',
        string('ProfileDiscover.CategoryRequired'),
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
      let values = {'talentId' : this.props.user.registerID,'list' : selected}
      return axios.post(`${Appurl.apiUrl}saveTalentprofessions`, values)
      .then((response) => {
        this.setState({isDisabled: false, visible: false});
        if(Platform.OS=='ios') {
          setTimeout(()=> {
           this.goToCategory()
          }, 1000)
        }
        else {
           this.goToCategory()
        }
      }).catch((error) => {
        console.log(error.response)
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

  goToCategory = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.CategoryPrice',
        options: {
          topBar: {
           
              visible: false
            
          }
        }
      }
    });
  }
  selectCategory = (category)=> {
    let { selected, arra } = this.state;
    if(selected.indexOf(category) > -1) {
      let index = selected.indexOf(category);
      selected.splice(index,1);
      arra[this.props.user.lang=='en'?category.professionCatagory.en:category.professionCatagory.ar] = false;
      this.setState({selected, arra});
    }
    else if(selected.length < 2) {
      selected.push(category);
      arra[this.props.user.lang=='en'?category.professionCatagory.en:category.professionCatagory.ar] = true;
      this.setState({selected, arra});
    }
  }
  render() {
    let { arra, visible, isDisabled, arr } = this.state;
    let { textAlign, lang } = this.props.user;
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
            <Text style = {{color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{string('ProfileDiscover.ProfileDiscoverText')}</Text>
          </View>
          <View style={{flex:0.09}}>
            <Text style = {{fontSize: 14, color: '#474D57', textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('ProfileDiscover.mainText')}
              <Text style={{fontSize: 14, color: '#B5B5B5', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}> {string('ProfileDiscover.conditionText')}</Text>
            </Text>
          </View>
          <View style={{flex: 0.55}}>
            <ScrollView showsVerticalScrollIndicator={false} style={{flex:1, marginVertical: 15}}>
              <View style={{flex:1,width: Dimensions.get('window').width-50,flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start'}}>
                {arr?arr.map((val, i)=> {
                  return <TouchableOpacity key={i} style={{width: (Dimensions.get('window').width-20)/3.5, height: 40,backgroundColor: '#FFFFFF', justifyContent: 'center',borderColor: colors.themeColor, borderWidth: 1, borderRadius: 24, marginBottom: 16, marginRight: 5, alignItems: 'center', alignSelf: 'center'}}
                                  onPress={() => {this.selectCategory(val)}}>
                            { arra[lang=='en'?val.professionCatagory.en:val.professionCatagory.ar] ?
                              <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{width: (Dimensions.get('window').width-20)/3.5, height: 40, borderRadius: 24, justifyContent: 'center', alignItems: 'center'}}
                              start={{x:0, y:0}} end={{x:1, y:0}}>
                                <Text style={{textAlign: 'center', color: '#FFFFFF', backgroundColor: 'transparent', fontSize: 14, backgroundColor: 'transparent', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{lang=='en'?val.professionCatagory.en:val.professionCatagory.ar}</Text>
                              </LinearGradient>
                            :
                              <View style={{width: (Dimensions.get('window').width-20)/3.5, height: 40, borderRadius: 24, justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{textAlign: 'center', color: colors.themeColor, backgroundColor: 'transparent', fontSize: 14, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>
                                  {lang=='en'?val.professionCatagory.en:val.professionCatagory.ar}
                                </Text>
                              </View>
                            }
                          </TouchableOpacity>
                }):null}
              </View>
            </ScrollView>
          </View>
          {this.state.hidden ?   <TouchableOpacity style={styles.loginButton} onPress={() => this.profile1()}>
                      <Text style={styles.loginButtonText}>{string('ProfileDiscover.Next')}</Text>
                  </TouchableOpacity> :   <TouchableOpacity style={styles.loginButton} onPress={() => this.tryAgain()}>
                      <Text style={styles.loginButtonText}>Reload</Text>
                  </TouchableOpacity>}
             
          {/* <View style = {{flex:0.1,alignItems : 'flex-end', justifyContent: 'center'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={isDisabled} activeOpacity={0.5} onPress={this.profile1}>
              <Image source = {require('./../../images/fab.png')} style={{height: 56, width: 56}} />
            </TouchableOpacity>
          </View> */}
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDiscover);
const styles=ScaledSheet.create({

  registerHeading : {
    marginTop:'20@ms',
     color: colors.regHeading,
     fontSize:  '20@ms',
     lineHeight: '24@ms',
     fontWeight : fontWeight.medium,
     fontFamily : fontFamily.mediumBold 
  },
  topView : {
     marginTop:'10@ms',
  },
  alignLogin : {
    textAlign : 'right',
    marginTop:'5@ms',
    fontSize :'14@ms',
    fontWeight : fontWeight.medium,
    lineHeight : '16@ms',
    fontFamily : fontFamily.mediumBold,
    color : colors.themeColor

  },
  inputLine: {
    height: '1@ms',
    width: width - 46,
    backgroundColor: colors.black,
    opacity: 0.10,
    borderRadius: '4@ms',
    marginTop: '10@ms',
    alignSelf: 'center'
},
  textInputStyle: {
    // lineHeight: '19@vs',
    fontSize: '16@ms',
    color: colors.textColor,
    opacity: 0.80,
    marginTop: '5@ms',
    fontFamily: fontFamily.mediumBold,
    padding: 0,
    paddingRight: '24@ms',
    textAlign: 'left'
},
  btnEmail: {
    height: '50@vs',
    width: '300@s',
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:colors.themeColor,
    borderWidth:1,
    borderRadius:'8@ms',
    padding: '10@ms',
    marginBottom : '10@ms',
    borderColor : colors.themeColor
  },
  social: {
    marginTop : '70@ms',
    alignItems: 'center'
  },
  accountText : {
    textAlign: 'center',
    color:colors.white,
    fontSize: '16@ms',
    fontWeight : fontWeight.medium,
    fontFamily : fontFamily.mediumBold,
    lineHeight: '24@ms'

  },
  bycreatingText : {
    marginTop: '10@ms',
  
    color : colors.creatingAccount,
    fontFamily : fontFamily.regular,
    lineHeight: '18@ms',
    fontSize: '12@ms'
  },
  termsofServiceText : {
    color :  'black'
  },
  inputLabel: {
    lineHeight: '16@ms',
    fontSize: '14@ms',
    color: colors.labelColor,
    opacity: 0.50,
    fontFamily: fontFamily.regular,
    textAlign: 'left'
},
visibilityIconStyle: {
  position: "absolute",
  right: 0,
  top: "5@ms",
  marginRight: "23@ms",
  alignItems: "center"
},
loginButton: {
  bottom : '20@ms',
 position : 'absolute',
 height : "48@vs",
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
  
})


