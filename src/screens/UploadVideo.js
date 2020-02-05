import React, { Component } from 'react';
import { Alert, Text, View, Dimensions, Image, AsyncStorage } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Video from 'react-native-video';
import RNFetchBlob from 'react-native-fetch-blob';
import * as Progress from 'react-native-progress';
import KeepAwake from 'react-native-keep-awake';
import { RNS3 } from 'react-native-aws3';
import colors  from '../../theme/colors';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const option = {
  keyPrefix: "videos/",
  bucket: "famcamuploads",
  region: "us-east-2",
  accessKey: "AKIAI4LEFCTKJNKI63IQ",
  secretKey: "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",
  successActionStatus: 201
};

class UploadVideo extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      uploadProgress1: 0,
      indeterminate: true
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

    setTimeout(()=> {
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
      this.uploadVideo2()
      }
    }, 1000)
  }
  componentWillUnmount() {
    this.props.actions.ButtonDisabled2(false);
    this.props.actions.ButtonDisabled(false);
    this.props.actions.previewPause(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  cross = () => {
    Navigation.popToRoot(this.props.componentId);
  }
  retry = ()=> {
    Navigation.pop(this.props.componentId);
  }


  uploadVideo2 = () => {
    console.log('#####working')
    this.setState({isDisabled: true, indeterminate: false});
    KeepAwake.activate();
    let { userid, msg, loginHandel, requestid, videoPath, loginID, accessToken } = this.props.user;
  
    let video = {
      uri: videoPath,
      name: 'video.mp4',
      type: "video/mp4",
    };
    console.log('name#####', video)
    let formData = new FormData();
    formData.append('file', video);
    formData.append('accessToken', accessToken);
    formData.append('watermark',1);
    axios.post(`${Appurl.apiUrl}uploadVideo`, formData).then(
      response => {
        console.log(
          'res#############', response
        );
        this.setState({uploadProgress1: 0.95})
        this.completeBooking(response)
      },
      error => {
        console.log(error, 'error data');
      },
    );
  }


  completeBooking(response){
    var textOrder = "";
    var possible = '_qazwsxedcvfrtgbnhyujmkiolp12345678900987654321ploikmjunhytgbrfdzcxewqas';
    for (var i = 0; i < 15; i++){
      textOrder += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    // "http://13.58.155.17:8000/addVedioWaterMark"
    // `${Appurl.apiUrl}addVedioWaterMark`
    var finalTextOrder = textOrder.replace(/\s/g,'')
    console.log('resffcompleteBooking', response)
    let { requestid, accessToken, loginID } = this.props.user;
    let values = {'videoUrl' : response.data.data.video, "thumbnailUrl" : response.data.data.thumb, "requestId" : requestid, "accessToken" : accessToken, "videoName" : finalTextOrder}
    console.log('#####values', values)
    axios.post(`${Appurl.apiUrl}completeBooking`, values)
    .then((response) => {
      console.log('res', response)
      this.setState({uploadProgress1: 0.95})
      let values = {'talentId' : loginID}
      axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, values)
      .then((response) => {
        console.log(response)
        this.props.actions.setUserRequests(response.data.data)
        this.props.actions.setOnline(response.data.online)
        this.setState({isDisabled: false, visible: false, uploadProgress1: 1})
        Alert.alert(
          '',
          string('Preview.SuccessAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false});
                KeepAwake.deactivate();
                Navigation.popToRoot(this.props.componentId);
              }
            }
          ],
          { cancelable: false }
        )
      }).catch((error) => {
        console.log(error.response)
        if(error.response.data.success == 0) {
          return Alert.alert(
            '',
            error.response.data.msg,
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({isDisabled: false, visible: false})
                }
              }
            ],
            { cancelable: false }
          );
        }
      })
    }).catch((error) => {
      console.log('err######', error)
      if(error.response.data.success == 0) {
        return Alert.alert(
          '',
          error.response.data.msg,
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({isDisabled: false, visible: false})
              }
            }
          ],
          { cancelable: false }
        );
      }
    })
  }
  uploadVideo = async ()=> {
    let { userid, msg, loginHandel, requestid, videoPath, loginID, accessToken } = this.props.user;
    this.setState({isDisabled: true, indeterminate: false});
    KeepAwake.activate();
    var textOrder = "";
    var possible = '_qazwsxedcvfrtgbnhyujmkiolp12345678900987654321ploikmjunhytgbrfdzcxewqas';
    for (var i = 0; i < 15; i++){
      textOrder += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    // "http://13.58.155.17:8000/addVedioWaterMark"
    // `${Appurl.apiUrl}addVedioWaterMark`
    var finalTextOrder = textOrder.replace(/\s/g,'')
    const file = {
      // uri can also be a file system path (i.e. file://)
      uri: videoPath,
      name: finalTextOrder+'.mp4',
      type: "video/mp4"
    }
    await RNS3.put(file, option)
    .then(response => {
      if (response.status !== 201) {
        this.setState({ isDisabled: false, visible: false });
        throw new Error("Failed to upload video");
      }
      else {
        console.log(response.body);
        let value = {'watermark' : 1, 'accessToken': accessToken, 'file': finalTextOrder+'.mp4'}
        axios.post(`${Appurl.apiUrl}uploadVideo`, value)
        .then((response) => {
          console.log( 'resssssssssssss%%%%%%%%', response)
          this.setState({uploadProgress1: 0.95})
          let values = {'talentId' : loginID}
          axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, values)
          .then((response) => {
            console.log('res###########', response)
          //  this.props.actions.setUserRequests(response.data.data)
           // this.props.actions.setOnline(response.data.online)
            this.setState({isDisabled: false, visible: false, uploadProgress1: 1})
            Alert.alert(
              '',
              string('Preview.SuccessAlert'),
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({isDisabled: false, visible: false});
                    KeepAwake.deactivate();
                  //s  Navigation.popToRoot(this.props.componentId);
                  }
                }
              ],
              { cancelable: false }
            )
          }).catch((error) => {
            console.log('err######', error)
            if(error.response.data.success == 0) {
              return Alert.alert(
                '',
                error.response.data.msg,
                [
                  {
                    text: string('globalValues.AlertOKBtn'),
                    onPress: () => {
                      this.setState({isDisabled: false, visible: false})
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          })
        }).catch((error) => {
          console.log(error.response)
          if(error.response.data.success == 0) {
            return Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({isDisabled: false, visible: false})
                  }
                }
              ],
              { cancelable: false }
            );
          }
        })
      }
    })
    .catch((error)=> {
      console.log(error)
      this.props.navigator.pop()
    })
    .progress((e) => {
      console.log(e.percent)
      if(e.percent<=0.93) {
        this.setState({uploadProgress1: e.percent})
      }
    })

    // RNFetchBlob
    // .config({
    //   timeout: 2147483647,
    //   IOSBackgroundTask : true,
    //   IOSUploadTask : true
    // })
    // .fetch('POST', `${Appurl.apiUrl}addVedioWaterMark`, {
    //     'Content-Type' : 'multipart/form-data'
    //   },
    //   [
    //     // element with property `filename` will be transformed into `file` in form data
    //     { name : 'handel', data: loginHandel},
    //     { name : 'bookingId', data: requestid},
    //     // part file from storage
    //     { name : 'file', filename : textOrder+'.mp4', type:'video/mp4', data: RNFetchBlob.wrap(videoPath.replace("file://", ""))}
    //     // elements without property `filename` will be sent as plain text
    //   ]
    // )
    // .uploadProgress((written, total) => {
    //   console.log('uploaded', written , total, written / total)
    //   this.setState({uploadProgress1:written/total})
    // })
    // .then((resp) => {
    //   console.log(resp)
    //   let response = JSON.parse(resp.data)
    //   console.log(resp, response)
    //   let value = {'talentId' : loginID}
    //   axios.post(`${Appurl.apiUrl}renderRequestinTalentAcount`, value)
    //   .then((response) => {
    //     console.log(response)
    //     this.props.actions.setUserRequests(response.data.data)
    //     this.props.actions.setOnline(response.data.online)
    //     this.setState({isDisabled: false, visible: false, uploadProgress1: 1})
    //     Alert.alert(
    //       '',
    //       string('Preview.SuccessAlert'),
    //       [
    //         {
    //           text: string('globalValues.AlertOKBtn'),
    //           onPress: () => {
    //             this.setState({isDisabled: false, visible: false});
    //             KeepAwake.deactivate();
    //             this.props.navigator.popToRoot();
    //           }
    //         }
    //       ],
    //       { cancelable: false }
    //     )
    //   }).catch((error) => {
    //     console.log(error.response)
    //     if(error.response.data.success == 0) {
    //       return Alert.alert(
    //         '',
    //         error.response.data.msg,
    //         [
    //           {
    //             text: string('globalValues.AlertOKBtn'),
    //             onPress: () => {
    //               this.setState({isDisabled: false, visible: false})
    //             }
    //           }
    //         ],
    //         { cancelable: false }
    //       );
    //     }
    //   })
    // }).catch((err) => {
    //   console.log(err);
    //   Alert.alert(
    //     '',
    //     string('Preview.RetryAlert'),
    //     [
    //       {
    //         text: string('globalValues.AlertOKBtn'),
    //         onPress: () => {
    //           this.setState({isDisabled: false, visible: false});
    //           this.props.navigator.pop()
    //         }
    //       }
    //     ],
    //     { cancelable: false }
    //   );
    // })
  }

  myfunction = (obj) => {
    console.log(obj, 'myfunction')
    var bodyFormData = new FormData();
    bodyFormData.set('accessToken', obj.accessToken);
    bodyFormData.set('file', obj.videoName);
    bodyFormData.set('watermark', 1);
    axios.post(`${Appurl.apiUrl}uploadVideo`, obj)
    .then((response) => {
      console.log('response', response)
    }).catch((error) => {
      console.log('error', error)
    })
  }
  render() {
    let { uploadProgress1, indeterminate } = this.state;
    let { lang } = this.props.user;
    return (
      <View style={{flex: 1, alignItems: 'center'}}>
        <View style={{height: 100}}></View>
        <View style={{height: 50, marginHorizontal: 24}}>
          <Text style={{fontSize: 24, color: colors.themeColor, textAlign: 'center', fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('Preview.uploadingText')}</Text>
          <Text style={{fontSize: 14, color: colors.themeColor, textAlign: 'center', fontFamily: lang=='en'?'SFProText-Regular':'HelveticaNeueLTArabic-Light'}}>*{string('Preview.uploadingText1')}</Text>
        </View>
        <View style={{height: 150}}></View>
        <Progress.Circle
          progress={uploadProgress1}
          size={100}
          thickness={7}
          color= {colors.themeColor}
          indeterminate={indeterminate}
        />
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

export default connect(mapStateToProps, mapDispatchToProps)(UploadVideo);
