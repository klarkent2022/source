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
  FlatList,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class MyInterestScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          location_id: null,
          locations: [],
          locations1: [],
          locations2: [],
          isLoading: true,
        };
    }

    componentDidMount = () => {
      this.props.navigation.addListener('focus', () => {
          this.state.isLoading;
       });
        this.getData();
        this.getData1();
        this.getData2();
     }
     
     createActivity = () => {
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

    getData1 = async () => {
      //const loc_id = this.props.route.params.location_id;
      return await fetch('http://10.0.2.2:3000' + '/api/chat/getPetMeets', {
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
                  locations1: responseJson,
                  isLoading: false,
                });
                  })
          .catch((error) => {
            console.log(error.toString());
          });
    }

    getData2 = async () => {
      //const loc_id = this.props.route.params.location_id;
      return await fetch('http://10.0.2.2:3000' + '/api/chat/getPetFeeds', {
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
                  locations2: responseJson,
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
                
                <View style={styles.menuBgImage111}>
                    <TouchableOpacity onPress={()=> NavigationService.back()}>
                        <Image source={require('./assets/back.png')}  style={styles.menuItem111} />
                    </TouchableOpacity>
                  <Text style={styles.appTitle111}>{this.props.navigation.getParam('level')}</Text>
                </View>

                <ScrollView style={styles.containerSearch}>
                    
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
                                              activity_cafeful: item.activity_cafeful
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
                      <Text style={styles.appTitle}>동네 모임</Text>
                      
                      <FlatList
                        horizontal
                          data={this.state.locations1.info}
                          renderItem={({item}) => (
                            <TouchableOpacity onPress={()=>NavigationService.navigate('MeetInfoScreen', {
                              screen: 'MeetInfoScreen',
                              info: 'information',
                              meet_image: item.meet_image,
                              meet_name: item.meet_name,
                              meet_num: item.meet_num,
                              meet_village: item.meet_village,
                              meet_intro: item.meet_intro,
                              meet_careful: item.meet_careful,
                          })}>

                            {item.meet_image == null? <Text></Text>: <Image source={{uri:item.meet_image}}  style={styles.menuItem1_2} /> }
                            <View style={styles.menuBgImage1} >
                              <Text style={styles.contentTitle_1}>{item.meet_name}</Text>
                            </View>
                            <View style={styles.menuBgImage1} >
                              <Image source={require('./assets/no_avatar.png')}  style={styles.menuItem1_3} />
                              {item.meet_num == null? <Text></Text>: <Text style={styles.contentTitle}>{item.meet_num}</Text> }
                            </View>
                          </TouchableOpacity>
                        )}
                        //keyExtractor={(item) => item.status.toString()}
                        />
                    </View>

                    <View>
                      <Text style={styles.appTitle}>피드</Text>
                      <FlatList
                        horizontal
                          data={this.state.locations2.info}
                          renderItem={({item}) => (
                          <TouchableOpacity onPress={()=>NavigationService.navigate('FeedInfoScreen', {
                                      screen: 'FeedInfoScreen',
                                      info: 'information',
                                      feed_image: item.meet_image,
                                      feed_name: item.feed_name,
                                      feed_date: item.updated_at
                                  })}>

                            {item.meet_image == null? <Text></Text>: <Image source={{uri:item.meet_image}}  style={styles.menuItem1_2} /> }
                            <View style={styles.menuBgImage1} >
                              {item.feed_name == null? <Text></Text>: <Text style={styles.contentTitle}>{item.feed_name}</Text> }
                            </View>
                          </TouchableOpacity>
                        )}
                        //keyExtractor={(item) => item.status.toString()}
                        />
                    </View>

                </ScrollView>
                
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
      borderRadius: 4,
      elevation: 3,
      backgroundColor: 'black',
      width: 150,
      height: 45,
      marginLeft: win.width * 0.5,
      marginTop: 8,
    },

    menuItem1: {
      width : (75 / 751) * win.width,
      height : (75 / 751) * win.width,
      marginLeft : (40 / 751) * win.width,
      marginTop : (10 / 751) * win.width,
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
      width : (75 / 751) * win.width,
      height : (75 / 751) * win.width,
      marginLeft : (75 / 751) * win.width,
      marginTop : (10 / 751) * win.width,
    },
    menuBgImage1: {
      flexDirection: 'row',
    },

    menuItem1_7: {
      fontFamily: 'GodoM',
      fontSize: 10,
      lineHeight: 21,
      fontWeight: 'bold',
      textAlign: 'center',
      letterSpacing: 0.25,
      color: 'white',
    },

    menuBgImage111: {
      width : win.width,
      height : (169 / 751) * win.width,
      flexDirection: 'row',
    },
    menuItem111: {
      width : (1 / 10) * win.width,
      height : (1 / 15) * win.width,
      marginLeft : (30 / 751) * win.width,
      marginTop : 30,
    },
    appTitle111: {
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
  });

export default MyInterestScreen;  