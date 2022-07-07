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
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import CheckBox from '@react-native-community/checkbox';
import * as ImagePicker from "react-native-image-picker"

const win = Dimensions.get('window');

import {NavigationService} from '../common';

class AddPetScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          checked : true,
          checked1 : false,
          filepath: {
            data: '',
            uri: ''
          },
          fileData: '',
          fileUri: '',
          male: true,
          female: false,

          pet_name: '',
          pet_birthday: '',
          pet_type: '',
          pet_type1: '',
          pet_character: '',
        }

        console.log('this.props' + this.props.navigation.getParam('info'));
    }

    regUser = async() => {
      
        var sex='';
        var sex1='';

        if(this.state.male)
          sex = '1';
        else
          sex = '0';

        if(this.state.checked)
          sex1 = '1';
        else
          sex1 = '0';

        const data1 = { pet_name: this.state.pet_name,
                        pet_birthday: this.state.pet_birthday,
                        pet_type: this.state.pet_type,
                        pet_type1: this.state.pet_type1,
                        pet_character: this.state.pet_character,
                        pet_sex: sex,
                        pet_sex1: sex1,
                        user_name: this.props.navigation.getParam('user_name'),
                        user_age: this.props.navigation.getParam('user_age'),
                        user_addr: this.props.navigation.getParam('user_addr'),
                        user_phone: this.props.navigation.getParam('user_phone'),
                        user_email: this.props.navigation.getParam('email'),
                        user_sex: this.props.navigation.getParam('user_sex'),
                      };

        return await fetch('http://49.247.37.15' + '/api/chat/regUser', {
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
                console.log("responseJson.user_id" + responseJson.user_id);
                AsyncStorage.setItem('@user_id', responseJson.user_id.toString());
                
                NavigationService.navigate('HomeScreen', {
                  screen: 'HomeScreen',
                  info: 'information'
                });

                  })
          .catch((error) => {
            
            console.log(error.toString());
          });

    };

    
    selectSexMale = () => {
      this.setState({
        male: true,
        female: false
      });
    }

    selectSexFemale = () => {
      this.setState({
        male: false,
        female: true
      });
    }

    selectFile = () => {
      
      ImagePicker.launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 200,
          maxWidth: 200,
        },
        (res) => {
          console.log('Response = ', res);
          if (res.didCancel) {
            console.log('User cancelled image picker');
          } else if (res.error) {
            console.log('ImagePicker Error: ', res.error);
          } else if (res.customButton) {
            console.log('User tapped custom button: ', res.customButton);
            alert(res.customButton);
          } else {
            console.log('Response = ', res.assets[0]);
            console.log('res uri : ' + res.assets[0].uri);
            this.setState({
              filePath: res,
              fileUri: res.assets[0].uri
            });
          }
        },
      )
  
    };

    renderFileUri() {
      if (this.state.fileUri) {
        console.log('file uri : ' + this.state.fileUri);
        return <Image
          source={{ uri: this.state.fileUri }}
          style={styles.avatar}
        />
      } else {
        console.log('no avatar : ' + this.state.fileUri);
        return <Image
          source={require('./assets/no_avatar.png')}
          style={styles.avatar}
        />
      }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
              <View style={styles.card}>
                
                <View style={styles.menuBgImage}>
                    <TouchableOpacity onPress={()=> NavigationService.back()}>
                        <Image source={require('./assets/back.png')}  style={styles.menuItem1} />
                    </TouchableOpacity>
                  <Text style={styles.appTitle1_1}>펫 정보</Text>
                </View>
        
                <ScrollView style={styles.containerSearch}>

                    <TouchableOpacity onPress={this.selectFile}>
                        {/*<Image source={require('./assets/no_avatar.png')}  style={styles.avatar} />*/}
                        {this.renderFileUri()}
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.appTitle}>이름</Text>
                      <TextInput style={styles.input}  onChangeText={(value) => this.setState({pet_name: value})} placeholder="나의 펫 이름을 입력해주세요" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>생일 혹은 입양일</Text>

                      <View style={styles.rowConfig}>
                        <TextInput style={styles.input1}  onChangeText={(value) => this.setState({pet_birthday: value})} placeholder="펫 생일 or 펫 입양일" />
                        <CheckBox style={styles.input2}
                          value={this.state.male}
                          onValueChange={this.selectSexMale}
                        />
                        <Text style={styles.input2}>수컷     </Text>
                        <CheckBox style={styles.input2}
                          value={this.state.female}
                          onValueChange={this.selectSexFemale}
                        />
                        <Text style={styles.input2}>암컷</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={styles.appTitle}>종류</Text>
                      <TextInput style={styles.input}  onChangeText={(value) => this.setState({pet_type: value})} placeholder="강아지" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>품종</Text>
                      <TextInput style={styles.input}  onChangeText={(value) => this.setState({pet_type1: value})} placeholder="품종" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>성격</Text>
                      <TextInput style={styles.input}  onChangeText={(value) => this.setState({pet_character: value})} placeholder="펫의 성격을 설명해주세요" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>중성화 여부</Text>
                      <View style={{ flexDirection: 'column'}}>
  
                        <View style={{ flexDirection: 'row' }}>
                          <CheckBox
                            value={this.state.checked}
                            onValueChange={() => this.setState({ checked: !this.state.checked, checked1: !this.state.checked1 })}
                          />
                          <Text style={{marginTop: 5}}>했음</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                          <CheckBox
                            value={this.state.checked1}
                            onValueChange={() => this.setState({ checked1: !this.state.checked1, checked: !this.state.checked })}
                          />
                          <Text style={{marginTop: 5}}>하지 않았음</Text>
                        </View>

                      </View>

                      {/*
                       <CheckBox
            style={{flex: 1, padding: 10}}
            onClick={()=>{
                 this.setState({
                     isChecked:!this.state.isChecked
                 })
               }}
            isChecked={this.state.isChecked}
            checkedImage={<Image source={require('../../page/my/img/ic_check_box.png')} style={this.props.theme.styles.tabBarSelectedIcon}/>}
            unCheckedImage={<Image source={require('../../page/my/img/ic_check_box_outline_blank.png')} style={this.props.theme.styles.tabBarSelectedIcon}/>}
        />); */}
        
                    </View>
                    <View style={styles.menuBgImage}>
                      <TouchableOpacity onPress={this.regUser}>
                          <Image source={require('./assets/addpet.png')}  style={styles.menuItem2} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={()=>NavigationService.navigate('NoScreen', {
                                screen: 'NoScreen',
                                info: 'information'
                            })}>
                          <Image source={require('./assets/next1.png')}  style={styles.menuItem2} />
                      </TouchableOpacity>
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
      backgroundColor: '#000000',
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
      backgroundColor: '#f8f8f8',
    },
    appTitle1_1: {
      color: '#000',
      fontFamily: 'GodoM',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 10,
      marginTop: 30,
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

    menuItem2: {
      width : 0.49 * win.width,
      height : 0.136 * win.width,
      marginLeft : 0.01 * win.width,
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
      width : (1 / 3) * win.width ,
      height : (1 / 3) * win.width,
      marginLeft : (1 / 3) * win.width,
      marginTop : (10 / 751) * win.width,
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

export default AddPetScreen;  