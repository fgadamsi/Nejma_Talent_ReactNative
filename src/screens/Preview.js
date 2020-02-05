import React, { Component } from 'react';
import { Platform, SafeAreaView, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';

import { Navigation } from 'react-native-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import Video from 'react-native-video';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors  from '../../theme/colors';


class Preview extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      tempVideoFile: null,
      nothing: true
    }
  }
  componentWillMount() {
    this.props.actions.previewPause(false)
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled2(false);
    this.props.actions.ButtonDisabled(false);
    this.props.actions.previewPause(true)
  }
  cross = () => {
    Navigation.pop(this.props.componentId);
  }
  retry = ()=> {
    Navigation.pop(this.props.componentId);
  }
  uploadVideoScreen = ()=> {
    this.props.actions.previewPause(true)
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.UploadVideo',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
  
  }
  loadStart = (res)=> {
    console.log("loadStart------>", res)
  }
  setDuration = (res)=> {
    // console.log("setDuration------>", res)
  }
  setTime = (res)=> {
    // console.log("setTime------>", res)
  }
  onEnd = (res)=> {
    // console.log("onEnd------>", res)
  }
  videoError = (res)=> {
    console.log("videoError------>", res)
  }
  render() {
    let { isDisabled, visible } = this.state;
    let { lang, videoPath, loginHandel, previewIsPause } = this.props.user;
    console.log(previewIsPause)
    return (
      <View style={{flex:1}}>
        <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
        {videoPath!=null?<View style={{flex: 1}}>
          <Video source={{uri: videoPath}}
             rate={1.0}                   // 0 is paused, 1 is normal.
             volume={1.0}
             muted={false}
             paused={previewIsPause}               // Pauses playback entirely.
             resizeMode="cover"           // Fill the whole screen at aspect ratio.
             repeat={true}                // Repeat forever.
             onLoadStart={(e)=>this.loadStart(e)} // Callback when video starts to load
             onLoad={(e)=>this.setDuration(e)}    // Callback when video loads
             onProgress={(e)=>this.setTime(e)}    // Callback every ~250ms with currentTime
             onEnd={(e)=>this.onEnd(e)}           // Callback when playback finishes
             onError={(e)=>this.videoError(e)}    // Callback when video cannot be loaded
             style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
           />
           <SafeAreaView style={{flex: 1, marginHorizontal: 24}}>
              <View style={{flex: 0.15, flexDirection: 'row'}}>
                <View style={{flex: 0.4, marginTop: 20}}>
                  <TouchableOpacity disabled={isDisabled} hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 26, width: 30, justifyContent: 'center'}} onPress={this.cross}>
                    <Image source={require('./../../images/ic_cross_mini.png')} style={{height: 20, width:24}}/>
                  </TouchableOpacity>
                </View>
                <View style={{flex: 0.6, marginTop: 15, backgroundColor: 'transparent'}}>
                  <Text style={{textAlign: 'right', color: '#ffffff', fontSize: 20, fontFamily: 'SFProDisplay-Bold'}}>N E J M A</Text>
                  <Text style={{textAlign: 'right', color: '#ffffff', fontSize: 16, fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Roman'}}>{loginHandel}</Text>
                </View>
              </View>
              <View style={{flex: 0.7}}></View>
              <View style={{flex: 0.15, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 0.3, flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flex: 0.2}}></View>
                  <TouchableOpacity disabled={isDisabled} style={{flex: 0.6, alignItems: 'center', backgroundColor: 'transparent'}} onPress={this.retry}>
                    <Image source={require('./../../images/ic_retry_white.png')} style={{height: 26, width: 26}}/>
                    <Text></Text>
                    <Text style={{color: '#ffffff', fontSize: 12, textAlign: 'center', fontFamily: lang=='en'?'SFUIText-Regular':'HelveticaNeueLTArabic-Light'}}>{string('Preview.RetryText')} </Text>
                  </TouchableOpacity>
                  <View style={{flex: 0.2}}></View>
                </View>
                <View style={{flex: 0.4}}></View>
                <View style={{flex: 0.3, justifyContent: 'center',alignItems: 'flex-end', marginBottom: 10}}>
                  <TouchableOpacity disabled={isDisabled} hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 60, width: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 30, borderColor: 'transparent'}} onPress={this.uploadVideoScreen}>
                    <Image source={require('./../../images/Group.png')} style={{height: 60, width: 60}}/>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>:null}
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

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
