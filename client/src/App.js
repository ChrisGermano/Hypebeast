import React, { Component } from 'react';

import logo from './logo.svg';

import './App.css';



class App extends Component {
  state = {
    response: '',
    path: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: JSON.stringify(res.express) }))
      .catch(err => console.log(err));
  }

  callApi = async () => {

    var rawPath = window.location.pathname.split("/");

    var apiPath = '/';

    if (rawPath.length > 3) {
      this.state.path = window.location.pathname.split("/")[2];
      apiPath = '/api/' + this.state.path + '/' + window.location.pathname.split("/")[3];
    } else if (rawPath.length > 2) {
      this.state.path = window.location.pathname.split("/")[2];
      apiPath = '/api/' + this.state.path;
    }

    const response = await fetch(apiPath);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">{this.state.response}</p>
      </div>
    );
  }

}

export default App;
