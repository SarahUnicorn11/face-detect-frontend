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
      isSignedIn: false
    };
  }

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

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {
    this.setState({imageUrl: this.state.input})
    console.log('click');
    app.models
    .predict(
    Clarifai.FACE_DETECT_MODEL, this.state.input
    ).then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
     //console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
    .catch(err => console.log(err));
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
              <Rank />
              <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
              <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
            </div>
          : (
            this.state.route === 'signin'
          ?
            <SignIn onRouteChange={this.onRouteChange}/>
          :
            <Register onRouteChange={this.onRouteChange}/>
           
            )
          }
      </div>
    );
  }
}

export default App;
