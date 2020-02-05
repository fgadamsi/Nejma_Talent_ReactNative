import React, { Component } from 'react';
import { SafeAreaView, Alert, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors  from '../../theme/colors';

class TermsOfService extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      textshow: '',
    }
  }
  showContent = ()=> {
    this.setState({visible: true})
    return axios.get(`${Appurl.apiUrl}tAndC`)
    .then((response) => {
      this.setState({visible: false, textshow: this.props.user.lang=='ar'?response.data.data[0].termsandconditions.ar:response.data.data[0].termsandconditions.en});
    }).catch((error) => {
      Alert.alert(
        '',
        error.response.data.msg,
        [
          {
            text: strings('globalValues.AlertOKBtn'),
            onPress: () => {
              this.setState({visible: false});
            }
          }
        ],
        { cancelable: false }
      )
    })
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
        this.showContent()
      }
    }, 200);
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled2(false)
    this.props.actions.ButtonDisabled(false);
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    Navigation.pop(this.props.componentId);
  }
  render() {
    let { visible, textshow } = this.state;
    let { textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#ffffff'}}>
        <View style={{flex: 1, marginHorizontal: 24}}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
          <View style={{flex: 0.1, justifyContent: 'center'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 20, width:24, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{tintColor: '#000000', height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex:0.08, justifyContent: 'flex-start'}}>
            <Text style = {{color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{string('TermsOfService.TermsOfServiceText')}</Text>
          </View>
          <View style={{flex: 0.8}}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{flex:1}}
              >
              <Text style={{textAlign: textAlign, fontFamily: lang=='en'?'SFUIDisplay-Regular':'HelveticaNeueLTArabic-Light'}}>{textshow}</Text>
            </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(TermsOfService);
