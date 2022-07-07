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
  Dimensions,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import * as ImagePicker from "react-native-image-picker"

const win = Dimensions.get('window');
import {NavigationService} from '../common';

class PetInfoScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
          filepath: {
            data: '',
            uri: ''
          },
          fileData: '',
          fileUri: ''
        }
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
                      <Text style={styles.appTitle}>펫 정보</Text>
                    </View>
                    <View>
                      <TextInput style={styles.input} placeholder="펫 생일 or 펫 입양일" />
                    </View>
                    <View>
                      <TextInput style={styles.input} placeholder="강아지" />
                    </View>
                    <View>
                      <TextInput style={styles.input} placeholder="펫 품종" />
                    </View>
                    <View>
                      <TextInput style={styles.input} placeholder="반려견 성격" />
                    </View>
                    <View>
                      <TextInput style={styles.input} placeholder="했음" />
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
  });

export default PetInfoScreen;  