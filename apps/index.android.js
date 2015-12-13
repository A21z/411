'use strict';

var React = require('react-native');
var config = require('./config.json')
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  PullToRefreshViewAndroid,
  } = React;

var apps = React.createClass({
  render: function () {
    var button = <View />;
    var showButton = this.state.loaded && !this.state.isAlive && !this.state.wakingPi && !this.state.stateError;
    if (showButton) {
      button =
        <View>
          <TouchableNativeFeedback onPress={this.buttonClicked} background={TouchableNativeFeedback.Ripple()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Start con-nas</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
    }

    return (
      <PullToRefreshViewAndroid
        style={styles.pullToRefreshViewAndroid}
        refreshing={!this.state.loaded}
        onRefresh={this.onRefresh}
      >
        <View style={styles.container}>
          <Text>{this.state.loaded ? '' : 'loading...'}</Text>
          <Text>{this.state.stateError ? 'error getting con-nas state' : ''}</Text>
          <Text>{this.state.isAlive ? 'con-nas is up' : ''}</Text>
          <Text>{this.state.feedback}</Text>
          {button}
        </View>
      </PullToRefreshViewAndroid>
    );
  },
  componentDidMount: function () {
    this.getConNasState();
  },
  getInitialState: function () {
    return {
      wakingPi: false,
      loaded: false,
      feedback: '',
      isAlive: null,
    };
  },
  buttonClicked: function () {
    this.setState({feedback: '...'});
    this.wakeConNas();
  },
  getConNasState: function () {
    fetch(config.baseUrl + '/con-nas', {method: 'GET'})
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({loaded: true, isAlive: responseData.isAlive});
      })
      .catch((error) => {
        this.setState({loaded: true, stateError: true});
      })
      .done();
  },
  // This is a dirty mock function to easily test random states from the server
  getConNasStateMock: function () {
    var rnd = Math.floor(Math.random() * (2));
    this.setState({loaded: true, isAlive: rnd > 0});
  },
  wakeConNas: function () {
    var _this = this;
    this.setState({wakingPi: true});
    fetch(config.baseUrl + '/con-nas', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then((response) => response.json())
      .then((responseData) => {
        if (responseData.error) {
          this.setState({feedback: 'pi returned an error', wakingPi: false})
        } else {
          this.setState({feedback: 'con-nas is waking up...'})
          setTimeout(function () {
            _this.onRefresh();
          }, 10000)
        }
      })
      .catch((error) => {
        this.setState({feedback: 'error reaching pi', wakingPi: false})
      })
      .done();
  },
  onRefresh() {
    this.setState(this.getInitialState());
    this.componentDidMount();
  },
});

var styles = StyleSheet.create({
  pullToRefreshViewAndroid: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#337ab7',
    borderColor: '#2e6da4',
    borderWidth: 1,
    borderRadius: 4,
  },
  buttonText: {
    margin: 5,
    color: 'white',
  }
});

AppRegistry.registerComponent('apps', () => apps);
