import React, { Component } from 'react'; //import React Component
import './App.css';

//Forms 
import SignUpForm from './SignUp';
import SignInForm from './SignIn';

//Firebase Imports
import firebase, { storage } from 'firebase/app';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';
import { Button, Card, CardText, CardImg, CardSubtitle, CardBody, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

//Material UI Imports
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';

//md5 Import
import md5 from 'md5';

//Additional Feature imports
import Remarkable from 'remarkable';
import Markdown from 'react-remarkable';
import renderHTML from 'react-render-html';


/* Main app component for this React application, holds functions that will be passed to child components
and the state of stored objects */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      navOpen: false,
      users: [],
    };
  }

  // Initialize firebase authentication and database functionality on component mount
  componentDidMount() {

    this.authUnRegFunc = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) { //someone logged in

        this.setState({ user: firebaseUser, loading: false });
      }
      else { //someone logged out 
        this.setState({ user: null, loading: false });
      }

    });

    this.usersRef = firebase.database().ref("users");
    this.usersRef.on("value", (snapshot) => {
      this.profileRef = firebase.database().ref("users/" + this.state.user.uid);
      this.profileRef.on("value", (snapshot) => {
        this.setState({ userProfile: snapshot.val() });
      });

      this.setState({ users: snapshot.val() });
    })


  }

  // Make sure to turn off our listeners when the component is unmounting from the page
  componentWillUnmount() {
    this.authUnRegFunc();
    this.messagesRef.off();
    this.convoRef.off();
  }

  // A callback function for registering new users in the chat
  handleSignUp(email, password, handle, avatar) {
    this.setState({ errorMessage: null }); //clear any old errors
    let gravatarImg = "https://www.gravatar.com/avatar/" + md5(email);

    /* TODO: sign up user here */
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then((firebaseUser) => {
        let promise = firebaseUser.updateProfile({ displayName: handle, photoURL: gravatarImg })
        return promise;
      })
      .catch((err) => this.setState({ errorMessage: err.message }))
      .then(() => {
        this.setState({ email: '', password: '' });
      });

  }

  // A callback function for logging in existing users
  handleSignIn(email, password) {
    this.setState({ errorMessage: null }); //clear any old errors

    /* TODO: sign in user here */
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((err) => {
        this.setState({ errorMessage: err.message })
      });

  }

  // A callback function for logging out the current user
  handleSignOut() {
    this.setState({ errorMessage: null, navOpen: false }); //clear any old errors

    /* TODO: sign out user here */
    firebase.auth().signOut()
      .catch((err) => {
        this.setState({ errorMessage: err.message })
      });

  }

  // Sends a new message to the desired conversation with the inputted text
  sendMessage() {
    // TODO: add a new task and sen it to firebase
    // TODO: if you don't see a task appearing, look at the console
    //       and be sure to set up open security rules
    //       https://info343.github.io/firebase.html#security-rules
    let newSong = {
      "wrapperType": "artist",
      "artistType": "Artist",
      "artistName": "Drake",
      "artistLinkUrl": "https://itunes.apple.com/us/artist/drake/271256?uo=4",
      "artistId": 271256,
      "amgArtistId": 905792,
      "primaryGenreName": "Hip-Hop/Rap",
      "primaryGenreId": 18
    }

    this.profileRef.child("artists").push(
      newSong
    )

  }

  // Used to toggle the navigation bar from the header 
  toggleNav() {
    this.setState({ navOpen: !this.state.navOpen })
  }


  render() {
    let content = null; //content to render

    // Rendering content for when the route is signing up
    let renderSignUp = (routerProps) => {

      return <div>
        <TopHeader
          className="mb-4"
          title="Sign Up!"
          toggleNavCallback={() => this.toggleNav()}
        />
        <h1> Sign Up </h1>
        <SignUpForm
          signUpCallback={(e, p, h, a) => this.handleSignUp(e, p, h, a)}
          user={this.state.user}
        />
      </div>

    };

    // Content being returned for the sign in route
    let renderSignIn = (routerProps) => {

      return <div>
        <TopHeader
          className="mb-4"
          title="Sign in!"
          toggleNavCallback={() => this.toggleNav()}
        />
        <SignInForm
          signInCallback={(e, p) => this.handleSignIn(e, p)}
          user={this.state.user}
        />
        <Button role="button" color="info" className="mr-2">
          <Link to='/join'>Sign Up</Link>
        </Button>
      </div>

    };

    // Welcome page that will be shown on the welcome route after sign in
    let renderWelcome = (routerProps) => {

      if (this.state.user) {
        return <div className="hundred_height">
          <TopHeader
            className="mb-4"
            title={"Welcome " + this.state.user.displayName + "!"}
            toggleNavCallback={() => this.toggleNav()}
          />
          <WelcomePage
            users={this.state.users}
            profile={this.state.userProfile}
            signOutCallback={() => this.handleSignOut()} />
        </div>
      } else {
        return <Redirect to='/login' />
      }

    };

    content = (

      <div className="container">

        <Switch>
          <Route exact path='/' render={renderWelcome} />
          <Route exact path='/login' render={renderSignIn} />
          <Route exact path='/join' render={renderSignUp} />
        </Switch>

        <NavDrawer
          open={this.state.navOpen}
          toggleCallback={() => this.toggleNav()}
          state={this.state}
          signOutCallback={() => this.handleSignOut()}
          sendMessageCallback={(name) => this.sendMessage()} />

      </div>

    );


    if (this.state.loading) {
      return (
        <div className="text-center">
          <i className="fa fa-spinner fa-spin fa-3x" aria-label="Connecting..."></i>
        </div>
      );
    } else {
      return (
        <div>
          {this.state.errorMessage &&
            <p className="alert alert-danger">{this.state.errorMessage}</p>
          }
          {content}
        </div>
      );
    }
  }
}

// A component to display a welcome message to the user upon signing in
class WelcomePage extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  toggle() {
    this.setState({ open: !this.state.open })
  }

  render() {

    return (
      <header className="container">

        <Card>
          <CardImg top width="100%" src="https://placeholdit.imgix.net/~text?txtsize=33&txt=318%C3%97180&w=318&h=180" alt="Card image cap" />
          <CardBody>
            <CardTitle>Card title</CardTitle>
            <CardSubtitle>Card subtitle</CardSubtitle>
            <CardText>Some quick example text to build on the card title and make up the bulk of the card's content.</CardText>
            <Button>Button</Button>
          </CardBody>
        </Card>

      </header>
    );
  }
}

/* Renders a list of conversations that currently have messages in them, along with some basic
information associated with those conversations such as the last message & # of messages */


// Consistent header on top of the application which is used to open the nav bar and provide general information
class TopHeader extends Component {
  render() {

    return (
      <MuiThemeProvider>
        <AppBar
          className="mb-4"
          title={this.props.title}
          onLeftIconButtonTouchTap={() => this.props.toggleNavCallback()}
        />
      </MuiThemeProvider>
    );
  }
}

/* Navigation Drawer component holding access to all the conversations, as well as the ability to create
new conversations, go back to home, or logout. */
class NavDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modal: false,
      newConvoValue: ''
    };

    this.toggleModal = this.toggleModal.bind(this);
  }

  // Used to toggle the popup modal that prompts for a new conversation
  toggleModal() {
    this.setState({
      modal: !this.state.modal,
      backdrop: true
    });
  }

  // Callback for when user is inputting a name of a new conversation
  handleChange(event) {
    this.setState({ newConvoValue: event.target.value });
  }

  render() {

    return (
      <MuiThemeProvider>
        <div>
          <Drawer
            className="drawer"
            open={this.props.open}
          >
            <AppBar
              title="Conversations"
              iconElementLeft={<IconButton role="button"><NavigationClose /></IconButton>}
              onLeftIconButtonTouchTap={() => this.props.toggleCallback()}
            />

            { // Prompt user to log in if they are not
              !this.props.state.user &&
              <p className="alert alert-info">Please Log In First!</p>}

            { //Content shown when logged in
              this.props.state.user &&
              <div>

                <div>
                  <Link to="/conversations">
                    <Button
                      role="button"
                      color="info"
                      onClick={() => console.log(this.props.state)}>
                      Home
                  </Button>
                  </Link>

                  <Button
                    role="button"
                    color="info"
                    onClick={() => this.props.sendMessageCallback()}>
                    Fill
                  </Button>


                  <Link to="/">
                    <Button
                      role="button"
                      color="warning"
                      onClick={() => this.props.signOutCallback()}>
                      Log Out
                  </Button>
                  </Link>
                </div>
              </div>
            }
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
