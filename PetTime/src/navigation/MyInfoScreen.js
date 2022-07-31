import React, { Component } from 'react';
import {  StatusBar, ToastAndroid } from 'react-native';
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
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class MyInfoScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          location_id: null,
          locations: [],
          isLoading: true,
        };
    }

    DoOperation1 = async () => {

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
      else
      {

      }
      console.log("value" + value);

      NavigationService.navigate('UpdateUserScreen', {
        screen: 'UpdateUserScreen',
        info: 'information'
      });
    }

    DoOperation2 = async () => {

      //comment this later
      /*NavigationService.navigate('ActivityChatScreen', {
        screen: 'ActivityChatScreen',
        info: 'information',
        activity_image: '1',
        activity_name: '1',
        activity_price: '1',
        activity_village: '1',
        activity_num: '1',
        activity_intro: '1',
        activity_cafeful: '1',
        activity_id: '1'
      });*/

      /*NavigationService.navigate('CreateActivityScreen', {
        screen: 'CreateActivityScreen',
        info: 'information'
      });*/

      /*NavigationService.navigate('ActivityInfoScreen', {
        screen: 'ActivityInfoScreen',
        info: 'information',
        activity_image: '1',
        activity_name: '1',
        activity_price: '1',
        activity_village: '1',
        activity_num: '1',
        activity_intro: '1',
        activity_cafeful: '1'
    });*/

      /*NavigationService.navigate('MeetInfoScreen', {
                              screen: 'MeetInfoScreen',
                              info: 'information',
                              meet_image: '1',
                              meet_name: '1',
                              meet_num: '1',
                              meet_village: '1',
                              meet_intro: '1',
                              meet_careful: '1'
                          });*/

      /*NavigationService.navigate('FeedInfoScreen', {
                                      screen: 'FeedInfoScreen',
                                      info: 'information',
                                      feed_image: '1',
                                      feed_name: '1',
                                      feed_date: '1'
                                  });*/

      /*NavigationService.navigate('CreateFeedScreen', {
        screen: 'CreateFeedScreen',
        info: 'information'
      });*/

      /*NavigationService.navigate('CreateMeetScreen', {
        screen: 'CreateMeetScreen',
        info: 'information'
      });

      return;*/
      //comment this later

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
      else
      {

      }
      console.log("value" + value);

      NavigationService.navigate('MyInterestScreen', {
        screen: 'MyInterestScreen',
        info: 'information',
        level: '내 관심목록'
      });
    }
    
    DoOperation3 = async () => {

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
      else
      {

      }
      console.log("value" + value);

      NavigationService.navigate('MyInterestScreen', {
        screen: 'MyInterestScreen',
        info: 'information',
        level: '최근 조회 액티비티/모임'
      });
    }

    DoOperation4 = async () => {

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
      else
      {

      }
      console.log("value" + value);

    }

    DoOperation5 = async () => {

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
      else
      {

      }
      console.log("valuesss" + value);

      NavigationService.navigate('UpdateCardScreen', {
        screen: 'UpdateCardScreen',
        info: 'information'
      });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <View style={styles.card}>
                
                <View style={styles.menuBgImage}>
                    
                </View>
        
                <ScrollView style={styles.containerSearch}>

                    <TouchableOpacity onPress={()=>NavigationService.navigate('RegisterAccScreen1', {
                              screen: 'RegisterAccScreen1',
                              info: 'information'
                          })}>
                        <Image source={require('./assets/no_avatar.png')}  style={styles.avatar} />
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.appTitle}>설정</Text>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation1}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation1}>
                        <Text style={styles.input3}>정보 수정하기</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation2}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation2}>
                        <Text style={styles.input3}>내 관심목록</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation3}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation3}>
                        <Text style={styles.input3}>최근 조회 액티비티/모임</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation4}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation4}>
                        <Text style={styles.input3}>예약 기록</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation5}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation5}>
                        <Text style={styles.input2}>계좌 정보 등록 및 자주 쓰는 카드 등록</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.input1}>
                      <TouchableOpacity onPress={this.DoOperation4}>
                        <Image source={require('./assets/btn_back22.png')}  style={styles.input} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.DoOperation4}>
                        <Text style={styles.input2}>알림 및 광고 설정(차단)</Text>
                      </TouchableOpacity>
                    </View>
                </ScrollView>
                
                <View style={styles.containerMenu}>
                    <ImageBackground source={require('./assets/menu_back4.png')} style={styles.menuBgImage_1}>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetActivityScreen', {
                                    screen: 'PetActivityScreen',
                                    info: 'information'
                                })}>
                          <Image source={require('./assets/menu1.png')}  style={styles.menuItem1_1} />
                          <Text style={styles.menuItemTxt1}>액티비티</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetVillageScreen', {
                                      screen: 'PetVillageScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu2.png')}  style={styles.menuItem2_1} />
                            <Text style={styles.menuItemTxt2}>동네모임</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('HomeScreen', {
                                screen: 'HomeScreen',
                                info: 'information'
                            })}>
                            <Image source={require('./assets/menu3.png')}  style={styles.menuItem2_1} />
                            <Text style={styles.menuItemTxt2}>메인</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetVillageFeedScreen', {
                                      screen: 'PetVillageFeedScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu4.png')}  style={styles.menuItem2_1} />
                            <Text style={styles.menuItemTxt2}>동네피드</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('MyInfoScreen', {
                                      screen: 'MyInfoScreen',
                                      info: 'information'
                                  })}>
                            <Image source={require('./assets/menu5_sel.png')}  style={styles.menuItem2_1} />
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
    appTitle: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
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
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
      marginTop: 30,
      marginBottom: 0,
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
      flex : 1,
      width: win.width,
      height: win.height / 15,
      padding: 0,
      marginLeft: 0,
      marginRight: 0
    },
    input1: {
      marginTop: 5,
      flexDirection: 'row'
    },
    input2: {
      marginLeft : -win.width + 10,
      marginTop : 15,
      textAlignVertical: 'center',
      fontWeight: 'bold',
      fontFamily: 'GodoM',
      fontSize: 14,
    },
    
    input3: {
      marginLeft : -win.width + 10,
      marginTop : 15,
      textAlignVertical: 'center',
      fontFamily: 'GodoM',
      fontWeight: 'normal',
      fontSize: 14,
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
      width : (1 / 3) * win.width,
      height : (1 / 15) * win.width,
      marginLeft : (1 / 12) * win.width,
      marginTop : (70 / 751) * win.width,
    },
    avatar: {
      width : (1 / 3) * win.width,
      height : (1 / 3) * win.width,
      marginLeft : (1 / 3) * win.width,
      marginTop : (10 / 751) * win.width,
    },

    menuItem2_1: {
      width : (35 / 751) * win.width,
      height : (35 / 751) * win.width,
      marginLeft : (95 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
    },
    menuItem1_1: {
      width : (35 / 751) * win.width,
      height : (35 / 751) * win.width,
      marginLeft : (60 / 751) * win.width,
      marginTop : (30 / 751) * win.width,
    },
    menuBgImage_1: {
      width : win.width,
      height : (169 / 751) * win.width,
      flexDirection: 'row',
    },

  });

export default MyInfoScreen;  