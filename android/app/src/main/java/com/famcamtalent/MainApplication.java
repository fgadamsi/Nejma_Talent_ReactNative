package com.nejmatalent;

import com.facebook.react.ReactPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.imagepicker.ImagePickerPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.reactnativenavigation.NavigationApplication;
import java.util.Arrays;
import java.util.List;
import org.reactnative.camera.RNCameraPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; 
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import com.reactnativecommunity.art.ARTPackage;
public class MainApplication extends NavigationApplication {

     @Override
     public boolean isDebug() {
         // Make sure you are using BuildConfig from your own application
         return BuildConfig.DEBUG;
     }

     protected List<ReactPackage> getPackages() {
         // Add additional packages you require here
         // No need to add RnnPackage and MainReactPackage
         return Arrays.<ReactPackage>asList(
           new RNI18nPackage(),
            new RNFirebasePackage(),
             new RNCameraPackage(),
           new LinearGradientPackage(),
           new ImagePickerPackage(),
           new ReactVideoPackage(),
           new RNFetchBlobPackage(),
           new KCKeepAwakePackage(),
           new RNSpinkitPackage(),
           new FastImageViewPackage(),
           new NetInfoPackage(),
            new SplashScreenReactPackage(),
             new RNFirebaseMessagingPackage(),
              new RNFirebaseNotificationsPackage(),
             new FBSDKPackage(),
             new ARTPackage()
         );
     }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }
 }
