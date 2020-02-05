import React, { Component } from 'react';
import { Platform, SafeAreaView, TextInput, Alert, Text, View, Dimensions, Image, TouchableOpacity, AsyncStorage, PermissionsAndroid, ScrollView } from 'react-native';

import { Navigation } from 'react-native-navigation';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
// import OneSignal from 'react-native-onesignal';
import { RNS3 } from 'react-native-aws3';
import FastImage from 'react-native-fast-image';
// import ImagePickerCrop from 'react-native-image-crop-picker';
import colors  from '../../theme/colors';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import NetInfo from "@react-native-community/netinfo";
import * as userActions from '../actions/userActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

var abc;
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

class EditProfile extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };
  constructor(props) {
    super(props);
    this.state = {
      isDisabled: false,
      visible: false,
      avatarSource: '',
      name: '',
      bio: '',
      email: '',
      emailEdit: false
    }
  }

  componentWillMount() {
    this.setState({ name: this.props.user.loginName, bio: this.props.user.loginBio, email: this.props.user.loginEmail });
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
    this.props.actions.ButtonDisabled1(false)
    NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
  }
  _handleConnectionChange = (isConnected) => {
    this.props.actions.checkInternet(isConnected);
  }

  back = () => {
    Navigation.pop(this.props.componentId);
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
      {
        field: this.state.email,
        name: 'Email Id',
        rules: 'required|email|max:100|no_space'
      }
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
      {
        field: this.state.email,
        name: 'البريد الإلكتروني',
        rules: 'required|email|max:100|no_space'
      }
    ]
  }
  save = async () => {
    let { actions } = this.props;
    let { name, bio, email, avatarSource, visible, isDisabled } = this.state;
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
      this.setState({ isDisabled: true, visible: true })
    //  OneSignal.sendTag("phone", email);
      if (this.state.avatarSource) {
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
            console.log(response.body);
            abc = response.body.postResponse.location;
          }
        })
      }
      let values = { 'talentId': this.props.user.loginID, 'email': email, 'name': name, 'Bio': bio, 'profilePicUrl': abc ? abc : this.props.user.loginImage }
      console.log(values)
      return axios.post(`${Appurl.apiUrl}changeTalentProfile`, values)
        .then((response) => {
          console.log(response)
          return this.getData(response);
        }).catch((error) => {
          console.log(error)
          if (error.response.data.success == 0) {
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
        })
    }
  }
  emailResend = () => {
    if (!this.props.user.netStatus) {
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
      this.setState({ isDisabled: true, visible: true })
      let values = { 'talentId': this.props.user.loginID }
      console.log(values)
      return axios.post(`${Appurl.apiUrl}resendTalentEmail`, values)
        .then((response) => {
          console.log(response)
          Alert.alert(
            '',
            string('Home.ResendEmailText'),
            [
              {
                text: string('globalValues.AlertOKBtn'),
                onPress: () => {
                  this.setState({ isDisabled: false, visible: false })
                  Navigation.pop(this.props.componentId);
                }
              }
            ],
            { cancelable: false }
          );
        }).catch((error) => {
          console.log(error)
          if (error.response.data.success == 0) {
            Alert.alert(
              '',
              error.response.data.msg,
              [
                {
                  text: string('globalValues.AlertOKBtn'),
                  onPress: () => {
                    this.setState({ isDisabled: false, visible: false })
                  }
                }
              ],
              { cancelable: false }
            );
          }
        })
    }
  }
  getData = async (gotResponse) => {
    let { isDisabled, visible, name, bio, email } = this.state;
    let { actions } = this.props;
    let loginDetails = { 'talentId': this.props.user.loginID, 'talentName': name, 'talentBio': bio, 'talentImage': abc ? abc : this.props.user.loginImage, 'handel': this.props.user.loginHandel, 'professions': this.props.user.loginProfessions, 'talentEmail': email };
    try {
      await AsyncStorage.setItem('talent', JSON.stringify(loginDetails));
      await AsyncStorage.getItem('talent')
        .then((talent) => {
          if (talent != null) {
            let qwe = JSON.parse(talent);
            let { actions } = this.props;
            console.log(qwe)
            actions.setLoginDetails(qwe.talentId, qwe.talentName, qwe.talentBio, qwe.talentImage, qwe.handel, qwe.professions, qwe.talentEmail);
            this.setState({ isDisabled: false, visible: false });
          }
        })
      setTimeout(() => {
        Alert.alert(
          '',
          string('ProfileDiscover.updateSuccessAlert'),
          [
            {
              text: string('globalValues.AlertOKBtn'),
              onPress: () => {
                this.setState({ isDisabled: false, visible: false });
                Navigation.pop(this.props.componentId);
              }
            }
          ],
          { cancelable: false }
        );
      }, 600)
    }
    catch (error) {
      console.log(error)
    }
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
          string('EditProfile.CameraPermission'),
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
        this.setState({ isDisabled: false })
        console.log(response)
        console.log(response.data)
        // let r ='data:image/jpeg;base64,' + response.data;
        this.setState({ avatarSource: response.uri })
        // ImagePickerCrop.openCropper({
        //   path: response.uri,
        //   width: 320,
        //   height: 200,
        //   includeBase64: true
        // }).then(image => {
        //   bca=image.path;
        //   let r ='data:image/jpeg;base64,' + image.data;
        //   this.setState({avatarSource: r})
        // });
      }
    });
  }
  editEmail = () => {
    this.setState({ emailEdit: true })
  }
  changeProfession = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'FamCamTalent.ChangeProfessions',
        options: {
          topBar: {
              visible: false
          }
        }
      }
    });
   
  }
  render() {
    let { visible, isDisabled, avatarSource, emailEdit, name, bio, email } = this.state;
    let { flexDirection, textAlign, lang, loginProfessions, loginImage, emailVerified } = this.props.user;
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView
          style={{ height: 800, width: windowWidth, backgroundColor: 'white' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 800, width: windowWidth, marginHorizontal: 24 }}>
            <Spinner visible={visible} color={colors.themeColor} tintColor={colors.themeColor} animation={'fade'} cancelable={false} textStyle={{ color: '#FFF' }} />
            <View style={{ height: 56, width: windowWidth - 48, flexDirection: 'row', marginTop: 24 }}>
              <View style={{ flex: 0.5, justifyContent: 'center' }}>
                <TouchableOpacity hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} disabled={isDisabled} style={{ height: 20, width: 24, justifyContent: 'center', marginTop: 10 }} onPress={this.back}>
                  <Image source={require('./../../images/ic_back.png')} style={{ tintColor: '#000000', height: 14, width: 18 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'flex-end' }}>
                <TouchableOpacity hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }} disabled={isDisabled} style={{ height: 56, width: 56, borderRadius: 28, justifyContent: 'center' }} onPress={this.save}>
                  <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{ height: 56, width: 56, borderRadius: 28, justifyContent: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Image source={require('./../../images/Tick.png')} style={{ height: 16, width: 20, alignSelf: 'center' }} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 48, width: windowWidth - 48, justifyContent: 'flex-start', backgroundColor: 'transparent' }}>
              <Text style={{ textAlign: textAlign, color: '#000000', fontSize: 24, fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('EditProfile.EditText')}</Text>
            </View>
            <View style={{ height: 24 }}></View>
            <View style={{ height: 80, width: windowWidth - 48, flexDirection: flexDirection }}>
              <View style={{ flex: 0.3, alignItems: this.props.user.lang == 'en' ? 'flex-start' : 'flex-end' }}>
                <FastImage source={{ uri: avatarSource ? avatarSource : `${Appurl.apiUrl}resizeimage?imageUrl=` + loginImage + '&width=160&height=160' }} style={{ height: 80, width: 80, borderRadius: 40 }} />
              </View>
              <View style={{ flex: 0.6 }}>
                <TouchableOpacity onPress={this.pickImage} style={{ flex: 0.5, height: 32, borderRadius: 4, backgroundColor: 'transparent' }}>
                  <LinearGradient colors={[colors.themeColor, colors.themeColor]} style={{ flex: 1, borderRadius: 4, justifyContent: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center', fontFamily: lang == 'en' ? 'SFUIText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.PictureBTN')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={{ flex: 0.5, justifyContent: 'center', backgroundColor: 'transparent' }}>
                  <Text style={{ textAlign: textAlign, fontSize: 12, color: '#9B9B9B', fontFamily: lang == 'en' ? 'SFProDisplay-Light' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.PicLabel')}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 32 }}></View>
            <View style={{ height: 64, width: windowWidth - 48 }}>
              <View style={{ height: 14, width: windowWidth - 48 }}>
                <Text style={{ color: '#474d57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.NameLabel')}</Text>
              </View>
              <View style={{ height: 2, width: windowWidth - 48 }}></View>
              <View style={{ height: 40, width: windowWidth - 48 }}>
                <TextInput
                  style={{ height: 40, color: '#474D57', fontSize: 16, borderBottomWidth: 0.5, borderBottomColor: '#9B9B9B', textAlign: textAlign }}
                  value={name}
                  underlineColorAndroid='transparent'
                  returnKeyType="done"
                  keyboardType='default'
                  autoCorrect={false}
                  autoCapitalize='words'
                  onChangeText={(text) => this.setState({ name: text })}
                />
              </View>
            </View>
            <View style={{ height: 16, width: windowWidth - 48 }}></View>
            <View style={{ height: 104, width: windowWidth - 48 }}>
              <View style={{ height: 14, width: windowWidth - 48 }}>
                <Text style={{ color: '#474d57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.BioLabel')}</Text>
              </View>
              <View style={{ height: 2, width: windowWidth - 48 }}></View>
              <View style={{ height: 88, width: windowWidth - 48 }}>
                <TextInput
                  style={{ height: 88, color: '#474D57', fontSize: 16, borderBottomWidth: 0.5, borderBottomColor: '#9B9B9B', textAlign: textAlign }}
                  value={bio}
                  multiline={true}
                  underlineColorAndroid='transparent'
                  returnKeyType="done"
                  keyboardType='default'
                  autoCorrect={false}
                  autoCapitalize='words'
                  onChangeText={(text) => this.setState({ bio: text })}
                />
              </View>
            </View>
            <View style={{ height: 16, width: windowWidth - 48 }}></View>
            <View style={{ height: 56, width: windowWidth - 48 }}>
              <View style={{ height: 14, justifyContent: 'flex-end' }}>
                <Text style={{ color: '#474d57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.ProfessionLabel')}</Text>
              </View>
              <View style={{ height: 2, width: windowWidth - 48 }}></View>
              <TouchableOpacity style={{ height: 40, width: windowWidth - 48, flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#9B9B9B', alignItems: 'center', justifyContent: lang == 'ar' ? 'flex-end' : 'flex-start' }} onPress={this.changeProfession}>
                <Text style={{ color: '#474D57', color: '#474D57', fontSize: 16, textAlign: 'left', fontFamily: lang == 'en' ? 'SFProDisplay-Regular' : 'HelveticaNeueLTArabic-Light' }}>{lang == 'en' ? loginProfessions[0].professionCatagory.en : loginProfessions[0].professionCatagory.ar}</Text>
                {loginProfessions[1] ? <View style={{ flexDirection: 'row' }}><Text style={{ marginTop: -3, color: '#474D57', fontSize: 16, textAlign: 'left', fontFamily: 'SFProDisplay-Regular' }}> . </Text>
                  <Text style={{ color: '#474D57', color: '#474D57', fontSize: 16, textAlign: 'left', fontFamily: lang == 'en' ? 'SFProDisplay-Regular' : 'HelveticaNeueLTArabic-Light' }}>{lang == 'en' ? loginProfessions[1].professionCatagory.en : loginProfessions[1].professionCatagory.ar}</Text>
                </View> : null}
              </TouchableOpacity>
            </View>
            <View style={{ height: 32, width: windowWidth - 48 }}></View>
            <View style={{ height: 32, width: windowWidth - 48, borderBottomWidth: 0.5, borderBottomColor: '#9B9B9B', justifyContent: 'center' }}>
              <Text style={{ textAlign: textAlign, color: '#1E1C1C', fontSize: 16, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.AccountLabel')}</Text>
            </View>
            <View style={{ height: 16, width: windowWidth - 48 }}></View>
            <View style={{ height: 56, width: windowWidth - 48, flexDirection: flexDirection, borderBottomWidth: 0.5, borderBottomColor: '#9B9B9B' }}>
              <View style={{ height: 56, width: windowWidth * 0.7 }}>
                <View style={{ height: 14, width: windowWidth - 48, justifyContent: 'flex-end' }}>
                  <Text style={{ color: '#474d57', opacity: 0.5, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.EmailLabel')}</Text>
                </View>
                <View style={{ height: 2, width: windowWidth - 48 }}></View>
                <View style={{ height: 40, width: windowWidth * 0.7, minHeight: 20, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <TextInput
                    style={{ height: 40, width: windowWidth * 0.7, color: '#474D57', fontSize: 16, textAlign: textAlign }}
                    editable={emailEdit}
                    value={email}
                    autoFocus={emailEdit}
                    underlineColorAndroid='transparent'
                    returnKeyType="done"
                    keyboardType='default'
                    autoCorrect={false}
                    autoCapitalize='words'
                    onChangeText={(text) => this.setState({ email: text.trim() })}
                  />
                </View>
              </View>
              <View style={{ height: 48, width: windowWidth * 0.3, flexDirection: flexDirection, alignItems: 'center' }}>
                {/* <TouchableOpacity style={{ height: 16, width: 62, justifyContent: 'center' }} onPress={this.editEmail}>
                  <Text style={{ color: '#307DFF', fontSize: 14, textAlign: 'right', fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('EditProfile.ChangeBTN')}</Text>
                </TouchableOpacity> */}
              </View>
            </View>
            <View style={{ height: 16, width: windowHeight - 48 }}></View>
            {emailVerified ? null :
              <View style={{ height: 128, width: windowWidth - 48 }}>
                <View style={{ height: 16, width: windowWidth - 48, justifyContent: 'center' }}>
                  <Text style={{ textAlign: textAlign, color: '#FF4B4B', fontSize: 14, fontFamily: lang == 'en' ? 'SFProText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('EditProfile.EVerifyLabel')}</Text>
                </View>
                <View style={{ height: 8, width: windowWidth - 48 }}></View>
                <View style={{ height: 36, width: windowWidth - 48, justifyContent: 'flex-start' }}>
                  <Text style={{ textAlign: textAlign, color: '#474D57', fontSize: 12, fontFamily: lang == 'en' ? 'SFProText-Regular' : 'HelveticaNeueLTArabic-Light' }}>{string('EditProfile.EVerifyText')}</Text>
                </View>
                <View style={{ height: 20, width: windowWidth - 48 }}></View>
                <View style={{ height: 16, width: windowWidth - 48, justifyContent: 'flex-end' }}>
                  <TouchableOpacity style={{ height: 20, justifyContent: 'center' }} onPress={this.emailResend}>
                    <Text style={{ textAlign: textAlign, color: '#000000', fontSize: 14, fontFamily: lang == 'en' ? 'SFUIText-Bold' : 'HelveticaNeueLTArabic-Bold' }}>{string('EditProfile.ResendBTN')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 32, width: windowWidth - 48 }}></View>
              </View>}
          </View>
        </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);
