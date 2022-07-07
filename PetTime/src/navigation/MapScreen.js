import React, { Component, useState, useEffect } from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
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
  Pressable,
  Dimensions,
  Alert,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import MapView, {PROVIDER_GOOGLE, Marker}  from 'react-native-maps';
import { NavigationService } from '../common';
import Geolocation from "react-native-geolocation-service";

const win = Dimensions.get('window');
const show_detail = false;
var item1 = null;

  async function requestPermission() { 
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
    

  function MapScreen(){
    
    const [location, setLocation] = useState({latitude: 37.557536061234515, longitude: 126.98504279658052});
    const [show, setShow] = useState(true);
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [addMarker, setMarker] = useState(false);
    const [locations, setLocationData] = useState([]);
    const [locations1, setLocationData1] = useState([]);
    
    console.log("111==============" + locations);
    console.log("locations.length " + locations.length);

    if(show){
      /*var RandomNumber = Math.floor(Math.random() * locations.length);
      item1 = locations[RandomNumber];*/
    }
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

    async function DoAction()
    {
      const value = await AsyncStorage.getItem('@user_id');
      if(value == null)
      {
          showConfirmDialog();
      }
      else
      {

      }
      console.log("value" + value);
    }

    async function getData(index) { 

      setShow(true);
      setShow2(false);
      
      setTimeout(() => {
        console.log('index___---------' + index + locations1.length);
        item1 = locations1[index];
        console.log(item1);
        setShow2(true);  
      }, 500);

      /*console.log('index___' + index + locations1.length);
        item1 = locations1[index];
        console.log(item1);
        setShow2(true);  */
    }

    async function getData1(latitude1,longtitude1) { 
      
      console.log('latitudelatitudelatitudelatitudelatitudelatitudelatitudelatitude' + latitude1);

      const data1 = { latitude: latitude1,//check this later for gps
        longtitude: longtitude1//check this later for gps
      };

      return await fetch('http://49.247.37.15' + '/api/chat/getPetPlaces', {
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
                
                setLocationData1(responseJson.info);
                
                  })
          .catch((error) => {
            console.log(error.toString());
          });
    }

    function ListMarkers() {

      console.log('locations.length' + locations.length);
      return locations1.map((data, i) => {


        return (
          <Marker 
            key={i}
            coordinate = {{latitude: data.place_lat,longitude: data.place_lng}}
            onPress={() => getData(i)}
            pinColor='#FFC033'
            description={"description"}/>
        )}
      )};

    useEffect(() => {

      //check this later(현재 위치에 따라서 변하도록)

      console.log("2==============");
      

      requestPermission().then(result => { 
        console.log({ result }); 
        if (result === "granted") { 
          Geolocation.getCurrentPosition( 
            pos => { 
              console.log("3==============//////////////////////");
              const {latitude, longitude} = pos.coords;
              
              //check this later for gps
              setLocation({
                latitude:latitude,
                longitude:longitude,
              });

              console.log(latitude);
              console.log(longitude);

              console.log(location.latitude);
              console.log(location.longitude);

              setShow1(true);

              getData1(latitude, longitude);
            }, 
            error => { 
              console.log("4==============");
              console.log(error); 
            }, 
            { 
              enableHighAccuracy: true, 
              timeout: 36000, 
              maximumAge: 36000, 
            }, 
            ); 
          } 
        });


    }, []);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>

          {show1?
          <View style={{ flex: 1.1 }}>
            <MapView 
            style={show2?{ flex: show?0.7:0.3 }:{ flex: 1 }}
            provider={PROVIDER_GOOGLE} 
            initialRegion={{ 
              latitude: location.latitude, 
              longitude: location.longitude,
              latitudeDelta: 0.0922, 
              longitudeDelta: 0.0421, 
            }} 
            >
              
              <Marker coordinate = {{latitude: location.latitude,longitude: location.longitude}}
              pinColor='#FF0000'
              description={"description"}/>

              {ListMarkers()}

            </MapView> 
                
            <View style={show2?{ flex: show?0.3:0.7 }:{ flex: 0 }}>
                    {show2?
                      show?
                      <View>
                          <Pressable style={styles.menuBgImage1}>
                            {item1.place_image == ''?<Image source={require('./assets/pet_care.png')}  style={styles.menuItem1_1} />
                                                  :<Image source={{uri:item1.place_image}}  style={styles.menuItem1_1} />}
                            <View>
                              <Text style={styles.menuItem1_3}>{item1.place_name}</Text>
                              <View style={styles.menuItem1_4} >
                                <Image source={require('./assets/star.png')} />
                                {item1.place_review == null? <Text></Text>: <Text>{item1.place_review}</Text> }
                              </View>
                              {item1.place_addr.length<15?<Text style={styles.menuItem1_5}>{item1.place_addr}</Text>
                              :<Text style={styles.menuItem1_5}>{item1.place_addr.substring(0,15)}</Text>
                              }
                              <Pressable style={styles.menuItem1_6}  onPress={() => showDetail()}>
                                <Text style={styles.menuItem1_7}>자세히 보기</Text>
                              </Pressable>
                            </View>
                          </Pressable>
                      </View>
                      :
                      <View>
                          <Pressable style={styles.menuBgImage12}>
                            {item1.place_image == ''?<Image source={require('./assets/pet_care.png')}  style={styles.menuItem1_12} />
                                                    :<Image source={{uri:item1.place_image}}  style={styles.menuItem1_12} />}
                            <View>
                              <Text style={styles.menuItem1_32}>{item1.place_name}</Text>
                              <View style={styles.menuItem1_42} >
                                <Image source={require('./assets/star.png')} />
                                {item1.place_review == null? <Text></Text>: <Text style={{color: 'black'}}>{item1.place_review}</Text> }
                              </View>
                              <Text style={styles.menuItem1_52}>{item1.place_addr}</Text>
                              <Pressable style={styles.menuItem1_62}  onPress={() => showDetail()}>
                                <Text style={styles.menuItem1_7}>전화걸기</Text>
                              </Pressable>
                              <Pressable style={styles.menuItem1_62}  onPress={() => DoAction()}>
                                <Text style={styles.menuItem1_7}>예약하기</Text>
                              </Pressable>
                            </View>
                          </Pressable>
                      </View>
                            :<View></View>}
            </View>
        
          </View>:
          <View style={{ flex: 1.1 }}></View>
          } 

          <View style={show2?{ flex: (169 / 751) * win.width / win.height }:{ flex: (169 / 751) * win.width / win.height }}>
              <ImageBackground source={require('./assets/menu_back.png')} style={styles.menuBgImage}>
                   <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetActivityScreen', {
                                    screen: 'PetActivityScreen',
                                    info: 'information'
                                })}>
                          <Image source={require('./assets/menu1.png')}  style={styles.menuItem1} />
                          <Text style={styles.menuItemTxt1}>액티비티</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetVillageScreen', {
                                      screen: 'PetVillageScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu2.png')}  style={styles.menuItem2} />
                            <Text style={styles.menuItemTxt2}>동네모임</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('HomeScreen', {
                                screen: 'HomeScreen',
                                info: 'information'
                            })}>
                            <Image source={require('./assets/menu3_sel.png')}  style={styles.menuItem2} />
                            <Text style={styles.menuItemTxt2}>메인</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetVillageFeedScreen', {
                                      screen: 'PetVillageFeedScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu4.png')}  style={styles.menuItem2} />
                            <Text style={styles.menuItemTxt2}>동네피드</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('MyInfoScreen', {
                                      screen: 'MyInfoScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu5.png')}  style={styles.menuItem2} />
                            <Text style={styles.menuItemTxt2}>프로필</Text>
                        </TouchableOpacity>
                      </View>
              </ImageBackground>
  
          </View>

        </View>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      backgroundColor: '#ffffff',
      flex: 1,
      borderTopLeftRadius: 10, // to provide rounded corners
      borderTopRightRadius: 10, // to provide rounded corners
      marginLeft: 0,
      marginRight: 0,
    },
    input: {
      flex : 0.1,
      padding: 5,
      borderBottomColor: '#bbb',
      borderBottomWidth: 1,
      fontFamily: 'GodoM',
      fontSize: 14,
      marginLeft: 10,
      marginRight: 10,
      textAlignVertical: "bottom",
    },
    containerMenu: {
      flex : (169 / 751) * win.width / win.height,
    },
    containerMenu1: {
      flex : 0,
    },
    containerMenu2: {
      flex : (569 / 751) * win.width / win.height,
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
    menuBgImage1: {
      width : win.width,
      height : 0.3 * win.height,
      borderRadius: 10,
      flexDirection: 'row',
    },
    menuBgImage12: {
      width : win.width,
      height : 0.7 * win.height,
      borderRadius: 10,
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
      width : 0.3 * win.width,
      height : 0.3 * win.width,
      marginLeft : 0.125 * win.width,
      marginTop : 0.04 * win.height,
    },
    menuItem1_12: {
      width : 0.4 * win.width,
      height : 0.4 * win.width,
      marginLeft : 0.3 * win.width,
      marginTop : 0.02 * win.height,
    },
    menuItem1_3: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.04 * win.height,
    },
    menuItem1_4: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.01 * win.height,
      flexDirection: 'row',
    },
    menuItem1_5: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.01 * win.height,
      fontFamily: 'GodoM',
      fontSize: 11,
    },
    menuItem1_32: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.03 * win.height,
      color: 'black',
    },
    menuItem1_42: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.02 * win.height,
      flexDirection: 'row',
      color: 'black',
    },
    menuItem1_52: {
      marginLeft : 0.05 * win.width,
      marginTop : 0.01 * win.height,
      fontFamily: 'GodoM',
      fontSize: 11,
      color: 'black',
    },


    menuItem1_6: {
      width: 0.4*win.width,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: '#ffc033',
      marginLeft: 30,
      marginTop: 8,
    },

    menuItem1_62: {

      width: 0.85*win.width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: '#ffc033',
      marginLeft: 20,
      marginTop: 18,
    },

    menuItem1_7: {
      fontFamily: 'GodoM',
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
    },
    menuItem2: {
      width : (35 / 751) * win.width,
      height : (35 / 751) * win.width,
      marginLeft : (95 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
    },

    menuItem1_2: {
      width : (350 / 751) * win.width,
      height : (350 / 751) * win.width,
      marginLeft : (10 / 751) * win.width,
      marginTop : (10 / 751) * win.width,
    },
  });

export default MapScreen;  