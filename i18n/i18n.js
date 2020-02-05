import I18n from 'react-native-i18n';
import ReactNative from 'react-native';
import { AsyncStorage } from 'react-native';
import en from './en.json';
import ar from './ar.json';

I18n.fallbacks = true;

I18n.translations = {
  en,
  ar
};

const currentLocale = I18n.currentLocale();
export const isRTL = currentLocale.indexOf('ar') === 0;
ReactNative.I18nManager.allowRTL(isRTL);

export function string(name, params = {}) {
  return I18n.t(name, params);
}

export default I18n;
