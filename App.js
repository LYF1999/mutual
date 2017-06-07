import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  PanResponder,
  Button,
  PermissionsAndroid,
  Platform,
  NativeModules
} from 'react-native';
import { Buffer } from 'buffer';
import TabNavigator from 'react-native-tab-navigator';

import RNFS from 'react-native-fs';

import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import request from 'superagent';
const Speak = NativeModules.Speak;

const API_KEY = 'fiuNG8DnuSjsT5Gtu5c720ta';
const SECRET_KEY = '1c0d4374b2d4257788380e4de45ec09d';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    margin: 30,
  }
});


class App extends Component {

  state = {
    scale: 1,
    iWidth: 980,
    iHeight: 644,
    top: (Dimensions.get('window').height - 644) / 2,
    left: (Dimensions.get('window').width - 980) / 2,
    selectedTab: 'work',
    currentTime: 0.0,
    recording: false,
    stoppedRecording: false,
    finished: false,
    playing: true,
    audioPath: AudioUtils.DocumentDirectoryPath + '/test.acc',
    hasPermission: undefined,
  };

  _path = '/1210.wav';

  zoomLastDistance = null;


  centerDiffX = 0;
  centerDiffY = 0;

  token = '';

  double = false;

  _sound = undefined;

  componentWillMount() {
    this.getToken();

    this.dWidth = Dimensions.get('window').width;
    this.dHeight = Dimensions.get('window').height;
    this._ImageDragResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        this._lastClickTime = new Date().getTime();
        this._top = this.state.top;
        this._left = this.state.left;
        this._scale = this.state.scale;
      },
      onPanResponderMove: (evt, gs) => {
        if (evt.nativeEvent.changedTouches.length <= 1) {
          const newState = {};

          newState.top = this._top + gs.dy;


          if (this._left + gs.dx <= 0) {
            newState.left = this._left + gs.dx;
          }
          this.setState(newState);
        } else {

          let minX;
          let maxX;
          if (evt.nativeEvent.changedTouches[0].locationX > evt.nativeEvent.changedTouches[1].locationX) {
            minX = evt.nativeEvent.changedTouches[1].pageX;
            maxX = evt.nativeEvent.changedTouches[0].pageX;
          } else {
            minX = evt.nativeEvent.changedTouches[0].pageX;
            maxX = evt.nativeEvent.changedTouches[1].pageX;
          }

          let minY;
          let maxY;
          if (evt.nativeEvent.changedTouches[0].locationY > evt.nativeEvent.changedTouches[1].locationY) {
            minY = evt.nativeEvent.changedTouches[1].pageY;
            maxY = evt.nativeEvent.changedTouches[0].pageY;
          } else {
            minY = evt.nativeEvent.changedTouches[0].pageY;
            maxY = evt.nativeEvent.changedTouches[1].pageY;
          }


          if (this.double === false) {
            this.currentX = ((this.state.iWidth - this.dWidth) / 2) + this.state.left;

            this.currentX -= (minX + maxX - this.dWidth) / 2;

            this.currentY = ((this.state.iHeight - this.dHeight) / 2) + this.state.top;

            this.currentY -= (minY + maxY - this.dHeight) / 2;

            this.double = true;
          }


          const widthDistance = maxX - minX;
          const heightDistance = maxY - minY;
          const diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance);
          this.zoomCurrentDistance = diagonalDistance.toFixed(3);

          if (this.zoomLastDistance !== null) {
            let distanceDiff = (this.zoomCurrentDistance - this.zoomLastDistance) / 400;
            if (Math.abs(distanceDiff) <= 0.3) {
              this.setState((preState) => {
                let zoom = preState.scale + distanceDiff;

                if (zoom < 0.3) {
                  zoom = 0.3
                }
                if (zoom > 10) {
                  zoom = 10
                }

                return {
                  left: this.currentX * (zoom / this._scale) - ((this.state.iWidth - this.dWidth) / 2),
                  top: this.currentY * (zoom / this._scale) - ((this.state.iHeight - this.dHeight) / 2),
                  scale: zoom,
                }
              });
            }
          }
          this.zoomLastDistance = this.zoomCurrentDistance;
        }
      },
      onPanResponderRelease: () => {
        this.double = false;

        if (new Date().getTime() - this._lastClickTime > 2000) {
          this.setState({
            scale: 1,
            top: (Dimensions.get('window').height - 644) / 2,
            left: (Dimensions.get('window').width - 980) / 2,
          });
        }


        const X = -this.state.left / this.state.scale;
        console.log(X);
        this._path = '/1210.wav';

        this.play(this._path);
      }
    });
  }

  componentDidMount() {

    this.play(this._path);

    // 页面加载完成后获取权限
    this.checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });

      //如果未授权, 则执行下面的代码
      if (!hasPermission) return;
      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        this.setState({ currentTime: Math.floor(data.currentTime) });
      };

      AudioRecorder.onFinished = (data) => {
        if (Platform.OS === 'ios') {
          this.finishRecording(data.status === "OK", data.audioFileURL);
        }
      };

    })
  }


  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 6440,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "acc",
      MeteringEnabled: true
    });
  }


  checkPermission = () => {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': '获取录音权限',
      'message': 'XXX正请求获取麦克风权限用于录音,是否准许'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        return (result === true || PermissionsAndroid.RESULTS.GRANTED)
      })
  };


  record = async () => {

    this._sound.stop();
    // 如果正在录音
    if (this.state.recording) {
      console.log('正在录音中!');
      return;
    }

    //如果没有获取权限
    if (!this.state.hasPermission) {
      console.log('没有获取录音权限!');
      return;
    }

    //如果暂停获取停止了录音
    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({ recording: true });

    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  };

  getToken = () => {
    request.get(`https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`)
      .end((err, res) => {
        const text = JSON.parse(res.text);
        this.token = text.access_token;
      })
  };

  stop = async () => {

    // 如果没有在录音
    if (!this.state.recording) {
      console.log('没有录音, 无需停止!');
      return;
    }

    this.setState({ stoppedRecording: true, recording: false });

    try {
      const filePath = await AudioRecorder.stopRecording();

      this._sound.pl

      if (Platform.OS === 'android') {
        this.finishRecording(true, filePath);
        this.handleVoice();
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }

  };


  finishRecording = (didSucceed, filePath) => {
    this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
  };

  playMy = () => {
    this.play(this.state.audioPath, true);
  };

  play = async (path, record = false) => {
    if (this.state.recording) {
      await this.stop();
    }

    let filePath = RNFS.DocumentDirectoryPath + path;

    if (record) {
      filePath = path;
    }

    const exist = await RNFS.exists(filePath);

    if (this._sound) {
      this._sound.stop();
    }

    if (!exist) {
      switch (path) {
        case '/1210.wav':
          await RNFS.downloadFile({
            fromUrl: 'http://fjdx.sc.chinaz.com/files/download/sound1/201204/1210.wav',
            toFile: filePath
          });

          console.log('下载完成');

          break;

        case '/4011.wav':
          await RNFS.downloadFile({
            fromUrl: 'http://gddx.sc.chinaz.com/files/download/sound1/201401/4011.wav',
            toFile: filePath
          });
          console.log('下载完成');
          break;
        default:
      }
    } else {
      console.log('文件存在');
      console.log(filePath);
    }


    setTimeout(() => {
      const sound = new Sound(filePath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });


      setTimeout(() => {
        if (this._sound) {
          this._sound.stop();
        }
        this._sound = sound;
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  };

  handleVoice = () => {
    Speak.go();
  };


  render() {
    return (
      <TabNavigator>
        <TabNavigator.Item
          selected={this.state.selectedTab === 'info'}
          title="App信息"
          onPress={() => this.setState({ selectedTab: 'info' })}
        >
          <View style={styles.container}>
            <Text>
              这个App使用React Native制作
            </Text>
          </View>
        </TabNavigator.Item>
        <TabNavigator.Item
          selected={this.state.selectedTab === 'work'}
          title="开始"
          onPress={() => this.setState({ selectedTab: 'work' })}
        >
          <View style={{ position: 'relative' }}>
            <View style={{ overflow: 'hidden', height: '87%' }}>
              <Image
                {...this._ImageDragResponder.panHandlers}
                style={{
                  transform: [{ translateY: this.state.top }, { translateX: this.state.left }, { scale: this.state.scale }]
                }}
                source={require('./public/image.jpg')}
              />
            </View>
            {
              this.state.recording ? (
                <Button onPress={this.stop} title={"停止录音"} />
              ) : (
                <Button onPress={this.record} title={"开始录音"} />
              )
            }

            <Button onPress={this.playMy} title={"播放录音"} />
          </View>
        </TabNavigator.Item>
      </TabNavigator>
    );
  }
}

export default App

