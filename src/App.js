import React, { Component } from 'react'; //import React Component
import './App.css';
import like from './img/like.png';
import skip from './img/skip.png';
//Forms 
import SignUpForm from './SignUp';
import SignInForm from './SignIn';

//Firebase Imports
import firebase, { storage } from 'firebase/app';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';
import { Button, Card, CardText, CardImg, CardSubtitle, CardBody, CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { Container, Row, Col, ButtonGroup } from 'reactstrap';

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
        this.setState({ user: null, userProfile: null, loading: false });
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
    this.usersRef.off();
    this.profileRef.off();
  }

  handleLike(uid, name) {

    //Adding current user to liked user's list:
    this.usersRef.child(uid).child("likes").push({ uid: this.state.user.uid, name: this.state.user.displayName })
      .catch(err => console.log(err));;

    //Adding liked user to current user's list:
    this.usersRef.child(this.state.user.uid).child("likes").push({ uid: uid, name: name })
      .catch(err => console.log(err));;

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
      "wrapperType": "collection",
      "collectionType": "Album",
      "artistId": 271256,
      "collectionId": 1108737195,
      "amgArtistId": 905792,
      "artistName": "Drake",
      "collectionName": "Views",
      "collectionCensoredName": "Views",
      "artistViewUrl": "https://itunes.apple.com/us/artist/drake/271256?uo=4",
      "collectionViewUrl": "https://itunes.apple.com/us/album/views/1108737195?uo=4",
      "artworkUrl60": "http://is2.mzstatic.com/image/thumb/Music60/v4/54/06/a3/5406a3ee-262c-b1d4-66be-9d333fe54bae/source/60x60bb.jpg",
      "artworkUrl100": "http://is2.mzstatic.com/image/thumb/Music60/v4/54/06/a3/5406a3ee-262c-b1d4-66be-9d333fe54bae/source/100x100bb.jpg",
      "collectionPrice": 13.99,
      "collectionExplicitness": "explicit",
      "contentAdvisoryRating": "Explicit",
      "trackCount": 21,
      "copyright": "℗ 2016 Young Money Entertainment/Cash Money Records",
      "country": "USA",
      "currency": "USD",
      "releaseDate": "2016-04-29T07:00:00Z",
      "primaryGenreName": "Hip-Hop/Rap"
    }
    this.profileRef.child("albums").push(
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
            title={this.state.user.displayName + "'s Matches"}
            toggleNavCallback={() => this.toggleNav()}
          />
          <MatchPage
            users={this.state.users}
            user={this.state.user}
            profile={this.state.userProfile}
            signOutCallback={() => this.handleSignOut()}
            handleLikeCallback={(uid, name) => this.handleLike(uid, name)} />
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
        <div className="hundred_height">
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
class MatchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };

  }

  toggle() {
    this.setState({ open: !this.state.open })
  }

  render() {
    let name = ""
    let age = "";
    let displayCollection = [];
    let matchedProfiles = {};

    //matchmaking:
    if (this.props.users) {
      if (this.props.profile) {
        let profileArtistsIds = [];
        let profileAlbumsIds = [];
        let profileSongsIds = [];

        //getting current user's artists
        Object.keys(this.props.profile.artists).map((artistKey) => {
          let artist = this.props.profile.artists[artistKey];
          profileArtistsIds.push(artist.artistId);
        });

        //getting current user's albums
        Object.keys(this.props.profile.albums).map((albumKey) => {
          let album = this.props.profile.albums[albumKey];
          profileAlbumsIds.push(album.collectionId);
        });

        //getting current user's songs
        Object.keys(this.props.profile.songs).map((songKey) => {
          let song = this.props.profile.songs[songKey];
          profileSongsIds.push(song.trackId);
        });

        //find matches
        Object.keys(this.props.users).map((userKey) => {
          if (this.props.users[userKey].uid !== this.props.user.uid) {
            let currentProfile = this.props.users[userKey];
            let matchDetails = {
              matchedArtistIds: [],
              matchedAlbumIds: [],
              matchedSongIds: [],
              matchedArtists: [],
              matchedAlbums: [],
              matchedSongs: [],
            };

            //matching based on artists
            Object.keys(currentProfile.artists).map((artistKey) => {
              let artist = currentProfile.artists[artistKey];

              if (profileArtistsIds.includes(artist.artistId)) {

                if (!matchDetails.matchedArtistIds.includes(artist.artistId)) {
                  matchDetails.matchedArtists.push(artist);
                  matchDetails.matchedArtistIds.push(artist.artistId);
                }

              }

            });

            //matching based on albums
            Object.keys(currentProfile.albums).map((albumKey) => {
              let album = currentProfile.albums[albumKey];

              if (profileAlbumsIds.includes(album.collectionId)) {

                if (!matchDetails.matchedArtistIds.includes(album.collectionId)) {
                  matchDetails.matchedAlbums.push(album);
                  matchDetails.matchedAlbumIds.push(album.collectionId);
                }

              }

            });

            //matching based on songs
            Object.keys(currentProfile.songs).map((songKey) => {
              let song = currentProfile.songs[songKey];

              if (profileSongsIds.includes(song.trackId)) {

                if (!matchDetails.matchedSongIds.includes(song.trackId)) {
                  matchDetails.matchedSongs.push(song);
                  matchDetails.matchedSongIds.push(song.trackId);
                }

              }
            });

            //construct a match
            let newMatchProfile = Object.assign({}, currentProfile, matchDetails);

            //assign the match
            matchedProfiles[currentProfile.uid] = newMatchProfile;
            console.log(matchedProfiles);
          }
        });
      }
    }

    let matchedCards = Object.keys(matchedProfiles).map((key) => {
      return <MatchedCard
        key={key}
        profile={matchedProfiles[key]}
        user={this.props.user}
        handleLikeCallback={(uid, name) => this.props.handleLikeCallback(uid, name)} />
    })

    return (
      <header className="container">

        {matchedCards}

      </header>
    );
  }
}

class MatchedCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      rSelected: "Albums",
    };
  }

  onRadioBtnClick(rSelected) {
    console.log(rSelected);
    this.setState({ rSelected });
  }

  render() {

    let name = ""
    let age = "";
    let displayCollection = [];

    if (this.props.profile) {
      if (this.props.profile.albums) {

        name = this.props.profile.name;
        age = this.props.profile.age;

        if (this.state.rSelected === "Albums") {
          displayCollection = Object.keys(this.props.profile.albums).map((albumKey) => {
            let album = this.props.profile.albums[albumKey];
            return <Card key={albumKey} className="music_card">
              <CardImg top src={album.artworkUrl100} alt="Card image cap" />
              <CardTitle>{album.collectionName}</CardTitle>
              <CardSubtitle>{album.artistName}</CardSubtitle>
            </Card>
          });
        }

        if (this.state.rSelected === "Songs") {
          displayCollection = Object.keys(this.props.profile.songs).map((songKey) => {
            let song = this.props.profile.songs[songKey];
            return <Card key={songKey} className="music_card">
              <CardImg top src={song.artworkUrl100} alt="Card image cap" />
              <CardTitle>{song.trackName}</CardTitle>
              <CardSubtitle>{song.artistName}</CardSubtitle>
            </Card>
          });
        }

        if (this.state.rSelected === "Artists") {
          displayCollection = Object.keys(this.props.profile.artists).map((artistKey) => {
            let artist = this.props.profile.artists[artistKey];
            return <Card key={artistKey} className="music_card">
              <CardTitle>{artist.artistName}</CardTitle>
              <CardSubtitle>{artist.primaryGenreName}</CardSubtitle>
            </Card>
          });
        }
      }
    }

    return (
      <Card>
        <div className="img_container">
          <CardImg top className="person_img" src="https://images.pexels.com/photos/247917/pexels-photo-247917.jpeg?w=1260&h=750&dpr=2&auto=compress&cs=tinysrgb" alt="Card image cap" />
        </div>
        <CardBody>
          <CardTitle>{name}</CardTitle>
          <CardSubtitle>Age: {age}</CardSubtitle>
          <div className="card_inner_content">
            <ButtonGroup>
              <Button color="primary" onClick={() => this.onRadioBtnClick("Artists")} active={this.state.rSelected === "Artists"}>Artists</Button>
              <Button color="primary" onClick={() => this.onRadioBtnClick("Albums")} active={this.state.rSelected === "Albums"}>Albums</Button>
              <Button color="primary" onClick={() => this.onRadioBtnClick("Songs")} active={this.state.rSelected === "Songs"}>Songs</Button>
            </ButtonGroup>
            <Container className="card_container">

              <Row className="hundred_height" >
                <Col xs="12">
                  {this.state.rSelected + ":"}

                  <div className="container-outer">
                    <div className="container-inner">
                      {displayCollection}
                    </div>
                  </div>

                </Col>
              </Row>
            </Container>

            <ButtonGroup className="action_buttons">
              <Button color="link" onClick={() => console.log("clicked")}><img src={skip} /></Button>
              <Button color="link" onClick={() => this.props.handleLikeCallback(this.props.profile.uid, this.props.profile.name)} ><img id="like" src={like} /></Button>
            </ButtonGroup>
          </div>
        </CardBody>
      </Card>

    )

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
          className="mb-2"
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
