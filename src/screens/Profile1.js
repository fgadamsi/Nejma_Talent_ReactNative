import React, { Component } from 'react';
import { Platform, SafeAreaView, Alert, Text, View, Image, TouchableOpacity, TextInput, AsyncStorage,Dimensions,  PermissionsAndroid} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import Icon from 'react-native-vector-icons/EvilIcons';
import { Navigation } from 'react-native-navigation';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import ImagePicker from 'react-native-image-picker';
import { RNS3 } from 'react-native-aws3';
import colors  from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
// import ImagePickerCrop from 'react-native-image-crop-picker';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
const { width, height } = Dimensions.get('window')
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const abc = '';
const bca = '';
const option = {
  keyPrefix: "ImagesTalent/",
  bucket: "famcamuploads",
  region: "us-east-2",
  accessKey: "AKIAI4LEFCTKJNKI63IQ",
  secretKey: "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",
  successActionStatus: 201
};
var options = {
  title: 'Select Image',
  mediaType: 'photo',
  noData: true,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class Profile1 extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      bio: '',
      visible: false,
      isDisabled: false,
      avatarSource: ''
    }
  }

  componentDidMount() {
    NetInfo.getConnectionInfo().then((connectionInfo) => {
      if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
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
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    this.setState({ isDisabled: false })
    this.props.navigator.pop();
  }
  validationRules = () => {
    return [
      {
        field: this.state.name,
        name: 'Full name',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.bio,
        name: 'Bio',
        rules: 'required|min:1|max:120'
      },
    ]
  }
  validationArRules = () => {
    return [
      {
        field: this.state.name,
        name: 'الإسم الكامل',
        rules: 'required|min:2|max:50'
      },
      {
        field: this.state.bio,
        name: 'حول',
        rules: 'required|min:1|max:120'
      },
    ]
  }
  profile2 = async () => {
    let { actions } = this.props;
    let { name, bio, visible, avatarSource } = this.state;
    let { lang } = this.props.user;
    let validation = lang == 'en' ? Validation.validate(this.validationRules()) : ValidationAr.validate(this.validationArRules())
    if (validation.length != 0) {
      return Alert.alert(
        '',
        validation[0],
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: () => {

            }
          }
        ],
        { cancelable: false }
      );
    }
    else if (!this.props.user.netStatus) {
      return Alert.alert(
        '',
        string('globalValues.NetAlert'),
        [
          {
            text: string('globalValues.AlertOKBtn'),
            onPress: () => {
            }
          }
        ],
        { cancelable: false }
      );
    }
    else {
      if (!avatarSource) {
        return Alert.alert(
          '',
          string('Profile1.PictureRequired'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({ isDisabled: false, visible: false });
              }
            }
          ],
          { cancelable: false }
        );
      }
      this.setState({ isDisabled: true, visible: true })
      var textOrder = "";
      var possible = '_qazwsxedcvfrtgbnhyujmkiolp12345678900987654321ploikmjunhytgbrfdzcxewqas';
      for (var i = 0; i < 15; i++) {
        textOrder += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      var finalTextOrder = textOrder.replace(/\s/g,'')
      const file = {
        // uri can also be a file system path (i.e. file://)
        uri: this.state.avatarSource,
        name: finalTextOrder + '.jpg',
        type: "image/jpg"
      }
      await RNS3.put(file, option).then(response => {
        if (response.status !== 201) {
          this.setState({ isDisabled: false, visible: false });
          throw new Error("Failed to upload image");
        }
        else {
         //  this.getData();
          console.log(response.body);
          let values = { 'name': name, 'Bio': bio, 'talentId': this.props.user.registerID, 'profilePicUrl': response.body.postResponse.location }
          console.log(values);
          return axios.post(`${Appurl.apiUrl}setupTalentProfile`, values)
            .then((response) => {
              return this.getData(response);
            }).catch((error) => {
              console.log(error.response.data.msg, 'err')
              if (error.response.data.success == 0) {
                if (Platform.OS == 'ios') {
                  setTimeout(() => {
                    Alert.alert(
                      '',
                      error.response.data.msg,
                      [
                        {
                          text: string('globalValues.AlertOKBtn'),
                          onPress: () => {
                            this.setState({ isDisabled: false, visible: false });
                          }
                        }
                      ],
                      { cancelable: false }
                    );
                  }, 600)
                }
                else {
                  Alert.alert(
                    '',
                    error.response.data.msg,
                    [
                      {
                        text: string('globalValues.AlertOKBtn'),
                        onPress: () => {
                          this.setState({ isDisabled: false, visible: false });
                        }
                      }
                    ],
                    { cancelable: false }
                  );
                }
              }
            })
        }
      })
    }
  }
  getData = () => {
    let { visible } = this.state;
    this.setState({ isDisabled: false, visible: false });
    setTimeout(() => {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'FamCamTalent.Profile2',
          options: {
            topBar: {
                visible: false
            }
          }
        }
      });
      // this.props.navigator.push({
      //   screen: 'FamCamTalent.Profile2'
      // })
    }, 1000)
  }
  pickImage = async () => {
    this.setState({ isDisabled: true })
    if (Platform.OS == 'android' && Platform.Version > 22) {
      const granted = await PermissionsAndroid.requestMultiple(
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
              onPress: () => {
                this.setState({ isDisabled: false })
              }
            }
          ],
          { cancelable: false }
        );
      }
    }
    ImagePicker.showImagePicker(options, (response) => {
      console.log(response)
      if (response.didCancel) {
        this.setState({ isDisabled: false });
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        this.setState({ isDisabled: false });
        console.log('ImagePicker Error: ', response.error);
      }
      else if (!response.error && !response.didCancel) {
        // bca=response.uri
        // let{actions}=this.props;
        this.setState({ avatarSource: response.uri, isDisabled: false })
        // actions.setProfileImage(response.uri);
        // this.setState({isDisabled: false})
        // avatarSource ='data:image/jpeg;base64,' + response.data;
        // ImagePickerCrop.openCropper({
        //   path: response.uri,
        //   width: 320,
        //   height: 200,
        //   includeBase64: true
        // }).then(image => {
        //   console.log(image)
        //   console.log(image.path);
        //   bca=image.path;
        //   let r ='data:image/jpeg;base64,' + image.data;
        //   let{actions}=this.props;
        //   actions.setProfileImage(r);
        // });
      }
    });
  }
  renderImage = () => {
    let { avatarSource } = this.state;
    if (avatarSource)
      return <Image source={{ uri: avatarSource }} style={{ alignSelf: 'center', height: 80, width: 80, borderRadius: 40 }} />
    else
      return <Icon name="camera" size={25} color="#636363" style={{ height: 25, width: 25 }} />
  }
  render() {
    let { name, bio, visible, isDisabled } = this.state;
    let { flexDirection, textAlign, lang } = this.props.user;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, marginHorizontal: 24 }}>
          <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
          <View style={{ flex: 0.1, justifyContent: 'center' }}>
            <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center' }} onPress={this.back}>
              <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
            <Text style={{ color: '#000000', fontSize: 24, textAlign: textAlign, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('Profile1.profileText')}</Text>
          </View>
          <View style={{ flex: 0.12, flexDirection: flexDirection }}>
            <TouchableOpacity onPress={this.pickImage} style={{ height: 80, width: 80, borderWidth: 1, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderColor: '#9B9B9B' }}>
              {this.renderImage()}
            </TouchableOpacity>
            <View style={{ width: 20 }}></View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: textAlign, fontSize: 12, color: '#9B9B9B', marginLeft: 10, fontFamily: lang == 'en' ? 'SFProDisplay-Light' : 'HelveticaNeueLTArabic-Light' }}>{string('Profile1.picLabel')}</Text>
            </View>
          </View>
          <View style={{ flex: 0.05 }}></View>
          <View style={{ flex: 0.25 }}>
            <View style={{ flex: 0.5 }}>
            <View style={{ marginTop:moderateScale(10)}}>
                      <Text style={styles.inputLabel}>{string('Profile1.nameLabel')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                          ref="profile1"
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('Profile1.nameLabel')}
                          autoCapitalize="none"
                          keyboardType = "default"
                          returnKeyType={"next"}
                          onChangeText={(text) => this.setState({ name: text.trim() })}
                          onSubmitEditing={(event) => { this.refs.bioIn.focus(); }}
                         />
                      <View style={styles.inputLine} />
              </View>
            </View>
            <View style={{ flex: 0.5 }}>
            <View style={{ marginTop:moderateScale(20)}}>
                      <Text style={styles.inputLabel}>{string('Profile1.bioLabel')}</Text>
                      <TextInput style={styles.textInputStyle}
                        selectionColor={colors.themeColor}
                        ref="bioIn"
                          underlineColorAndroid="transparent"
                          placeholderTextColor={colors.textColor}
                          placeholder={string('Profile1.bioLabel')}
                          autoCapitalize="none"
                          keyboardType = "default"
                          returnKeyType={"next"}
                          onChangeText={(text) => this.setState({ bio: text.trim() })}
                          onSubmitEditing={(event) => { this.refs.bioIn.focus(); }}
                         />
                      <View style={styles.inputLine} />
              </View>
            
            </View>
          </View>
          <View style={{ flex: 0.03 }}></View>
                 <TouchableOpacity style={styles.loginButton} onPress={() => this.profile2()}>
                      <Text style={styles.loginButtonText}>{string('ProfileDiscover.Next')}</Text>
                  </TouchableOpacity>
          <View style={{ flex: 0.27 }}></View>
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile1);

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
  loginButtonText: {
    fontFamily: fontFamily.regular,
    textAlign: 'center',
    color:colors.white,
    fontSize: '16@ms',
    fontWeight : fontWeight.medium,
    fontFamily : fontFamily.mediumBold,
  },
  inputLabel: {
    lineHeight: '16@ms',
    fontSize: '14@ms',
    color: colors.labelColor,
    opacity: 0.50,
    fontFamily: fontFamily.regular,
    textAlign: 'left'
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