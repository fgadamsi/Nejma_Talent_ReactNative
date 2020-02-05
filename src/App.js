import { Navigation } from 'react-native-navigation';
import {AsyncStorage} from 'react-native';
import { registerScreens } from './registerScreens';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import SplashScreen from "react-native-splash-screen";
import firebase from 'react-native-firebase';
const store = configureStore();
// alert("hiiii")
setTimeout(() => {
  SplashScreen.hide();
}, 3000);
registerScreens(store, Provider);
//asking for firebase permissions
firebase.messaging().requestPermission()
.then(() => {
  firebase.messaging().hasPermission()
.then(enabled => {
if (enabled) {
firebase.messaging().getToken().then((token) => {
  this._onChangeToken(token)
 });
 firebase.notifications().onNotification(notification => {
  notification.android.setChannelId('insider').setSound('default')
  firebase.notifications().displayNotification(notification)
});
  } else {
    // user doesn't have permission
  } 
  });
})
.catch(error => {
  // User has rejected permissions  
});

// AsyncStorage.setItem('talent', "");
//  AsyncStorage.setItem('isOnline', "")
try{
  AsyncStorage.getItem('talent')
  .then((talent) => {
    if(talent != null) {
      // Navigation.startSingleScreenApp({
      //   screen: {
      //     screen: 'FamCamTalent.Home'
      //   },
      //   appStyle: {
      //     orientation: 'portrait'
      //   }
      // });
      // Navigation.events().registerAppLaunchedListener(() => {
         Navigation.setRoot({
                  root: {
                
                    stack: {
                      children: [
                        {
                          component: {
                            name: 'FamCamTalent.Home'
                          }
                        }
                      ],
                      options: {
                        topBar: {
                        visible: false
                        }
                      }
                    }
                  }
                });
             
      // });
    }
    else {
     // alert("this one")
     Navigation.setRoot({
      root: {
    
        stack: {
          children: [
            {
              component: {
                name: 'FamCamTalent.Splash'
              }
            }
          ],
          options: {
            topBar: {
            visible: false
            }
          }
        }
      }
    });
      
      //  Navigation.setRoot({
      //     root: {
      //       component: {
      //         name: 'FamCamTalent.Splash'
      //       }
      //     },
      //   });
    // });
      // Navigation.startSingleScreenApp({
      //   screen: {
      //     screen: 'FamCamTalent.Splash',
      //   },
      //   appStyle: {
      //     orientation: 'portrait'
      //   }
      // })
    }
  })
}
catch(error){}

_onChangeToken = (token) => {
  console.log(token, 'token')
 // AsyncStorage.setItem('fcmToken', token);
}
