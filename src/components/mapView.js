/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity
} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import Polyline from '@mapbox/polyline';
//import {checkPermission} from 'react-native-android-permissions';
import mapStyle from '../../MapStyles/mapStyle.json';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import MapViewDirections from 'react-native-maps-directions';
import data from '../../config.json';

let { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 31.6488;
const LONGITUDE = -8.02054;
const LATITUDE_DELTA = 0.03;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const GOOGLE_MAPS_APIKEY = 'AIzaSyDM9hxPzUUHTzKUDrlpEgnv_K914dYOdm4';


export default class Map extends Component {

  constructor() {
    super();

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      dep: {
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      dest: {
        destinationName : "Medicine Marrakech",
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      coords : [],
      markers : [],
      results : []
    };
    Tts.setDefaultLanguage('en-US');
    
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
  }

  onSpeechResults(e){
    
    this.setState({
        results1 : e.value,
        dest : {
          destinationName : e.value[0]
        }
    })
  }

  onSpeechPartialResults(e){
    this.setState({
        results : e.value
        
    })
  }

  componentDidMount() {

    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
          dep: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });

        this.getDirections(`${this.state.dep.latitude}, ${this.state.dep.longitude}`, 
        this.state.dest.destinationName);
        

      },
    (error) => console.log(error.message),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    );
  }


  async getDirections(startLoc, destination) {
    try {
   //let { lat, lon } = startLoc;
      let resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${ destination }&key=AIzaSyBC4C4GGaTEKAlZbJaWGSFVGlQ-dpTfMG4`);
      let respJson = await resp.json();
      let destLoc = `${respJson.results[0].geometry.location.lat},${respJson.results[0].geometry.location.lng}`
        let resp1 = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ startLoc }&destination=${ destLoc }&mode=walking`);
        let respJson1 = await resp1.json();
        let points = Polyline.decode(respJson1.routes[0].overview_polyline.points);
        /*let coords = points.map((point) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        })
        coords.unshift(this.state.dep)
          
        coords.push({
          latitude: respJson.results[0].geometry.location.lat,
          longitude: respJson.results[0].geometry.location.lng
        })*/
        let mrkrs = this.state.markers;
        mrkrs.push({
          latitude: respJson.results[0].geometry.location.lat,
          longitude: respJson.results[0].geometry.location.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA
        });
        this.setState({
          dest : {
            latitude: respJson.results[0].geometry.location.lat,
            longitude: respJson.results[0].geometry.location.lng
          },
          markers : mrkrs,
          coords : data
        });

        Tts.speak('direction drown successfully');
                
        return mrkrs;
    } catch(error) {
        alert(error)
        console.log(error);
    }
}
  renderMarkers(){
    
    if(!this.state.markers[0]){
      return [];
    }

    return this.state.markers.map((marker, index) => <MapView.Marker  key={index} coordinate={ marker } />);
  }
    
    /*
    <MapView.Marker
          coordinate={ this.state.dep }
          title={"dep"}
        />
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      }
    );*/


  /*componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }*/

  _onPressButton2() {
    
        Voice.start('fr_FR');
        
    }
    _onPressButton1() {
        
        Voice.stop();
        /*this.getDirections(`${this.state.dep.latitude}, ${this.state.dep.longitude}`, 
        this.state.dest.destinationName);*/
                
    }
    
    render() {
      console.log("i am here");
      return (
        <View style={styles.container}>
            <TouchableOpacity onPress={this._onPressButton2.bind()}>
                <View style={styles.button}>
                <Text style={styles.buttonText}>Choose a place</Text>
                </View>
            </TouchableOpacity>
            {
                this.state.results.map( (text,index) => {
                      return ( <Text key={index + 1}>{text}</Text> )
                })
            }
            <MapView
              style={styles.sub_container}
              provider={ PROVIDER_GOOGLE }
              mapType='satellite'
              customMapStyle={ mapStyle }
              showsUserLocation={ true }
              followUserLocation={true}
              ref={c => this.mapView = c}
              region={ this.state.region }
              onRegionChange={ region => this.setState({region}) }
            >
              {this.renderMarkers()}
              {(this.state.coords.length >= 2 ) && (
                  <MapViewDirections
                    origin={this.state.coords[0]}
                    destination={this.state.coords[this.state.coords.length-1]}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor="red"
                    mode="walking"
                    avoid ="indoor|tolls|highways"
                    transit_routing_preference="less_walking|fewer_transfers"
                    onReady={(result) => {
                      this.mapView.fitToCoordinates(result.coordinates, {
                        edgePadding: {
                          right: parseInt(width / 30, 10),
                          bottom: parseInt(height / 30, 10),
                          left: parseInt(width / 30, 10),
                          top: parseInt(height / 30, 10),
                        }
                      });
                    }}
                    onError={(errorMessage) => {
                      // console.log('GOT AN ERROR');
                    }}
                    
                  />
                )}
            </MapView>
          </View>
      );
    }
  }
  /*render() {
    console.log("i am here");
    return (
      <View style={styles.container}>
          <TouchableOpacity onPress={this._onPressButton2.bind()}>
              <View style={styles.button}>
              <Text style={styles.buttonText}>Choose a place</Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._onPressButton1.bind()}>
              <View style={styles.button}>
              <Text style={styles.buttonText}>Choose a place</Text>
              </View>
          </TouchableOpacity>
          {
              this.state.results.map( (text,index) => {
                    return ( <Text key={index + 1}>{text}</Text> )
              })
          }
          {
              [this.state.dep].map( (point,index) => {
                    return ( <Text key={index}>{point.latitude} {point.longitude}</Text> )
              })
          }
          <MapView
            style={styles.sub_container}
            provider={ PROVIDER_GOOGLE }
            mapType='satellite'
            customMapStyle={ mapStyle }
            showsUserLocation={ true }
            followUserLocation={true}
            region={ this.state.region }
            onRegionChange={ region => this.setState({region}) }
            //onRegionChangeComplete={ region => this.setState({region}) }
          >
            {this.renderMarkers()}
            <MapView.Polyline 
              coordinates={this.state.coords}
              strokeWidth={10}
              strokeColor="red"/>
          </MapView>
        </View>
    );
  }
}*/

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    paddingTop: 60,
    alignItems: 'center'
  },
  sub_container: {
    height: '80%',
    width: '100%',
    paddingTop: 60,
    alignItems: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  }
});

/*setTimeout(() => {
      requestPermission("android.permission.ACCESS_FINE_LOCATION").then((result) => {
        console.log("Granted!", result);
        // now you can set the listenner to watch the user geo location
        navigator.geolocation.getCurrentPosition(
          position => {
            this.setState({
              region: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }
            });
          },
        (error) => console.log(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
        );
      }, (result) => {
        console.log("Not Granted!");
        console.log(result);
      });
    // for the correct StatusBar behaviour with translucent={true} we need to wait a bit and ask for permission after the first render cycle
    // (check https://github.com/facebook/react-native/issues/9413 for more info)
    }, 0);
    

    checkPermission("android.permission.ACCESS_FINE_LOCATION").then((result) => {
      console.log("Already Granted!");
      console.log(result);
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }
          });
        },
      (error) => console.log(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
      );
    }, (result) => {
      console.log("Not Granted!");
      console.log(result);
    });
    */