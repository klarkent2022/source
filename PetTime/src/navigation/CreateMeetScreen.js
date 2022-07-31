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
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import * as ImagePicker from "react-native-image-picker"

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class CreateMeetScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          filepath: {
            data: '',
            uri: '',
            ac_name: '',
            ac_vil: '',
            ac_num: '',
            ac_cat: '',
            ac_intro: '',
            ac_careful: ''
          },
          fileType: '',
          fileName: '',
          fileData: '',
          fileUri: ''
        }
    }

    createAct = async() => {

      if(this.state.fileUri == '' || this.state.fileUri == null || this.state.fileUri == undefined)
      {
        Alert.alert(
          "이미지를 선택해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_name == '' || this.state.ac_name == null || this.state.ac_name == undefined)
      {
        Alert.alert(
          " 모임 제목을 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_vil == '' || this.state.ac_vil == null || this.state.ac_vil == undefined)
      {
        Alert.alert(
          " 모임 동네를 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_num == '' || this.state.ac_num == null || this.state.ac_num == undefined)
      {
        Alert.alert(
          " 최대인원을 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_cat == '' || this.state.ac_cat == null || this.state.ac_cat == undefined)
      {
        Alert.alert(
          " 카테고리를 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_intro == '' || this.state.ac_intro == null || this.state.ac_intro == undefined)
      {
        Alert.alert(
          " 모임 소개 내용을 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      if(this.state.ac_careful == '' || this.state.ac_careful == null || this.state.ac_careful == undefined)
      {
        Alert.alert(
          " 유의 사항을 입력해주세요",
          "",
          [
            // The "Yes" button
            {
              text: "",
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "확인",
            },
          ]
        );
        return;
      }

      const value = await AsyncStorage.getItem('@user_id');

      console.log('whats reason1');
      console.log(this.state.ac_name + this.state.ac_vil + this.state.ac_num + this.state.ac_cat
        + this.state.ac_intro + this.state.ac_careful);
      
        var formData = new FormData();
        formData.append('ac_name', this.state.ac_name);
        formData.append("ac_vil", this.state.ac_vil);
        formData.append("ac_num", this.state.ac_num);
        formData.append("ac_cat", this.state.ac_cat);
        formData.append("ac_intro", this.state.ac_intro);
        formData.append("ac_careful", this.state.ac_careful);
        formData.append("creator_id", value);
        formData.append('fileData', {
          uri : this.state.fileUri,
          type: this.state.fileType,
          name: this.state.fileName
         });

        const data1 = { ac_name: this.state.ac_name,
                        ac_vil: this.state.ac_vil,
                        ac_num: this.state.ac_num,
                        ac_price: this.state.ac_price,
                        ac_cat: this.state.ac_cat,
                        ac_intro: this.state.ac_intro,
                        ac_careful: this.state.ac_careful,
                        ac_right: this.state.ac_right,
                        creator_id: value};

        return await fetch('http://10.0.2.2:3000' + '/api/chat/AddPetMeets', {
          method: 'post',
          body: formData,
          'headers': {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
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
                NavigationService.back();
                  })
          .catch((error) => {
            
            console.log(error.toString());
          });

    };

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
              fileUri: res.assets[0].uri,
              fileType: res.assets[0].type,
              fileName: res.assets[0].fileName
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
                  <Text style={styles.appTitle1_1}>모임 개설하기</Text>
                </View>
        
                <ScrollView style={styles.containerSearch}>

                    <TouchableOpacity onPress={this.selectFile}>
                        {/*<Image source={require('./assets/no_avatar.png')}  style={styles.avatar} />*/}
                        {this.renderFileUri()}
                    </TouchableOpacity>

                    <View>
                      <Text style={styles.appTitle}>모임 제목</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_name: value})} placeholder="모임 제목 입력" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>모임 동네</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_vil: value})} placeholder="모임 동네 입력" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>최대인원</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_num: value})} placeholder="최대인원 입력" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>카테고리</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_cat: value})} placeholder="카테고리 선택" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>모임 소개</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_intro: value})} placeholder="모임 소개 내용 본문 입력" />
                    </View>
                    <View>
                      <Text style={styles.appTitle}>유의 사항(선택)</Text>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_careful: value})} placeholder="유의 사항 본문 입력" />
                    </View>
                    <View style={styles.menuBgImage}>
                      <TouchableOpacity onPress={this.createAct}>
                          <Image source={require('./assets/next_stage.png')}  style={styles.menuItem2} />
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
      marginTop: 10,
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
      marginLeft : (1 / 3) * win.width - 10,
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
      width : (1 / 3) * win.width,
      height : (1 / 3) * win.width,
      marginLeft : (1 / 3) * win.width,
      marginTop : (10 / 751) * win.width,
    },
  });

export default CreateMeetScreen;  