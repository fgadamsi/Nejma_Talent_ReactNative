import { Navigation } from 'react-native-navigation';
import * as React from 'react';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import OTPScreen from './screens/OTPScreen';
import ProfileDiscover from './screens/ProfileDiscover';
import Profile1 from './screens/Profile1';
import Profile2 from './screens/Profile2';
import Home from './screens/Home';
import RejectReason from './screens/RejectReason';
import Profile from './screens/Profile';
import CameraScreen from './screens/CameraScreen';
import Settings from './screens/Settings';
import Thanks from './screens/Thanks';
import CategoryPrice from './screens/CategoryPrice';
import EditProfile from './screens/EditProfile';
import ChangePassword from './screens/ChangePassword';
import ChangePrice from './screens/ChangePrice';
import Language from './screens/Language';
import PrivacyPolicy from './screens/PrivacyPolicy';
import ContactUs from './screens/ContactUs';
import TermsOfService from './screens/TermsOfService';
import Preview from './screens/Preview';
import PlayVideo from './screens/PlayVideo';
import ChangeProfessions from './screens/ChangeProfessions';
import UploadVideo from './screens/UploadVideo';
import configureStore from './configureStore';
import { Provider } from 'react-redux';
const store = configureStore();
import BankDetail from './screens/BankDetail';

function ReduxProvider(Component) {
   

  return (props) => (
      <Provider store={store}>
          <Component {...props} />
      </Provider>
  );
}

export function registerScreens(store, Provider) {
  Navigation.registerComponent('FamCamTalent.Splash', () => ReduxProvider(Splash), () => Splash);
  Navigation.registerComponent('FamCamTalent.Profile1', () => ReduxProvider(Profile1), () => Profile1);
  Navigation.registerComponent('FamCamTalent.Profile2', () => ReduxProvider(Profile2), () => Profile2);
  Navigation.registerComponent('FamCamTalent.Login', () => ReduxProvider(Login), () => Login);
  Navigation.registerComponent('FamCamTalent.Register', () => ReduxProvider(Register), () => Register);
  Navigation.registerComponent('FamCamTalent.ForgotPassword', () => ReduxProvider(ForgotPassword), () => ForgotPassword);
  Navigation.registerComponent('FamCamTalent.ProfileDiscover', () => ReduxProvider(ProfileDiscover), () => ProfileDiscover);
  Navigation.registerComponent('FamCamTalent.Home', () => ReduxProvider(Home), () => Home);
  Navigation.registerComponent('FamCamTalent.RejectReason', () => ReduxProvider(RejectReason), () => RejectReason);
  Navigation.registerComponent('FamCamTalent.Profile', () => ReduxProvider(Profile), () => Profile);
  Navigation.registerComponent('FamCamTalent.CameraScreen', () => ReduxProvider(CameraScreen), () => CameraScreen);
  Navigation.registerComponent('FamCamTalent.Settings', () => ReduxProvider(Settings), () => Settings);
  Navigation.registerComponent('FamCamTalent.Thanks', () => ReduxProvider(Thanks), () => Thanks);
  Navigation.registerComponent('FamCamTalent.CategoryPrice', () => ReduxProvider(CategoryPrice), () => CategoryPrice);
  Navigation.registerComponent('FamCamTalent.EditProfile', () => ReduxProvider(EditProfile), () => EditProfile);
  Navigation.registerComponent('FamCamTalent.ChangePassword', () => ReduxProvider(ChangePassword), () => ChangePassword);
  Navigation.registerComponent('FamCamTalent.ChangePrice', () => ReduxProvider(ChangePrice), () => ChangePrice);
  Navigation.registerComponent('FamCamTalent.Language', () => ReduxProvider(Language), () => Language);
  Navigation.registerComponent('FamCamTalent.PrivacyPolicy', () => ReduxProvider(PrivacyPolicy), () => PrivacyPolicy);
  Navigation.registerComponent('FamCamTalent.ContactUs', () => ReduxProvider(ContactUs), () => ContactUs);
  Navigation.registerComponent('FamCamTalent.TermsOfService', () => ReduxProvider(TermsOfService), () => TermsOfService);
  Navigation.registerComponent('FamCamTalent.Preview', () => ReduxProvider(Preview), () => Preview);
  Navigation.registerComponent('FamCamTalent.PlayVideo', () => ReduxProvider(PlayVideo), () => PlayVideo);
  Navigation.registerComponent('FamCamTalent.ChangeProfessions', () => ReduxProvider(ChangeProfessions), () => ChangeProfessions);
  Navigation.registerComponent('FamCamTalent.UploadVideo', () => ReduxProvider(UploadVideo), () => UploadVideo);
  Navigation.registerComponent('FamCamTalent.BankDetail', () => ReduxProvider(BankDetail), () => BankDetail);
  Navigation.registerComponent('FamCamTalent.OTPScreen', () => ReduxProvider(OTPScreen), () => OTPScreen);
  
}
