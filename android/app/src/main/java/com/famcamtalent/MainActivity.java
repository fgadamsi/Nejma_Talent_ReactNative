package com.nejmatalent;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.view.Gravity;
import com.facebook.react.ReactActivity;
import com.reactnativenavigation.NavigationActivity;

import org.devio.rn.splashscreen.SplashScreen;
 public class MainActivity extends  NavigationActivity{
    @Override
  protected void onCreate(Bundle savedInstanceState) {
     SplashScreen.show(this); 
      super.onCreate(savedInstanceState);
  }
 }
