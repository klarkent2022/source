import React, { Component } from 'react';
import { StatusBar,PermissionsAndroid } from 'react-native';
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
  FlatList,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from "react-native-geolocation-service";

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class SplashScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          location_id: null,
          locations: [],
          isLoading: true,
          new_splash: false,
        };
    }

    requestPermission = async () => { 

      console.log('request permission');

      try { 
        if (Platform.OS === "ios") { 
          return await Geolocation.requestAuthorization("always"); 
        } 
        // 안드로이드 위치 정보 수집 권한 요청 
        if (Platform.OS === "android") { 
          return await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, );
         } 
        } catch (e) { 
          console.log(e);
        } 
      }

    componentDidMount = () => {
        setTimeout(() => {
          
          console.log('change splash');
          this.setState({
            new_splash: true,
          });

        }, 1000);

        setTimeout(() => {
          
          NavigationService.navigate('HomeScreen', {
            screen: 'HomeScreen',
            info: 'information'
          });

        }, 2000);
     }
     
    getData = async (latitude1,longtitude1) => {
      //const loc_id = this.props.route.params.location_id;

      console.log('latitudelatitudelatitudelatitudelatitudelatitudelatitudelatitude');

      const data1 = { latitude: latitude1,//check this later for gps
                      longtitude: longtitude1//check this later for gps
        };

      return await fetch('http://10.0.2.2:3000' + '/api/chat/getPetPlaces', {
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
                this.setState({
                  locations: responseJson,
                  isLoading: false,
                });
                  })
          .catch((error) => {
            
            console.log(error.toString());
          });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <View style={styles.card}>
                
                {this.state.new_splash?<Image source={require('./assets/splash2.png')}  style={styles.input} />
                :<Image source={require('./assets/splash1.png')}  style={styles.input} />}

              </View>
            </SafeAreaView>
          );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffb61d',
    },
    contentTitle: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 12,
      fontWeight: 'bold',
      marginLeft: 10,
      marginTop: 10,
      marginBottom: 0,
      fontWeight: '100',
      textAlign: 'left',
      backgroundColor: '#ffffff',
    },
    contentTitle1_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 10,
      marginLeft: 10,
      marginBottom: 0,
      fontWeight: '100',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      width: win.width/5
    },
    contentTitle_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 10,
      marginLeft: 10,
      marginTop: 10,
      marginBottom: 0,
      fontWeight: '100',
      textAlign: 'left',
      backgroundColor: '#ffffff',
    },
    appTitle: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 26,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 30,
      fontWeight: '300',
      textAlign: 'left',
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
      marginTop : (1 / 4) * win.height,
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
      height : (169 / 751) * win.width,
      flexDirection: 'row',
    },
    menuItem1: {
      width : (35 / 751) * win.width,
      height : (35 / 751) * win.width,
      marginLeft : (60 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
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
    menuItem1_1: {
      width : (75 / 751) * win.width,
      height : (75 / 751) * win.width,
      marginLeft : (60 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
    },
    menuItem1_2: {
      width : (350 / 751) * win.width,
      height : (350 / 751) * win.width,
      marginLeft : (10 / 751) * win.width,
      marginTop : (10 / 751) * win.width,
    },
    menuItem1_3: {
      width : (50 / 751) * win.width,
      height : (50 / 751) * win.width,
      marginLeft : (10 / 751) * win.width,
      marginTop : (10 / 751) * win.width,
    },
    menuItem2: {
      width : (35 / 751) * win.width,
      height : (35 / 751) * win.width,
      marginLeft : (95 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
    },
    menuBgImage1: {
      flexDirection: 'row',
    },
    menuBgImage1_1: {
      width: win.width/5,
      marginLeft: 5
    },
  });

export default SplashScreen;  