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

class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          location_id: null,
          locations: [],
          isLoading: true,
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
      this.props.navigation.addListener('focus', () => {
          this.state.isLoading;
       });


       this.requestPermission().then(result => { 
        console.log({ result }); 
        if (result === "granted") { 
          Geolocation.getCurrentPosition( 
            pos => { 
              console.log("3==============");
              const {latitude, longitude} = pos.coords;
              
              console.log(latitude);
              console.log(longitude);

              this.getData(latitude,longitude);
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
                
                <TextInput style={styles.input} placeholder="장소,모임,피드,사용자 등을 검색해보세요!" />
        
        
                <ScrollView style={styles.containerSearch}>
                    <View>
                      <Text style={styles.appTitle}>카테고리 검색</Text>
                      <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}>
                           <View>
                             <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet-hotel.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>펫 호텔</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_cafe.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>카페</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>
                            
                            <View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_barber.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>미용</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_park.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>공원</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_restaurant.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>레스토랑</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_hospital.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>동물병원</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              
                              
                            </View>


                            <View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_essential.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>펫 용품</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_motel.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>펫 동반숙박</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_care.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>펫 동반 시설</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_trainer.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>아카데미</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_play.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>운동장</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                              <View>
                                <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                            screen: 'MapScreen',
                                            info: 'information'
                                        })} style={styles.menuBgImage1_1}>
                                  <Image source={require('./assets/pet_dead.png')}  style={styles.menuItem1_1} />
                                  <View>
                                    <Text style={styles.contentTitle1_1}>펫 장례</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            </View>

                      </ScrollView>
                    </View>

                    <View>
                      <Text style={styles.appTitle}>근처 핫플레이스</Text>
                      
                        <FlatList
                          horizontal
                          data={this.state.locations.info}
                          renderItem={({item}) => (
                              <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                          screen: 'MapScreen',
                                          info: 'information'
                                      })}>

                                {item.place_image == ''? <Image source={require('./assets/pet_care.png')}  style={styles.menuItem1_2}/> : <Image source={{uri:item.place_image}}  style={styles.menuItem1_2} /> }
                                <View style={styles.menuBgImage1} >
                                  {item.place_name == null? <Text></Text>: <Text style={styles.contentTitle}>{item.place_name}</Text> }
                                  <Text style={styles.contentTitle_1}>병원</Text>
                                  <Text style={styles.contentTitle_1}>~400m</Text>
                                </View>
                                <View style={styles.menuBgImage1} >
                                  <Image source={require('./assets/star.png')}  style={styles.menuItem1_3} />
                                  {item.place_review == null? <Text></Text>: <Text style={styles.contentTitle}>{item.place_review}</Text> }
                                </View>
                              </TouchableOpacity>
                        )}
                        //keyExtractor={(item) => item.status.toString()}
                        />
                        
                    </View>

                    
                    <View>
                      <Text style={styles.appTitle}>이런 장소는 어떠신가요?</Text>
                      <FlatList
                          horizontal
                          data={this.state.locations.info}
                          renderItem={({item}) => (
                              <TouchableOpacity onPress={()=>NavigationService.navigate('MapScreen', {
                                          screen: 'MapScreen',
                                          info: 'information'
                                      })}>

                                {item.place_image == ''? <Image source={require('./assets/pet_care.png')}  style={styles.menuItem1_2}/> : <Image source={{uri:item.place_image}}  style={styles.menuItem1_2} /> }
                                <View style={styles.menuBgImage1} >
                                  {item.place_name == null? <Text></Text>: <Text style={styles.contentTitle}>{item.place_name}</Text> }
                                  <Text style={styles.contentTitle_1}>병원</Text>
                                  <Text style={styles.contentTitle_1}>~400m</Text>
                                </View>
                                <View style={styles.menuBgImage1} >
                                  <Image source={require('./assets/star.png')}  style={styles.menuItem1_3} />
                                  {item.place_review == null? <Text></Text>: <Text style={styles.contentTitle}>{item.place_review}</Text> }
                                </View>
                              </TouchableOpacity>
                        )}
                        //keyExtractor={(item) => item.status.toString()}
                        />
                    </View>

                </ScrollView>
                
                <View style={styles.containerMenu}>
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
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
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
      fontSize: 7,
      fontWeight: 'bold',
      marginTop: 10,
      marginLeft: 0,
      marginBottom: 0,
      fontWeight: '100',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      width: win.width/7
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
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 10,
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
      marginLeft : (20 / 751) * win.width,
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
      width: win.width/7,
      marginLeft: 5
    },
  });

export default HomeScreen;  