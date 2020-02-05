import React, { Component } from 'react';
import { SafeAreaView, Text, View, Image, TouchableOpacity } from 'react-native';
import colors  from '../../theme/colors';
import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
// import OneSignal from 'react-native-onesignal';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Thanks extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
    }
    this.props.actions.setFacebookEmail('');
   // OneSignal.sendTag("phone", this.props.user.ThanksEmail);
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled(false)
    this.props.actions.ButtonDisabled1(false)
  }
  back = () => {
    Navigation.popToRoot(this.props.componentId);
  }
  render() {
    let { visible, isDisabled } = this.state;
    let { lang } = this.props.user;
    return (
      <View style={{flex:1}}>
        <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{flex:1}} start={{x:0, y:0}} end={{x:1, y:0}}>
          <SafeAreaView style={{flex: 0.1, justifyContent: 'center', marginHorizontal: 24}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../../images/ic_back_white.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </SafeAreaView>
          <View style={{flex:0.2, justifyContent: 'flex-end', alignItems: 'center'}}>
            <Image style={{height: 72, width: 72}} source={require('./../../images/Tick1.png')}/>
          </View>
          <View style={{flex:0.05}}></View>
          <View style={{flex:0.4, backgroundColor: 'transparent'}}>
            <Text style={{fontSize: 24, color: 'white', textAlign: 'center', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Thanks.Text1')}</Text>
            <View style={{height: 15}}></View>
            <Text style={{fontSize: 18, color: 'white', textAlign: 'center', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('Thanks.Text2')}</Text>
            <View style={{height: 15}}></View>
            <Text style={{fontSize: 16, color: 'white', textAlign: 'center', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('Thanks.Text3')}</Text>
          </View>
        </LinearGradient>
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

export default connect(mapStateToProps, mapDispatchToProps)(Thanks);
