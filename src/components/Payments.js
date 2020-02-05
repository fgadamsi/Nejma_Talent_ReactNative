import React, { Component } from 'react';
import { Alert, Text, View, Image, TouchableOpacity, ScrollView, RefreshControl, FlatList } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from 'react-native-fast-image';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var arr=["Jan","Feb","Mar","Apr","May","June","July","Aug","Sep","Oct","Nov","Dec"]
var arr1=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]

class Payments extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
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
        this.setState({isDisabled: true})
        let values= {'talentId' : this.props.user.loginID}
        axios.post(`${Appurl.apiUrl}requestStatusToTalent`, values)
        .then((response) => {
          console.log(response);
          this.props.actions.setPaymentList(response.data.data)
          this.props.actions.setTotalAmount(response.data.totalAmount, response.data.pendingAmmount)
          this.setState({isDisabled: false})
        })
        .catch((error) => {
          console.log(error)
          if(error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({isDisabled: false})
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  getPaymentList = () => {
    if(!this.props.user.netStatus) {
      this.setState({isDisabled: false, refreshing: false})
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
      this.setState({isDisabled: true})
      let values= {'talentId' : this.props.user.loginID}
      axios.post(`${Appurl.apiUrl}requestStatusToTalent`, values)
      .then((response) => {
        console.log(response);
        this.props.actions.setPaymentList(response.data.data)
        this.props.actions.setTotalAmount(response.data.totalAmount, response.data.pendingAmmount)
        this.setState({isDisabled: false, refreshing: false})
      })
      .catch((error) => {
        console.log(error)
        if(error.response.data.success == 0) {
          Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, refreshing: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }
  }
  _onRefresh() {
    this.setState({refreshing: true})
    this.getPaymentList();
  }
  payOut = () => {
    Alert.alert('PayOut')
  }
  talentPrice = (amountPaid, percentagePrice)=> {
    let totalAmount = Number(amountPaid);
    let percentageCut = Number(percentagePrice);
    let talentPrice = totalAmount-((totalAmount*percentageCut)/100)
    return Math.round(talentPrice)
  }
  renderItem(data) {
    let { flexDirection, textAlign, lang } = this.props.user;
    let { item, index } = data;
    return (
      <View style={{flex:1}}>
      <View style={{justifyContent: 'center', marginVertical: 24}}>
        <View style={{flexDirection: flexDirection, alignItems: 'center'}}>
          <View style={{flex:0.18, alignItems: lang=='en'?'flex-start':'flex-end'}}>
            <FastImage style={{height: 50, width: 50, borderRadius: 25}} source={{uri: `${Appurl.apiUrl}resizeimage?imageUrl=`+item.userId.Profilepicurl+'&width=100&height=100'}}/>
          </View>
          <View style={{width: 5}}></View>
          <View style={{flex: 0.41}}>
            <Text style={{color: '#4A4A4A', fontSize: 16, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold', textAlign: textAlign}}>{item.userId.name}</Text>
            <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 14, opacity: 0.5, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Payments.MessageLabel')}</Text>
          </View>
          <View style={{flex:0.41, flexDirection: 'row', justifyContent: lang=='en'?'flex-start':'flex-end'}}>
            <Text style={{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: 'SFProText-Bold'}}>{string('globalValues.Currency')} </Text>
            <Text style={{textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold', paddingTop: lang=='ar'?5:null}}>{this.talentPrice(item.amountPaid, item.percentagePrice)}</Text>
          </View>
        </View>
        <View style={{marginVertical: 10}}>
          <Text style={{textAlign: textAlign, color: '#474D57', fontSize: 14, fontFamily: lang=='en'?'Georgia':'HelveticaNeueLTArabic-Light', opacity: 0.87}}>{item.message}</Text>
        </View>
        <View>
          <Text style={{color: '#5C5C5C', fontSize: 12, opacity: 0.5, fontFamily: lang=='en'?'SFProText-Semibold':'HelveticaNeueLTArabic-Roman'}}>{item.time.slice(8,10)} {lang=='en'?arr[new Date(item.time).getMonth()]:arr1[new Date(item.time).getMonth()]} {item.time.slice(0,4)}</Text>
        </View>
      </View>
    </View>
    )
  }
  render() {
    let { isDisabled, refreshing } = this.state;
    let { flexDirection, textAlign, lang, paymentsArr, totalAmount, pendingAmount } = this.props.user;
    return (
      <View style={{flex:1}}>
        <View style={{flex: 1}}>
          {paymentsArr.length?<FlatList
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index}
            data={paymentsArr}
            renderItem={this.renderItem.bind(this)}
            style={{flex:1, marginHorizontal: 24}}
            refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={this._onRefresh.bind(this)}
                            colors={['#BF4D73', '#D8546E', '#8D3F7D']}
                        />
                    }
          />:<View style={{flex: 1, marginHorizontal: 24}}><Text style={{color: '#F5A623',textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('globalValues.NothingText')}</Text></View>}
          <View style={{height: 80, flexDirection: flexDirection, justifyContent: 'center', alignItems: 'center', shadowOffset: {width: 10, height: 16}, shadowColor: 'rgba(0,0,0,0.12)', shadowOpacity: 1, shadowRadius: 32, elevation: 2}}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 10}}>
              <Text style={{color: '#474D57', opacity: 0.5, fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Payments.amountRecieved')}</Text>
              <View style={{height: 4}}></View>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#BF4D73', fontSize: 24, textAlign: textAlign, fontFamily: 'SFProText-Regular'}}>{string('globalValues.Currency')}</Text>
                <Text style={{color: '#BF4D73', fontSize: 24, textAlign: textAlign, fontFamily: 'SFProText-Regular'}}> {totalAmount==null?0:totalAmount}</Text>
              </View>
            </View>
            <View style={{height: 80, width: 10}}></View>
            <View style={{height: 60, width: 1, backgroundColor: 'rgba(71,77,87,0.5)'}}></View>
            <View style={{height: 80, width: 10}}></View>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 10}}>
              <Text style={{color: '#474D57', opacity: 0.5, fontSize: 12, textAlign: textAlign, fontFamily: lang=='en'?'SFProText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Payments.amountPending')}</Text>
              <View style={{height: 4}}></View>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: '#F5A623', textAlign: 'center', fontSize: 24, textAlign: textAlign, fontFamily: 'SFProText-Regular'}}>{string('globalValues.Currency')}</Text>
                <Text style={{color: '#F5A623', textAlign: 'center', fontSize: 24, textAlign: textAlign, fontFamily: 'SFProText-Regular'}}> {pendingAmount==null?0:pendingAmount}</Text>
              </View>
            </View>
          </View>
        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(Payments);
