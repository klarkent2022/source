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
  Dimensions,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class MeetInfoScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          chatting_content: '',
          value: 0,
          page_no : 1
        };
    }

    doChat = async() => {

      if(this.state.chatting_content == '' || this.state.chatting_content == null || this.state.chatting_content == undefined)
      {
        return;
      }

      const value = await AsyncStorage.getItem('@user_id');
      console.log(this.state.chatting_content);
      console.log(value);
      console.log(this.props.navigation.getParam('meet_id'));
      
        var formData = new FormData();
        formData.append('activity_id', this.props.navigation.getParam('meet_id'));
        formData.append('chatting_content', this.state.chatting_content);
        formData.append("creator_id", value);

        const data1 = { activity_id: this.props.navigation.getParam('meet_id'),
          chatting_content: this.state.chatting_content,
          creator_id: value
        };

        return await fetch('http://10.0.2.2:3000' + '/api/chat/AddChatting2', {
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
                
                this.setState({chatting_content: ''});
                this.getData();
                  })
          .catch((error) => {
            
            console.log(error.toString());
          });

    };

    componentDidMount = () => {
      this.props.navigation.addListener('focus', () => {
          this.getData();
       });
        this.getData();
     }

    getData = async () => {

      const value = await AsyncStorage.getItem('@user_id');
      this.setState({
        value: value
      });

      const data1 = { meet_id: this.props.navigation.getParam('meet_id')
        };
      //const loc_id = this.props.route.params.location_id;
      return await fetch(`http://10.0.2.2:3000/api/chat/getPetChatting2`, {
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
                  locations: responseJson
                });
                  })
          .catch((error) => {
            console.log(error.toString());
          });
    }

    doChat1 = async() => {

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

      this.setState({page_no: 2});
    };

    

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <View style={styles.card}>
                
                <View style={styles.menuBgImage}>
                    <TouchableOpacity onPress={()=> NavigationService.back()}>
                        <Image source={require('./assets/back.png')}  style={styles.menuItem1} />
                    </TouchableOpacity>
                  <Text style={styles.appTitle1_111}>동네 모임</Text>
                </View>
        
                {this.state.page_no == 1 ?
                  <View style={styles.menuBgImage111}>
                      <TouchableOpacity onPress={()=> {this.setState({page_no: 1})}}>
                        <Text style={styles.appTitle1_1}>정보</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.doChat1}>
                        <Text style={styles.appTitle1_2}>채팅</Text>
                      </TouchableOpacity>
                    </View>
                    :
                    <View style={styles.menuBgImage111}>
                      <TouchableOpacity onPress={()=> {this.setState({page_no: 1})}}>
                        <Text style={styles.appTitle1_2}>정보</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={this.doChat1}>
                        <Text style={styles.appTitle1_1}>채팅</Text>
                      </TouchableOpacity>
                    </View>
                }


                {this.state.page_no == 1 ?
                <ScrollView style={styles.containerSearch}>
                    

                    <TouchableOpacity onPress={()=>NavigationService.navigate('RegisterAccScreen1', {
                              screen: 'RegisterAccScreen1',
                              info: 'information'
                          })}>
                        <Image source={{uri:this.props.navigation.getParam('meet_image')}}  style={styles.avatar} />
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.appTitle}>{this.props.navigation.getParam('meet_name')}</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>{this.props.navigation.getParam('meet_village')}</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>모임 설명</Text>
                      <TextInput style={styles.input} value={this.props.navigation.getParam('meet_intro')} placeholder="모임 설명" />
                    </View>
                    <View>
                      <Text style={styles.appTitle1}>유의 사항</Text>
                      <TextInput style={styles.input} value={this.props.navigation.getParam('meet_careful')} placeholder="유의 사항" />
                    </View>

                                    <Pressable style={styles.menuItem1_6}  onPress={() => {}}>
                                      <Text style={styles.menuItem1_7}>펫타임+</Text>
                                    </Pressable>
                                    <Pressable style={styles.menuItem1_6}  onPress={() => {}}>
                                      <Text style={styles.menuItem1_7}>참여 문의</Text>
                                    </Pressable>
                </ScrollView>
                :<View style={styles.containerSearch}>
                    <View style={styles.containerSearch111}>
                      <FlatList 
                            data={this.state.locations.info}
                            renderItem={({item}) => (

                              item.user_id!=this.state.value?
                              <View  style={styles.chatting}>
                                <TouchableOpacity onPress={()=>{}}>
                                    <Image source={require('./assets/chelsea.png')}  style={styles.avatar1} />
                                </TouchableOpacity>

                                <View>
                                  <Text style={styles.appTitle1_11}>{item.chatting_content}</Text>
                                </View>
                              </View>
                              :
                              <View  style={styles.chatting}>
                                <View>
                                  <Text style={styles.appTitle2_11}>{item.chatting_content}</Text>
                                </View>
                              </View>
                          )}
                        />
                    </View>
                    
                    <View style={styles.containerSearch111_1}>
                    <View>
                      <TextInput style={styles.input11}  onChangeText={(value) => this.setState({chatting_content: value})} value={this.state.chatting_content} placeholder="채팅 입력" />
                    </View>
                    
                                    <Pressable style={styles.menuItem1_6}  onPress={this.doChat}>
                                      <Text style={styles.menuItem1_7}>문의</Text>
                                    </Pressable>
                    </View>
                </View>}
                
                <View style={styles.containerMenu}>
                    <ImageBackground source={require('./assets/menu_back2.png')} style={styles.menuBgImage_1}>
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
    appTitle1_111: {
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
    appTitle1_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 0,
      fontWeight: '300',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      borderBottomColor: '#ffd990',
      borderBottomWidth: 2,
      marginLeft: win.width / 4
    },
    appTitle1_2: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 0,
      fontWeight: '300',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      marginLeft: win.width / 4
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
      height : (119 / 751) * win.width,
      flexDirection: 'row',
    },
    menuBgImage111: {
      width : win.width,
      height : (119 / 751) * win.width,
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
    chatting: {
      flexDirection: 'row',
    },
    avatar1: {
      width : (1 / 10) * win.width,
      height : (1 / 10) * win.width,
      marginTop: 15,
      marginLeft: 15,
      borderRadius: (1 / 20) * win.width
    },
    appTitle1_11: {
      color: '#fff',
      fontFamily: 'GodoM',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: 5,
      width: win.width / 2,
      height : (1 / 10) * win.width,
      marginBottom: 0,
      fontWeight: '300',
      textAlign: 'center',
      textAlignVertical: 'center',
      backgroundColor: '#000',
      borderRadius: 15
    },

    appTitle2_11: {
      color: '#948568',
      fontFamily: 'GodoM',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 15,
      marginLeft: win.width / 2 - 50,
      width: win.width / 2,
      height : (1 / 10) * win.width,
      marginBottom: 0,
      fontWeight: '300',
      textAlign: 'center',
      textAlignVertical: 'center',
      backgroundColor: '#ffd990',
      borderRadius: 15
    },

    containerSearch111: {
      flex : 0.8,
      marginLeft: 10,
      marginRight: 10,
    },
    containerSearch111_1: {
      flex : 0.2,
      marginLeft: 10,
      marginRight: 10,
    },

    input11: {
      padding: 5,
      borderBottomColor: '#bbb',
      borderBottomWidth: 1,
      fontFamily: 'GodoM',
      fontSize: 14,
      marginLeft: 10,
      marginRight: 10,
      textAlignVertical: "bottom",
      marginTop: 10
    },
  });

export default MeetInfoScreen;  