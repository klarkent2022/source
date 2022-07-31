import React, { Component } from 'react';
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
  Pressable,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class PetActivityScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          location_id: null,
          locations: [],
          isLoading: true,
        };
    }

    componentDidMount = () => {
      this.props.navigation.addListener('focus', () => {
          this.getData();
       });
        this.getData();
     }
     
     createActivity = async() => {

      const value = await AsyncStorage.getItem('@user_id');
      if(value == null)
      {
        Alert.alert(
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
        return;
      }

        NavigationService.navigate('CreateActivityScreen', {
          screen: 'CreateActivityScreen',
          info: 'information'
        });
     }

    getData = async () => {
      //const loc_id = this.props.route.params.location_id;
      return await fetch('http://10.0.2.2:3000' + '/api/chat/getPetActivities', {
          method: 'post',
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
                
                <TextInput style={styles.input} placeholder="액티비티를 검색해보세요!" />
        
        
                <ScrollView style={styles.containerSearch}>
                    
                    <View>
                      <Text style={styles.appTitle}>Best 추천</Text>
                      <FlatList 
                            horizontal
                            data={this.state.locations.info}
                            renderItem={({item}) => (
                                  <TouchableOpacity onPress={()=>NavigationService.navigate('ActivityInfoScreen', {
                                              screen: 'ActivityInfoScreen',
                                              info: 'information',
                                              activity_image: item.activity_image,
                                              activity_name: item.activity_name,
                                              activity_price: item.activity_price,
                                              activity_village: item.activity_village,
                                              activity_num: item.activity_num,
                                              activity_intro: item.activity_intro,
                                              activity_careful: item.activity_careful,
                                              activity_id: item.id
                                          })}>

                                    {item.activity_image == null? <Text></Text>: <Image source={{uri:item.activity_image}}  style={styles.menuItem1_2} /> }
                                    <View style={styles.menuBgImage1} >
                                      {item.activity_name == null? <Text></Text>: <Text style={styles.contentTitle}>{item.activity_name}</Text> }
                                    </View>
                                    <View style={styles.menuBgImage1} >
                                      <Text style={styles.contentTitle_1}>인원</Text>
                                      <Text style={styles.contentTitle_1}>{item.activity_num}</Text>
                                    </View>
                                    <View style={styles.menuBgImage1} >
                                      <Text style={styles.contentTitle_1}>가격</Text>
                                      <Text style={styles.contentTitle_1}>₩{item.activity_price}</Text>
                                    </View>
                                  </TouchableOpacity>
                                
                          )}
                        />
                    </View>

                    
                    <View>
                      <Text style={styles.appTitle}>동네 액티비티</Text>
                      <FlatList 
                            horizontal
                            data={this.state.locations.info}
                            renderItem={({item}) => (
                                  <TouchableOpacity onPress={()=>NavigationService.navigate('ActivityInfoScreen', {
                                              screen: 'ActivityInfoScreen',
                                              info: 'information',
                                              activity_image: item.activity_image,
                                              activity_name: item.activity_name,
                                              activity_price: item.activity_price,
                                              activity_village: item.activity_village,
                                              activity_num: item.activity_num,
                                              activity_intro: item.activity_intro,
                                              activity_careful: item.activity_careful,
                                              activity_id: item.id
                                          })}>

                                    {item.activity_image == null? <Text></Text>: <Image source={{uri:item.activity_image}}  style={styles.menuItem1_2} /> }
                                    <View style={styles.menuBgImage1} >
                                      {item.activity_name == null? <Text></Text>: <Text style={styles.contentTitle}>{item.activity_name}</Text> }
                                    </View>
                                    <View style={styles.menuBgImage1} >
                                      <Text style={styles.contentTitle_1}>인원</Text>
                                      <Text style={styles.contentTitle_1}>{item.activity_num}</Text>
                                    </View>
                                    <View style={styles.menuBgImage1} >
                                      <Text style={styles.contentTitle_1}>가격</Text>
                                      <Text style={styles.contentTitle_1}>₩{item.activity_price}</Text>
                                    </View>
                                  </TouchableOpacity>
                                
                          )}
                        />
                    </View>

                                    <Pressable style={styles.menuItem1_6}  onPress={() => this.createActivity()}>
                                      <Text style={styles.menuItem1_7}>액티비티 추가</Text>
                                    </Pressable>
                </ScrollView>
                
                <View style={styles.containerMenu}>
                    <ImageBackground source={require('./assets/menu_back1.png')} style={styles.menuBgImage}>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetActivityScreen', {
                                    screen: 'PetActivityScreen',
                                    info: 'information'
                                })}>
                          <Image source={require('./assets/menu1_sel.png')}  style={styles.menuItem1} />
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
                            <Image source={require('./assets/menu3.png')}  style={styles.menuItem2} />
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
      fontSize: 15,
      fontWeight: 'bold',
      marginLeft: 10,
      marginTop: 10,
      marginBottom: 0,
      fontWeight: '100',
      textAlign: 'left',
      backgroundColor: '#ffffff',
    },
    contentTitle_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 12,
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

    menuItem1_6: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 10,
      elevation: 3,
      backgroundColor: '#ffb61d',
      width: 150,
      height: 45,
      marginLeft: win.width * 0.5,
      marginTop: 8,
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

    menuItem1_7: {
      fontFamily: 'GodoM',
      fontSize: 10,
      fontWeight: 'bold',
      width: 150,
      height: 45,
      textAlign: 'center',
      textAlignVertical: 'center',
      letterSpacing: 0.25,
      color: 'white'
    },
  });

export default PetActivityScreen;  