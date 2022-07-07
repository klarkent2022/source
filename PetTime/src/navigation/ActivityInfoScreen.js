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
  Pressable,
  Button,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import AsyncStorage from '@react-native-community/async-storage';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class ActivityInfoScreen extends Component {
    constructor(props) {
        super(props);
    }

    GoChat = async () => {

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

      var activity_name = this.props.navigation.getParam('activity_name');

      NavigationService.navigate('ActivityChatScreen', {
        screen: 'ActivityChatScreen',
        info: 'information',
        activity_image: this.props.navigation.getParam('activity_image'),
        activity_name: this.props.navigation.getParam('activity_name'),
        activity_price: this.props.navigation.getParam('activity_price'),
        activity_village: this.props.navigation.getParam('activity_village'),
        activity_num: this.props.navigation.getParam('activity_num'),
        activity_intro: this.props.navigation.getParam('activity_intro'),
        activity_cafeful: this.props.navigation.getParam('activity_cafeful'),
        activity_id: this.props.navigation.getParam('activity_id')
      });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <View style={styles.card}>
                
                <View style={styles.menuBgImage}>
                    <TouchableOpacity onPress={()=> NavigationService.back()}>
                        <Image source={require('./assets/back.png')}  style={styles.menuItem1} />
                    </TouchableOpacity>
                  <Text style={styles.appTitle1_1}>동네 액티비티</Text>
                </View>
        
                <ScrollView style={styles.containerSearch}>

                    <TouchableOpacity onPress={()=>NavigationService.navigate('RegisterAccScreen1', {
                              screen: 'RegisterAccScreen1',
                              info: 'information'
                          })}>
                        <Image source={{uri:this.props.navigation.getParam('activity_image')}}  style={styles.avatar} />
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.appTitle}>{this.props.navigation.getParam('activity_name')}</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>₩{this.props.navigation.getParam('activity_price')}</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>{this.props.navigation.getParam('activity_village')}</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>{this.props.navigation.getParam('activity_num')}명</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>액티비티 설명</Text>
                      <TextInput style={styles.input} value={this.props.navigation.getParam('activity_intro')} placeholder="액티비티 설명" />
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>유의 사항</Text>
                      <TextInput style={styles.input} value={this.props.navigation.getParam('activity_careful')} placeholder="유의 사항" />
                    </View>

                                    <Pressable style={styles.menuItem1_6}  onPress={this.GoChat}>
                                      <Text style={styles.menuItem1_7}>참여 문의</Text>
                                    </Pressable>
                </ScrollView>
                
                <View style={styles.containerMenu}>
                    <ImageBackground source={require('./assets/menu_back1.png')} style={styles.menuBgImage_1}>
                      <View>
                        <TouchableOpacity onPress={()=>NavigationService.navigate('PetActivityScreen', {
                                    screen: 'PetActivityScreen',
                                    info: 'information'
                                })}>
                          <Image source={require('./assets/menu1_sel.png')}  style={styles.menuItem1_1} />
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
                            <Image source={require('./assets/menu5.png')}  style={styles.menuItem2_1} />
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
    appTitle1_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 30,
      marginLeft: 10,
      marginBottom: 0,
      width: win.width * 0.7,
      textAlign: 'center',
      backgroundColor: '#ffffff',
    },
    appTitle1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: 15,
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
      width : (1 / 10) * win.width,
      height : (1 / 15) * win.width,
      marginLeft : (30 / 751) * win.width,
      marginTop : 30,
    },
    menuItem2: {
      width : (1 / 3) * win.width,
      height : (1 / 15) * win.width,
      marginLeft : (1 / 12) * win.width,
      marginTop : (70 / 751) * win.width,
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
    avatar: {
      width : (1 / 2) * win.width - 10,
      height : (1 / 2) * win.width,
      marginLeft : (1 / 4) * win.width,
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
    menuItem1_7: {
      fontFamily: 'GodoM',
      fontSize: 10,
      lineHeight: 21,
      fontWeight: 'bold',
      textAlign: 'center',
      textAlignVertical: 'center',
      width: 150,
      height: 45,
      letterSpacing: 0.25,
      color: 'white',
    },
  });

export default ActivityInfoScreen;  