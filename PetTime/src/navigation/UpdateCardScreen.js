import React, { Component } from 'react';
import { StatusBar, ToastAndroid } from 'react-native';
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
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import CheckBox from '@react-native-community/checkbox';

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class UpdateCardScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          male: true,
          female: false,
          user_name: '',
          user_age: '',
          user_addr: '',
          user_phone: '',
          user_sex: '1'
        };

        console.log('this.props' + this.props.navigation.getParam('email'));
    }

    
    componentDidMount = () => {
      this.props.navigation.addListener('focus', () => {
          
       });
        this.getData();
     }
     
    getData = async () => {

      console.log('get data in update user');
      const value = await AsyncStorage.getItem('@user_id');

      const data1 = { user_id: value
      };
      //const loc_id = this.props.route.params.location_id;
      return await fetch('http://10.0.2.2:3000' + '/api/chat/getPetUserBank', {
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
                
                /*male: true,
          female: false,
          user_name: '',
          user_age: '',
          user_addr: '',
          user_phone: '',
          user_sex: '1'*/

                this.setState({
                  user_name: responseJson.info.bank_name,
                  user_addr: responseJson.info.name,
                  user_phone: responseJson.info.bank_no,
                });

                if(responseJson.info.user_sex == 1)
                {
                  this.setState({
                  male: true,
                  female: false,
                  user_sex: '1' 
                  });
                }
                else
                {
                  this.setState({
                    male: false,
                    female: true,
                    user_sex: '0' 
                  });
                }

                  })
          .catch((error) => {
            
            console.log(error.toString());
          });
    }

    updateUserData = async () => {

      console.log('get data in update user');
      
      const value = await AsyncStorage.getItem('@user_id');

      const data1 = { user_id: value,
          user_name: this.state.user_name,
          user_age: this.state.user_age,
          user_addr: this.state.user_addr,
          user_phone: this.state.user_phone,
          user_sex: this.state.user_sex,
          user_id: value
      };
      //const loc_id = this.props.route.params.location_id;
      return await fetch('http://10.0.2.2:3000' + '/api/chat/AddPetBank', {
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
                ToastAndroid.show('수정되었습니다', ToastAndroid.SHORT);
                  })
          .catch((error) => {
            
            console.log(error.toString());
          });
    }

    selectSexMale = () => {
      this.setState({
        male: true,
        female: false,
        user_sex: '1'
      });
    }

    selectSexFemale = () => {
      this.setState({
        male: false,
        female: true,
        user_sex: '0'
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
                  <Text style={styles.appTitle1_1}>계좌 정보 등록</Text>
                </View>
        
                <ScrollView style={styles.containerSearch}>
                    
                    <View>
                      <Text style={styles.appTitle}>계좌 정보를 등록하세요</Text>
                    </View>
                    <View>
                      <Text style={styles.appTitle1_2}>모임 정산금을 받으실 수 있습니다</Text>
                    </View>
                    <View></View>
                    <View>
                      <Text style={styles.appTitle}>은행명</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({user_name: value})} value={this.state.user_name} placeholder="은행명을 입력해주세요" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>성명</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({user_addr: value})}  value={this.state.user_addr} placeholder="성함을 입력해주세요" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>계좌번호</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({user_phone: value})} value={this.state.user_phone} placeholder="계좌번호를 입력해주세요" />
                    </View>

                    <TouchableOpacity onPress={this.updateUserData}>
                        <Image source={require('./assets/next.png')}  style={styles.menuItem2} />
                    </TouchableOpacity>

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
    appTitle: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 0,
      textAlign: 'left',
      backgroundColor: '#f8f8f8',
    },
    appTitle1_2: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 0,
      marginBottom: 0,
      textAlign: 'left',
      backgroundColor: '#f8f8f8',
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
      backgroundColor: '#f8f8f8',
    },
    card: {
      backgroundColor: '#f8f8f8',
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
      width : 0.99 * win.width,
      height : 0.14 * win.width,
      marginLeft : 0.005 * win.width,
      marginTop : (100 / 751) * win.width,
    },

    rowConfig: {
      flexDirection: 'row',
    },
    
    input1: {
      flex : 0.7,
      padding: 5,
      borderBottomColor: '#bbb',
      borderBottomWidth: 1,
      fontFamily: 'GodoM',
      fontSize: 14,
      marginLeft: 10,
      textAlignVertical: "bottom",
    },
    input2: {
      padding: 5,
      marginLeft: 1,
      marginTop: 15
    },
  });

export default UpdateCardScreen;  