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
import AsyncStorage from '@react-native-community/async-storage';
import * as ImagePicker from "react-native-image-picker"

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class CreateFeedScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
          filepath: {
            data: '',
            uri: ''
          },
          fileData: '',
          fileUri: '',
          fileType: '',
          fileName: '',
          ac_name: '',
          ac_location: ''
        }
    }

    createAct = async() => {

      if(this.state.fileUri == '' || this.state.fileUri == null || this.state.fileUri == undefined)
      {
        Alert.alert(
          " 이미지를 선택해주세요",
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
          " 본문 내용을 입력해주세요",
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

      if(this.state.ac_location == '' || this.state.ac_location == null || this.state.ac_location == undefined)
      {
        Alert.alert(
          " 위치 태그를 입력해주세요",
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

      console.log('whats reason2');

      console.log(this.state.ac_name + this.ac_location);
      
        var formData = new FormData();
        formData.append('ac_name', this.state.ac_name);
        formData.append("ac_location", this.state.ac_location);
        formData.append("creator_id", value);
        formData.append('fileData', {
          uri : this.state.fileUri,
          type: this.state.fileType,
          name: this.state.fileName
         });

        const data1 = { ac_name: this.state.ac_name,
                        ac_location: this.state.ac_location,
                        creator_id: value};

        return await fetch('http://49.247.37.15' + '/api/chat/AddPetFeeds', {
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
                    <TouchableOpacity onPress={()=>NavigationService.back()}>
                        <Image source={require('./assets/back.png')}  style={styles.menuItem1} />
                    </TouchableOpacity>
                  <Text style={styles.appTitle1_1}>피드 작성하기</Text>
                </View>
        
                <ScrollView style={styles.containerSearch}>

                    <TouchableOpacity onPress={this.selectFile}>
                        {/*<Image source={require('./assets/no_avatar.png')}  style={styles.avatar} />*/}
                        {this.renderFileUri()}
                    </TouchableOpacity>

                    <View>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_name: value})} placeholder="본문 내용 입력" />
                    </View>
                    <View>
                      <TextInput style={styles.input} onChangeText={(value) => this.setState({ac_location: value})} placeholder="위치 태그" />
                    </View>
                    <TouchableOpacity onPress={this.createAct}>
                        <Image source={require('./assets/createfeed.png')}  style={styles.menuItem2} />
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
      marginLeft : (1 / 3) * win.width,
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

export default CreateFeedScreen;  