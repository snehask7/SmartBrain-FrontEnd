import React,{Component} from 'react';
import Navigation from './Components/Navigation/Navigation';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Logo from './Components/Logo/Logo';
import Clarifai from 'clarifai';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Register from './Components/Register/Register';
import Particles from 'react-particles-js';
import SignIn from './Components/SignIn/SignIn';

import './App.css';
const app=new Clarifai.App({
  apiKey:'d946ffbdf438480a8197b49ced9268a4'
});

//for the particles bg

const particlesOptions = {
  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        value_area: 400
      }
    }
  }
}

const initialState={ input: '',
                     imageURL:'', 
                     box: {}, 
                     route: 'SignIn',
                     isSignedIn: false,
                     user:{ email: '',
                            id: '',
                            name: '',
                            entries: 0,
                            joined: ''
                         }
                  }

class App extends Component{ 
  constructor(){ 
    super(); 
    this.state=initialState;
 }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  //onInputChange is a property of app //when urlentered 

  onInputChange=(event) =>{ 
      this.setState({input: event.target.value}); 
      // console.log(this.state.input);
    }

  //to make the box
  calculateFaceLocation=(data) => {
    const clarifaiface = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width,height);
    // console.log(clarifaiface);
    return {
      leftCol: (clarifaiface.left_col * width),
      topRow: clarifaiface.top_row * height,
      rightCol: width-(clarifaiface.right_col * width),
      bottomRow: height-(clarifaiface.bottom_row * height)
    }
  }


displaybox =(box) =>{

  this.setState({box :box});
    console.log(this.state.box);
}
// console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
  //when url submitted
  onButtonSubmit=()=>{
    this.setState({imageURL: this.state.input});
    console.log(this.state.user);
    app.models
      .predict(
            Clarifai.FACE_DETECT_MODEL,
             this.state.input)
      .then(response=>  {
        if (response) {
          fetch('https://fierce-anchorage-15436.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count=> {
             this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
        }
        this.displaybox(this.calculateFaceLocation(response))
      })
     .catch(err => console.log(err));
  }

  onRouteChange=(route)=>{
    if(route === 'signout'){
      this.setState(initialState)
    }
    else if(route === 'home')
    {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }
    render(){
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { this.state.route ==='home'
          ? 
          <div>
            <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>

          <FaceRecognition box={this.state.box} imageURL={this.state.imageURL} />
          </div>
          : (
              this.state.route === 'SignIn'
              ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
}

export default App;
