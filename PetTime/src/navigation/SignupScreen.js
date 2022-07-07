





import React, { Component,useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Button,
  Dimensions,
  ToastAndroid
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { NaverLogin, getProfile } from "@react-native-seoul/naver-login";

import {appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';

import {
  KakaoOAuthToken,
  KakaoProfile,
  getProfile as getKakaoProfile,
  login,
  logout,
  unlink,
} from '@react-native-seoul/kakao-login';

const win = Dimensions.get('window');

import {NavigationService} from '../common';


const iosKeys = {
  kConsumerKey: "VC5CPfjRigclJV_TFACU",
  kConsumerSecret: "f7tLFw0AHn",
  kServiceAppName: "테스트앱(iOS)",
  kServiceAppUrlScheme: "testapp" // only for iOS
};

const androidKeys = {
  kConsumerKey: "e6YM2iPojP1k7wzXtenx",
  kConsumerSecret: "utgr1yME8d",
  kServiceAppName: "펫타임"
};


const signInWithKakao = async () => {
  let result = await login();
  console.log('result' + result);
};

const klogin = async () => {

  /*if (!KakaoLogins) {
    console.error("KakaoLogins Module is Not Linked");
  }
  
  let result = await KakaoLogins.login(); */
};

const naverLogin = props => {

  console.log('naverLogin_');
  return new Promise((resolve, reject) => {

    console.log('naverLogin1_');
    NaverLogin.login(props, (err, token) => {
      console.log('naverLogin2_');
      console.log(`\n\n  Token is fetched  :: ${token} \n\n`);
      if (err) {
        reject(err);
        return;
      }
      resolve(token);
      getUserProfile(); // <---- 요기 추가
    });
  });
};

const getUserProfile = async () => {
  const profileResult = await getProfile(naverToken.accessToken);
  if (profileResult.resultcode === "024") {
    Alert.alert("로그인 실패", profileResult.message);
    return;
  }
  console.log("profileResult", profileResult);
};

async function onAppleButtonPress() { 
  // Start the sign-in request 
  const appleAuthRequestResponse = await appleAuth.performRequest({ 
    requestedOperation: appleAuth.Operation.LOGIN, 
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME], 
  }); 
  
  // Ensure Apple returned a user identityToken 
  if (!appleAuthRequestResponse.identityToken) 
  { 
    throw 'Apple Sign-In failed - no identify token returned'; 
  } 
  
  // Create a Firebase credential from the response 
  const { identityToken, nonce } = appleAuthRequestResponse; 
  const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce); 
  
  // Sign the user in with the credential 
  return auth().signInWithCredential(appleCredential); 
}



async function onGoogleButtonPress() {

  //comment this later
  NavigationService.navigate('AddUserScreen', {
    screen: 'AddUserScreen',
    info: 'information',
    email: 'information'
  });
  return;
  //comment this later

  console.log('start signup');

  const { idToken } = await GoogleSignin.signIn();
  console.log(idToken);

  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const credentialPromise = auth().signInWithCredential(googleCredential);
  credentialPromise.then((credential) => {
    console.log(credential.additionalUserInfo.profile.email);
    checkLogin1(credential.additionalUserInfo.profile.email);
  });
}

checkLogin1 = async(check_email) => {
  console.log('check login1');
  console.log(check_email);
      const data1 = { email: check_email};

        return await fetch('http://49.247.37.15' + '/api/chat/checkLogin', {
          method: 'post',
          body: JSON.stringify(data1),
          'headers': {
              'Content-Type': 'application/json',
            },
        })
          .then((response) => {
            if (response.status === 200) {
              return response.json();
            } else if (response.status === 404) {
              console.log('Unable to locate location');
            } else {
              throw 'something went wrong';
            }
          })
          .then((responseJson) => {
                console.log(responseJson);
                console.log(responseJson.status);
                if(responseJson.status == 1)
                {
                  ToastAndroid.show('이미 등록된 회원입니다', ToastAndroid.SHORT);
                }
                else
                {
                  //check this later to go its page
                  NavigationService.navigate('AddUserScreen', {
                    screen: 'AddUserScreen',
                    info: 'information',
                    email: check_email
                  });
                }

                  })
          .catch((error) => {
            console.log(error.toString());
          });
};

function SignupScreen(){
    
  const [location, setLocation] = useState({latitude: 37.557536061234515, longitude: 126.98504279658052});
  const [show, setShow] = useState(true);
  const [locations, setLocationData] = useState([]);

  console.log("111==============" + locations);
  
  const showConfirmDialog = () => {
    return Alert.alert(
      "로그인이 필요한 서비스입니다",
      "로그인하시겠어요?",
      [
        // The "Yes" button
        {
          text: "네",
          onPress: () => {
            NavigationService.navigate('LoginScreen', {
              screen: 'LoginScreen',
              info: 'information'
            })
          },
        },
        // The "No" button
        // Does nothing but dismiss the dialog when tapped
        {
          text: "아니",
        },
      ]
    );
  };

  function showDetail()
  {
    setShow(false);
    console.log(show);
  }


  useEffect(() => {

    //check this later(현재 위치에 따라서 변하도록)

    console.log("2Signup==============");
    
    GoogleSignin.configure({
      webClientId:
        '132293262133-7v0k53iu41a1g66h9hgb79ok1gsplfnk.apps.googleusercontent.com',
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      accountName: '',
    });

  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        

        <ScrollView style={styles.containerSearch}>
            
            <Image source={require('./assets/splash3.png')}  style={styles.input} />
        <TouchableOpacity onPress={()=>naverLogin(androidKeys)}>
                <Image source={require('./assets/facebook.png')}  style={styles.menuItem2} />
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>signInWithKakao()}>
                <Image source={require('./assets/kakao.png')}  style={styles.menuItem2} />
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>onGoogleButtonPress()}>
                <Image source={require('./assets/google.png')}  style={styles.menuItem2} />
            </TouchableOpacity>


                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity onPress={()=>NavigationService.navigate('LoginScreen', {
                              screen: 'LoginScreen',
                              info: 'information'
                          })}>
                        <Image source={require('./assets/login.png')}  style={styles.menuItem22} />
                      </TouchableOpacity>
                    </View>

        </ScrollView>
        
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffb61d',
  },
  appTitle: {
    color: '#000',
    fontFamily: 'GodoM',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 0,
    fontWeight: '300',
    textAlign: 'left',
    backgroundColor: '#ffffff',
  },
  appTitle1: {
    color: '#000',
    fontFamily: 'GodoM',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 230,
    marginLeft: 0.22 * win.width,
    marginBottom: 0,
    fontWeight: '300',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffb61d',
    flex: 1,
    borderTopLeftRadius: 10, // to provide rounded corners
    borderTopRightRadius: 10, // to provide rounded corners
    marginLeft: 0,
    marginRight: 0,
  },
  input: {
    width : (1 / 2) * win.width,
    height : (1.31 / 2) * win.width,
    marginLeft : (1 / 4) * win.width,
    marginTop : (1 / 7) * win.height,
  },
  containerMenu: {
    flex : (169 / 751) * win.width / win.height,
  },
  containerSearch: {
    flex : 1,
    marginLeft: 10,
    marginRight: 10,
  },
  menuBgImage: {
    width : win.width,
    height : (450 / 751) * win.width,
    flexDirection: 'row',
  },
  menuItem1: {
    width : (1 / 10) * win.width,
    height : (1 / 15) * win.width,
    marginLeft : (30 / 751) * win.width,
    marginTop : 30,
  },
  menuItemTxt1: {
    width : (75 / 751) * win.width,
    height : (75 / 751) * win.width,
    marginLeft : (40 / 751) * win.width,
    marginTop : (10 / 751) * win.width,
    fontSize: 8,
    textAlign: 'center'
  },
  menuItemTxt2: {
    width : (75 / 751) * win.width,
    height : (75 / 751) * win.width,
    marginLeft : (75 / 751) * win.width,
    marginTop : (10 / 751) * win.width,
    fontSize: 8,
    textAlign: 'center'
  },
  menuItem2: {
    width : 0.8 * win.width,
    height : 0.118 * win.width,
    marginLeft : 0.1 * win.width,
    marginTop : (10 / 751) * win.width,
  },
  menuItem22: {
    width : 0.8 * win.width,
    height : 0.118 * win.width,
    marginLeft : 0.1 * win.width,
    marginTop : (100 / 751) * win.width,
  },

  menuItem23: {
    flexDirection: 'row',
  },
});


export default SignupScreen;  