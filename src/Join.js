import React, { Component } from 'react'; //import React Component
import SignUpForm from './SignUp'; //does this work?!
import firebase from 'firebase/app';
import { Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';
import md5 from 'md5';
import Gravatar from 'react-gravatar';

class Join extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //A callback function for registering new users
  handleSignUp(email, password, handle, avatar) {
    this.setState({ errorMessage: null }); //clear any old errors

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((firebaseUser) => {
        return firebaseUser.updateProfile({
          displayName: handle,
          photoURL: "https://gravatar.com/avatar/" + md5(email)
        }).catch((error) => { //report any errors
          this.setState({ errorMessage: error.message })
        })
      })
      .catch((error) => { //report any errors
        this.setState({ errorMessage: error.message })
      });

  }

  //A callback function for logging out the current user
  handleSignOut() {
    this.setState({ errorMessage: null }); //clear any old errors
    firebase.auth().signOut().catch((error) => { //report any errors
      this.setState({ errorMessage: error.message })
    });
  }


  render() {
    let content = null; //content to render

    if (!this.props.user) { //if logged out, show signup form
      content = (
        <div className="container">
          <h1>Sign Up</h1>
          <SignUpForm
            signUpCallback={(e, p, h, a) => this.handleSignUp(e, p, h, a)}
          />
        </div>
      );
    }
    else { //if logged in, show welcome message
      content = (
        <div>
          <Redirect exact to='/' />
        </div>
      );
    }
    let display;
    if (this.props.loading) {
      display = <div className="text-center">
        <i className="fa fa-spinner fa-spin fa-3x" aria-label="Connecting..."></i>
      </div>;
    }
    return (
      <div>
        {display}
        {this.state.errorMessage &&
          <p className="alert alert-danger">{this.state.errorMessage}</p>
        }
        {content}
      </div>
    );
  }
}

export default Join;