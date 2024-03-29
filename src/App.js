import React, { Component } from 'react';
import ParticlesBg from 'particles-bg';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
 apiKey: '484a7bcd9c634900bfff2b465577e64d'
});


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

// when a new user registers:
  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined      
    }})
  }

  // componentDidMount() {
  //   fetch('http://localhost:3001/')
  //     .then(response => response.json())
  //     .then(console.log) // will console.log data
  // }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    // Number() turns a string into a number
    // Need image width and height to calculate bounding box
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      // bounding box numbers are percentages
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
    // can also just put box, due to ES6
  }

// the URL that is input:
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

// this is when you submit a photo
  onSubmit = () => {
    this.setState({imageUrl: this.state.input})
    console.log('click');
    app.models
    .predict(
      //had to change the below as FACE_DETECT_MODEL stopped working
      // this solution is from Stack Overflow
      {
      id: "a403429f2ddf4b49b307e318f00e528b",
      version: "34ce21a40cc24b6b96ffee54aabff139",
    },
     this.state.input)
    .then(response => {
      if (response) {
        console.log(response);
        fetch('http://localhost:3001/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
        })
      })
        // keep track of how many photos the user has submitted:
        .then(response => response.text())
        .then(count => {
          console.log("count:", count);
          this.setState(Object.assign(this.state.user, { entries: count }))
        })
    }
      this.displayFaceBox(this.calculateFaceLocation(response))
     //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    .catch(err => console.log(err));
  })
}
 
 onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({isSignedIn: false})
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
 }
      

  render() {
    return (
      <div className="App">
        <ParticlesBg type="cobweb" color="#B3F926" bg={true} />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {/*must use curly braces around conditional statements
        inside render?*/}
        { this.state.route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
            this.state.route === 'signin'
          ?
            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :
            <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
           
            )
          }
      </div>
    );
  }
}

export default App;
