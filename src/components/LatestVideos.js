import React, { Component } from 'react';
import { RefreshControl, FlatList, Platform, Alert, Text, View, Dimensions, Image, TouchableOpacity, ScrollView, PermissionsAndroid, AsyncStorage} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import RNFetchBlob from 'react-native-fetch-blob';
import ImagePro from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

import { string } from './../../i18n/i18n';
import Appurl from './../../config';

import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import colors from '../../theme/colors';

class LatestVideos extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      visible: false
    }
  }

  componentDidMount() {
   // alert("hiii")
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
        let values = {'talentId' : this.props.user.loginID}
        axios.post(`${Appurl.apiUrl}TalentVediosUrl`, values)
        .then((response) => {
          console.log(response.data.data)
          this.props.actions.setVideosList(response.data.data)
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

  playVideo = async (obj, filePath, fileName)=> {
    console.log('selectedObj', obj)
    if(!this.props.user.netStatus) {
      this.setState({isDisabled: false,visible: false});
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
      if(Platform.OS == 'android' && Platform.Version > 22) {
        const granted = await PermissionsAndroid.requestMultiple (
          [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ]
        );
        if (granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
          return Alert.alert(
            '',
            string('globalValues.VideoSave'),
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: ()=> {
                  this.props.actions.ButtonDisabled1(false);
                  this.setState({isDisabled: false, visible: false});
                }
              }
            ],
            { cancelable: false }
          );
        }
      }
      this.props.actions.ButtonDisabled1(true);
      this.setState({isDisabled: true, visible: true});
      let dirs;
      if(Platform.OS=='ios') {
        dirs=RNFetchBlob.fs.dirs.DocumentDir;
      }
      else {
        dirs = RNFetchBlob.fs.dirs.MovieDir;
      }
      let famcamDir = dirs+'/FamCamTalent';
      RNFetchBlob.fs.isDir(famcamDir)
      .then((isDir) => {
        if(!isDir) {
          RNFetchBlob.fs.mkdir(famcamDir)
          .then(() => {
            RNFetchBlob
            .config({
              // response data will be saved to this path if it has access right.
              path : famcamDir+'/'+fileName
            })
            .fetch('GET', filePath, {
              //some headers ..
            })
            .then((res) => {
              console.log(res)
              // the path should be dirs.DocumentDir + 'path-to-file.anything'
              console.log('The file saved to ', res.path())
              let playpath = res.path();
              this.props.actions.setPlayVideo(playpath)
              this.setState({isDisabled: false, visible: false})
              if(Platform.OS=='ios') {
                setTimeout(()=> {
                  this.props.navigator.push({
                    screen: 'FamCamTalent.PlayVideo'
                  })
                }, 1200)
              }
              else {
                setTimeout(()=> {
                  Navigation.showModal({
                    screen: 'FamCamTalent.PlayVideo'
                  })
                }, 1200)
              }
            })
          })
        }
        else {
          RNFetchBlob.fs.exists(famcamDir+'/'+fileName)
          .then((exist) => {
            console.log(exist)
            if(!exist) {
              RNFetchBlob
              .config({
                // response data will be saved to this path if it has access right.
                path : famcamDir+'/'+fileName
              })
              .fetch('GET', filePath, {
                //some headers ..
              })
              .then((res) => {
                console.log(res)
                // the path should be dirs.DocumentDir + 'path-to-file.anything'
                console.log('The file saved to ', res.path())
                let playpath = res.path();
                this.props.actions.setPlayVideo(playpath)
                this.setState({isDisabled: false, visible: false})
                if(Platform.OS=='ios') {
                  setTimeout(()=> {
                    Navigation.push(this.props.componentId, {
                      component: {
                        name: 'FamCamTalent.PlayVideo',
                        options: {
                          topBar: {
                              visible: false
                          }
                        }
                      }
                    });
                  }, 1200)
                }
                else {
                  setTimeout(()=> {
                    Navigation.showModal({
                      stack: {
                        children: [{
                          component: {
                            name: 'FamCamTalent.PlayVideo',      options: {
                              topBar: {
                                visible: false
                              }
                            }
                          }
                        }]
                      }
                    });
                  
                  }, 1200)
                }
              })
            }
            else {
              let playpath = famcamDir+'/'+fileName;
              this.props.actions.setPlayVideo(playpath)
              this.setState({isDisabled: false, visible: false})
              if(Platform.OS=='ios') {
                setTimeout(()=> {
                  Navigation.push(this.props.componentId, {
                    component: {
                      name: 'FamCamTalent.PlayVideo',
                      options: {
                        topBar: {
                            visible: false
                        }
                      }
                    }
                  });
                }, 1200)
              }
              else {
                setTimeout(()=> {
                  Navigation.showModal({
                    stack: {
                      children: [{
                        component: {
                          name: 'FamCamTalent.PlayVideo',    
                            options: {
                            topBar: {
                              visible: false
                            }
                          }
                        }
                      }]
                    }
                  });
                }, 1200)
              }
            }
          })
          .catch((err) => { console.log(err) })
        }
      })
      .catch((err) => { console.log(err) })
    }
  }
  getVideosList = () => {
    if(!this.props.user.netStatus) {
      this.setState({refreshing: false})
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
      let values = {'talentId' : this.props.user.loginID}
      axios.post(`${Appurl.apiUrl}TalentVediosUrl`, values)
      .then((response) => {
        console.log(response.data.data)
        this.props.actions.setVideosList(response.data.data)
        this.setState({isDisabled: false, refreshing: false})
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
    this.getVideosList();
  }
  renderItem(data) {
    let { item, index } = data;
    let { isDisabled, visible } = this.state;
    let { allow1 } = this.props.user;
    const windowWidth = Dimensions.get('window').width;
    const tileWidth = (Dimensions.get('window').width/2)-32;
    const tileHeightRation = Dimensions.get('window').height/640;
    console.log(allow1)
    return (
      <View style={{flex: 1, marginStart: tileWidth/32}}>
        <TouchableOpacity disabled={allow1} style={{height:tileHeightRation*224,width: tileWidth}} onPress={()=>this.playVideo(item, item.videoUrl, item.videoName)}>
          <LinearGradient colors={['black', 'black']} style={{flex:1}}>
            <ImagePro
              style={{height:tileHeightRation*224,width: tileWidth, opacity: 0.75}}
              resizeMode='cover'
              source={{uri: `${Appurl.apiUrl}resizeimage?imageUrl=`+item.thumbnailUrl+'&width='+(tileWidth*2)+'&height='+((tileHeightRation*224)*2)}}
              indicator={Progress.CircleSnail}
              indicatorProps={{
                color:['red', 'green', 'blue']
              }}
            />
          </LinearGradient>
          <View style={{backgroundColor: 'transparent',justifyContent: 'flex-start', alignItems: 'flex-end',position: 'absolute',top:5,bottom: 0,left: 0,right: 5}}>
            <Text style={{backgroundColor: 'transparent',fontSize:12, fontFamily: 'SFUIDisplay-Bold', color : 'white'}}>{item.duration}</Text>
          </View>
          <View style={{backgroundColor: 'transparent',justifyContent: 'flex-end', alignItems: 'flex-start',position: 'absolute',top:0,bottom: 5,left: 5,right: 0}}>
            <Image style={{height: 24, width: 24}} source={require('./../../images/Group_white.png')}/>
          </View>
        </TouchableOpacity>
      </View>
    )
  }
  renderEmpty(data) {
    let { item, index } = data;
    let { lang } = this.props.user;
    return (
      <View style={{flex: 1}}>
        <Text style={{color: colors.themeColor,textAlign: 'center', fontSize: 14, marginTop: 20, fontFamily: lang=='en'?'SFProDisplay-Bold':'HelveticaNeueLTArabic-Bold'}}>{string('globalValues.NothingText')}</Text>
      </View>
    )
  }
  renderSeperator(data) {
    let { item, index } = data;
    return (
      <View style={{height: 20}}></View>
    )
  }
  render() {
    let { refreshing } = this.state;
    let { flexDirection, videosArr, isDisabled, visible } = this.props.user;
    return (
      <View style={{flex: 1, marginHorizontal: 24}}>
        <Spinner visible={visible||this.state.visible} color='#8D3F7D' tintColor='#8D3F7D' animation={'fade'} cancelable={false} textStyle={{color: '#FFF'}} />
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index}
          data={videosArr}
          numColumns={2}
          columnWrapperStyle={{flexDirection: flexDirection}}
          ItemSeparatorComponent={this.renderSeperator.bind(this)}
          initialNumToRender={4}
          ListHeaderComponent={this.renderSeperator.bind(this)}
          ListFooterComponent={this.renderSeperator.bind(this)}
          ListEmptyComponent={this.renderEmpty.bind(this)}
          renderItem={this.renderItem.bind(this)}
          style={{flex:1}}
          refreshControl={
                      <RefreshControl
                          refreshing={refreshing}
                          onRefresh={this._onRefresh.bind(this)}
                          colors={['#BF4D73', '#D8546E', '#8D3F7D']}
                      />
                  }
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

export default connect(mapStateToProps, mapDispatchToProps)(LatestVideos);
