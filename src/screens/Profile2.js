import React, { Component } from 'react';
import {
	SafeAreaView,
	Alert,
	Text,
	TextInput,
	View,
	Image,
	TouchableOpacity,
	Dimensions
} from 'react-native';

import { Navigation } from 'react-native-navigation';
import { Dropdown } from 'react-native-material-dropdown';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import NetInfo from '@react-native-community/netinfo';
import { string } from './../../i18n/i18n';
import Appurl from './../../config';
import Validation from '../Validation.js';
import ValidationAr from '../ValidationAr.js';
import colors from '../../theme/colors';
import fontFamily from '../../theme/fontFamily';
import fontWeight from '../../theme/fontWeight';
import * as userActions from '../actions/userActions';
import { verticalScale, moderateScale, scale, ScaledSheet } from 'react-native-size-matters';
import { bindActionCreators } from 'redux';
const { width, height } = Dimensions.get('window');
import { connect } from 'react-redux';

class Profile2 extends Component {
	static navigatorStyle = {
		navBarHidden: true
	};
	constructor(props) {
		super(props);
		this.state = {
			social: string('Profile2.socialSelect'),
			handle: '',
			followers: '',
			visible: false,
			isDisabled: false
		};
	}

	componentDidMount() {
		NetInfo.getConnectionInfo().then(connectionInfo => {
			if (connectionInfo.type == 'none' || connectionInfo.type == 'unknown') {
				this.props.actions.checkInternet(false);
			} else {
				this.props.actions.checkInternet(true);
			}
		});
		NetInfo.isConnected.addEventListener('connectionChange', this._handleConnectionChange);
	}
	componentWillUnmount() {
		this.props.actions.ButtonDisabled(false);
		NetInfo.isConnected.removeEventListener('connectionChange', this._handleConnectionChange);
	}
	_handleConnectionChange = isConnected => {
		this.props.actions.checkInternet(isConnected);
	};

	back = () => {
		this.props.navigator.pop();
	};
	validationRules = () => {
		return [
			{
				field: this.state.handle,
				name: 'Account Name',
				rules: 'required|min:2|max:120'
			},
			{
				field: this.state.followers,
				name: 'Followers',
				rules: 'required|no_space'
			}
		];
	};
	validationArRules = () => {
		return [
			{
				field: this.state.handle,
				name: 'إسم المستخدم',
				rules: 'required|min:1|max:120'
			},
			{
				field: this.state.followers,
				name: 'متابعون',
				rules: 'required|no_space'
			}
		];
	};
	home = () => {
		let { actions } = this.props;
		let { social, handle, followers, isComplete } = this.state;
		let { lang, registerID } = this.props.user;
		let validation =
			lang == 'en'
				? Validation.validate(this.validationRules())
				: ValidationAr.validate(this.validationArRules());
		if (social == string('Profile2.socialSelect')) {
			Alert.alert(
				'',
				string('Profile2.SocialRequired'),
				[
					{
						text: string('globalValues.AlertOKBtn'),
						onPress: () => {}
					}
				],
				{ cancelable: false }
			);
		} else if (validation.length != 0) {
			return Alert.alert(
				'',
				validation[0],
				[
					{
						text: string('globalValues.AlertOKBtn'),
						onPress: () => {}
					}
				],
				{ cancelable: false }
			);
		} else if (!this.props.user.netStatus) {
			return Alert.alert(
				'',
				string('globalValues.NetAlert'),
				[
					{
						text: string('globalValues.AlertOKBtn'),
						onPress: () => {}
					}
				],
				{ cancelable: false }
			);
		} else {
			// this.getData();
			this.setState({ isDisabled: true, visible: true });
			let values = {
				socialPlatform: social,
				yourHandle: handle,
				followers: followers,
				talentId: registerID
			};
			console.log(values, 'val');
			return axios
				.post(`${Appurl.apiUrl}setupProfiletwo`, values)
				.then(response => {
					return this.getData(response, values);
				})
				.catch(error => {
					console.log(error.response.data.msg, 'msg');
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
				});
		}
	};
	getData = (response, values) => {
		let { visible } = this.state;
		this.setState({ isDisabled: false, visible: false });
		setTimeout(() => {
			Navigation.push(this.props.componentId, {
				component: {
					name: 'FamCamTalent.BankDetail',
					passProps: {
						signUp: true
					},
					options: {
						topBar: {
							visible: false
						}
					}
				}
			});
			// this.props.navigator.push({
			//   screen: 'FamCamTalent.BankDetail',
			//   passProps: { signUp: true }
			// })
		}, 1000);
	};
	selectdata = data => {
		this.setState({ social: data });
	};
	render() {
		let { social, visible, isDisabled } = this.state;
		let { textAlign, lang } = this.props.user;
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
				<View style={{ flex: 1, marginHorizontal: 24 }}>
					<Spinner
						visible={visible}
						color={colors.themeColor}
						tintColor={colors.themeColor}
						animation={'fade'}
						cancelable={false}
						textStyle={{ color: '#FFF' }}
					/>
					<View style={{ flex: 0.1, justifyContent: 'center' }}>
						<TouchableOpacity
							hitSlop={{ top: 7, bottom: 7, left: 7, right: 7 }}
							disabled={isDisabled}
							style={{ height: 20, width: 24, justifyContent: 'center' }}
							onPress={this.back}
						>
							<Image
								source={require('./../../images/ic_back.png')}
								style={{ tintColor: '#000000', height: 14, width: 18 }}
							/>
						</TouchableOpacity>
					</View>
					<View style={{ flex: 0.9 }}>
						<View style={{ flex: 0.08, justifyContent: 'flex-start' }}>
							<Text
								style={{
									color: '#000000',
									textAlign: textAlign,
									fontSize: 24,
									fontFamily: lang == 'en' ? 'SFProDisplay-Bold' : 'HelveticaNeueLTArabic-Bold'
								}}
							>
								{string('Profile2.profileText')}
							</Text>
						</View>
						<View style={{ flex: 0.55 }}>
							<View style={{ flex: 1 / 4 }}>
								<Dropdown
									label={string('Profile2.socialLabel')}
									labelFontSize={12}
									baseColor='black'
									itemTextStyle={{
										fontFamily: lang == 'en' ? 'SFUIText-Regular' : 'HelveticaNeueLTArabic-Light',
										textAlign: textAlign
									}}
									value={social}
									data={[
										{
											value: string('Profile2.social1')
										},
										{
											value: string('Profile2.social2')
										},
										{
											value: string('Profile2.social3')
										},
										{
											value: string('Profile2.social4')
										}
									]}
									textColor='#4A4A4A'
									underlineColorAndroid='transparent'
									dropdownPosition={-3.4}
									itemCount={4}
									onChangeText={val => this.selectdata(val)}
								/>
							</View>
							<View style={{ flex: 0.05 }}></View>
							<View style={{ flex: 1 / 4 }}>
								<View style={{ flex: 0.3 }}>
									<Text
										style={{
											color: '#000000',
											fontSize: 12,
											fontFamily:
												lang == 'en' ? 'SFProDisplay-Regular' : 'HelveticaNeueLTArabic-Light'
										}}
									>
										{string('Profile2.handleLabel')}
									</Text>
								</View>
								<View style={{ flex: 0.7 }}>
									<TextInput
										style={{
											flex: 1,
											fontSize: 14,
											borderBottomColor: '#E9EAED',
											borderBottomWidth: 1,
											textAlign: textAlign
										}}
										placeholder={string('Profile2.handlePlaceholder')}
										placeholderTextColor='#DADADA'
										underlineColorAndroid='transparent'
										returnKeyType='next'
										keyboardType='email-address'
										autoCorrect={false}
										autoCapitalize='none'
										onChangeText={text => this.setState({ handle: text.trim() })}
										onSubmitEditing={event => {
											this.refs.followersIn.focus();
										}}
									/>
								</View>
							</View>
							<View style={{ flex: 0.05 }}></View>
							<View style={{ flex: 1 / 4 }}>
								<View style={{ flex: 0.3 }}>
									<Text
										style={{
											color: '#000000',
											fontSize: 12,
											fontFamily:
												lang == 'en' ? 'SFProDisplay-Regular' : 'HelveticaNeueLTArabic-Light'
										}}
									>
										{string('Profile2.followersLabel')}
									</Text>
								</View>
								<View style={{ flex: 0.7 }}>
									<TextInput
										style={{
											flex: 1,
											fontSize: 14,
											borderBottomColor: '#E9EAED',
											borderBottomWidth: 1,
											textAlign: textAlign
                    }}
                    maxLength={10}
										ref='followersIn'
										placeholder={string('Profile2.followersPlaceholder')}
										placeholderTextColor='#DADADA'
										underlineColorAndroid='transparent'
										returnKeyType='done'
										returnKeyLabel='done'
										keyboardType='numeric'
										autoCorrect={false}
										autoCapitalize='none'
										onChangeText={text => {
                      text = text.replace(/[^0-9]/g, '');
                      // console.log(text,'====the value of text===')
											this.setState({ followers: text.trim() });
										}}
									/>
								</View>
							</View>
						</View>
						<TouchableOpacity style={styles.loginButton} onPress={() => this.home()}>
							<Text style={styles.loginButtonText}>{string('ProfileDiscover.Next')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile2);
const styles = ScaledSheet.create({
	loginButton: {
		bottom: '20@ms',
		position: 'absolute',
		height: '48@vs',
		width: width - 46,
		borderRadius: '2@ms',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.themeColor,
		alignSelf: 'center'
	},
	loginButtonText: {
		fontFamily: fontFamily.regular,
		textAlign: 'center',
		color: colors.white,
		fontSize: '16@ms',
		fontWeight: fontWeight.medium,
		fontFamily: fontFamily.mediumBold
	}
});
