import React, { Component } from 'react';
import { BackHandler, SafeAreaView, Image, Alert, Text, StyleSheet, TouchableOpacity, View, AsyncStorage, Platform, PermissionsAndroid } from 'react-native';

import { Navigation } from 'react-native-navigation';
// import Camera from 'react-native-camera';
import {RNCamera} from 'react-native-camera';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import ImagePicker from 'react-native-image-picker';
import KeepAwake from 'react-native-keep-awake';
import colors  from '../../theme/colors';
import {string} from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


var finalSec;
var option = {
  title: 'Select Video',
  mediaType: 'video',
  storageOptions: {
    skipBackup: true,
    path: 'videos'
  }
};
class CameraScreen extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.camera = null;
    this.state = {
      camera: {
        type: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.on
      },
      isRecording: false,
      showTimer: false,
      count:0,
      minCount:0,
      secCount:0,
      visible: false,
      isDisabled: false,
      flip: false,
      stopNotSend: false,
      text: 'N E J M A',
      fontSize: 24,
      fontColor: '#ffffff'
    };
  }
  componentWillUnmount() {
    this.props.actions.CamDisabled(false)
    this.props.actions.ButtonDisabled(false)
    this.props.actions.ButtonDisabled1(false)
  }
  startRecording =  ()=> {
    console.log('recording')
    let { minCount, text, fontSize, fontColor } = this.state;
    KeepAwake.activate();
  if (this.camera) {
    this.setState({flip:true})
      this.camera
        .recordAsync()
        .then(data => {
          console.log(data, 'video....')
          if(!this.state.stopNotSend) {
            this.setState({isDisabled: true, visible: true});
            this.props.actions.setVideo(data.uri)
            this.setState({showTimer: false, isDisabled: false, visible: false, flip: false, minCount:0, secCount:0})
            if(Platform.OS=='ios') {
              setTimeout(()=> {
                Navigation.push(this.props.componentId, {
                  component: {
                    name: 'FamCamTalent.Preview',
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
              Navigation.push(this.props.componentId, {
                component: {
                  name: 'FamCamTalent.Preview',
                  options: {
                    topBar: {
                        visible: false
                    }
                  }
                }
              });
            }
          }
        })
        .catch(err => {
          console.error(err)
          this.setState({isDisabled: false, visible: false, flip: false});
        });
      this.setState({
        isRecording: true,
        showTimer: true
      });
      this.countTimer()
    }
}

  stopRecording = ()=> {
    let {minCount, secCount, finalmin, finalsec, completeTime} = this.state;
    if (this.camera) {
      this.camera.stopRecording();
      this.setState({
        isRecording: false
      });
      this.setState({secCount:0})
      clearInterval(secHandle)
      clearInterval(minHandle)
      this.setVidPath()
  }};
  setVidPath = ()=> {
    let { secCount } = this.state;
    if(secCount<9) {
      let r = '0'+secCount
      finalSec=r
    }
    else {
      finalSec=secCount
    }
  }
  countTimer = (data)=>{
    let {secCount, minCount} = this.state;
    var sec=0;
    var min=0;
    secHandle = setInterval(()=>{
      sec++;
      if(sec<=59) {
        this.setState({secCount:sec})
      }
    },1000);
    minHandle = setInterval(()=>{
      min++;
      this.setState({minCount:min, secCount: 0})
      this.stopRecording()
    },60000);
  }
  switchType = ()=> {
    let newType;
    const { back, front } = RNCamera.Constants.Type;
    if(this.state.camera.type === back) {
      newType = front;
    }
    else if(this.state.camera.type === front) {
      newType = back;
    }
    this.setState({camera: {...this.state.camera, type: newType}});
  }
  switchFlash = ()=> {
    let newFlashMode;
    const { auto, on, off } =RNCamera.constants.FlashMode;
    if(this.state.camera.flashMode === auto) {
      newFlashMode = on;
    }
    else if (this.state.camera.flashMode === on) {
      newFlashMode = off;
    }
    else if (this.state.camera.flashMode === off) {
      newFlashMode = auto;
    }
    this.setState({camera: {...this.state.camera, flashMode: newFlashMode}});
    console.log(this.state.camera)
  }
  get flashIcon() {
    let icon;
    const { auto, on, off } = RNCamera.constants.FlashMode;
    if(this.state.camera.flashMode === auto) {
      icon = require('./../../images/ic_flash_auto.png');
    }
    else if(this.state.camera.flashMode === on) {
      icon = require('./../../images/ic_flash_on.png');
    }
    else if (this.state.camera.flashMode === off) {
      icon = require('./../../images/ic_flash_off.png');
    }
    return icon;
  }
  pickImage = async ()=> {
    if(Platform.OS == 'android' && Platform.Version > 22) {
      const granted = await PermissionsAndroid.requestMultiple (
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        ]
      );
      if (granted['android.permission.CAMERA'] != 'granted' || granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
        return Alert.alert(
          '',
          string('Profile1.ImagePickPermisson'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: ()=> {
                this.setState({isDisabled: false})
              }
            }
          ],
          { cancelable: false }
          );
        }
      }
    ImagePicker.launchImageLibrary(option, (response) => {
      console.log(response)
      if (response.didCancel) {
        this.setState({isDisabled: false, visible: false, flip: false});
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        this.setState({isDisabled: false, visible: false, flip: false});
        console.log('ImagePicker Error: ', response.error);
      }
      else if (!response.error && !response.didCancel) {
        this.setState({isDisabled: true, visible: true});
        console.log(response)
        let vidPath;
        if(Platform.OS=='ios') {
          vidPath=response.uri
        }
        else {
          vidPath='file://'+response.path
        }
        this.props.actions.setVideo(vidPath)
        this.props.actions.previewPause(false)
        this.setState({showTimer: false, isDisabled: false, visible: false, flip: false, minCount:0, secCount:0})
        setTimeout(()=> {
          Navigation.push(this.props.componentId, {
            component: {
              name: 'FamCamTalent.Preview',
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
        this.setState({isDisabled: false, visible: false, flip: false});
        console.log('ImagePicker Error: ', response.error);
        Alert.alert(
          '',
          response.error,
          [
            {
              text: 'Okay',
              onPress: ()=> {
                this.setState({isDisabled: false, visible: false, flip: false});
              }
            }
          ],
          { cancelable: false }
        )
      }
    });
  }
  back = ()=> {
    if (this.state.flip) {
      Alert.alert(
        '',
        string('CameraScreen.StopVideoText'),
        [
          {
            text: string('CameraScreen.YesLabel'), onPress: () => {
              this.setState({stopNotSend: true})
              this.camera.stopRecording();
              Navigation.pop(this.props.componentId);
            }
          },
          {text: string('CameraScreen.NoLabel'), style: 'cancel'}
        ],
        { cancelable: false }
      );
    }
    else {
      Navigation.pop(this.props.componentId);
    }
  }
  render() {
    let { secCount, minCount, visible, isDisabled, camera, flip, showTimer, isRecording } = this.state;
    let { lang, msg } = this.props.user;
    return (
      <View style={{flex:1}}>
        <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
         <RNCamera
          ref={cam => {
            this.camera = cam;
          }}
          style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}
          // aspect={camera.aspect}
          // captureTarget={camera.captureTarget}
          type={camera.type}
          flashMode={camera.flashMode}
          // onFocusChanged={() => {}}
          // onZoomChanged={() => {}}
          // defaultTouchToFocus
          // mirrorImage={false}
          // cropToPreview={false}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          permissionDialogTitle="Camera Permissions"
          permissionDialogMessage="Permissions Required"
        /> 
        <SafeAreaView style={{marginHorizontal: 24, position: 'absolute', right:0, left:0, top:10, flexDirection: 'row'}}>
          <View style={{flex:0.2, justifyContent: 'flex-start'}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 58, width:58, justifyContent: 'center'}} onPress={this.back}>
              <Image source={require('./../../images/ic_back_white.png')} style={{height: 14, width:18}}/>
            </TouchableOpacity>
          </View>
          <View style={{flex: 0.6}}></View>
          <View style={{flex:0.1, alignItems: 'flex-end'}}>
            {/* <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} style={{height: 58, width:45, justifyContent: 'center', alignItems: 'flex-end'}} onPress={this.switchFlash}>
              <Image style={{height: 24, width: 24}} source={this.flashIcon} />
            </TouchableOpacity> */}
          </View>
          <View style={{flex:0.1}}>
            <TouchableOpacity hitSlop={{top:7, bottom:7, left:7, right:7}} disabled={flip} onPress={this.switchType} style={{height: 58, width:45, justifyContent: 'center', alignItems: 'flex-end'}}>
              {flip?null:<Image style={{height: 26, width: 31}} source={require('./../../images/ic_gallery_white.png')} />}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={{backgroundColor: 'transparent', position: 'absolute', top: 300, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-start', marginHorizontal: 24, marginVertical: 50}}>
          <Text style={{opacity: 0.2,color: '#FFFFFF', textAlign: 'left', fontSize: 12, opacity: 0.5, fontFamily: lang=='en'?'SFUIText-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('CameraScreen.MessageLabel')} </Text>
          <Text></Text>
          <View style={{backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 5}}>
            <Text style={{color: '#FFFFFF', textAlign: 'left', fontSize: 14, opacity: 0.87, fontFamily: lang=='en'?'Georgia':'HelveticaNeueLTArabic-Light'}}>{msg}</Text>
          </View>
        </View>
        {showTimer?<View style={{position: 'absolute', right:0, left:0, bottom: 120, alignItems: 'center'}}>
          <View style={{width:56, height: 24, backgroundColor: 'black', opacity: 0.4, justifyContent: 'center', borderRadius: 10}}>
            <Text style={{textAlign: 'center', color: '#FFFFFF', fontSize: 12, fontFamily: 'SFUIDisplay-Bold'}}>{minCount<=9?'0'+minCount:minCount}:{secCount<=9?'0'+secCount:secCount}</Text>
          </View>
        </View> : null }

        <SafeAreaView style={{flexDirection: 'row', position: 'absolute', right: 0, left: 0,bottom: 10, alignItems: 'center'}}>
          <View style={{flex: 0.15}}></View>
          <View style={{flex: 0.1, justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity disabled={flip} style={{height: 26, width: 31}} onPress={this.pickImage}>
              {flip?null:<Image style={{height: 26, width: 31}} source={require('./../../images/ic_gallery.png')} />}
            </TouchableOpacity>
          </View>
          <View style={{flex: 0.15, backgroundColor: 'pink'}}></View>
          <View style={{flex:0.2,justifyContent: 'center', alignItems: 'center'}}>
          {(!isRecording && (
            <TouchableOpacity onPress={this.startRecording}>
              <Image style={{height: 72, width: 72}} source={require('./../../images/Group2.png')} />
            </TouchableOpacity>
          )) || (
            <TouchableOpacity onPress={this.stopRecording}>
              <Image style={{height: 72, width: 72}} source={require('./../../images/Group2.png')} />
            </TouchableOpacity>
          )}
        </View>
        </SafeAreaView>
      </View>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(CameraScreen);
