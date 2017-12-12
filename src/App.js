'use strict';

import React, { Component } from 'react'; //import React Component
import './App.css';

//Forms 
import SignUpForm from './SignUp';
import SignInForm from './SignIn';

//Chat functionality
import { ConversationsList, NavDrawer } from './Chat'
import { ChatRoom } from './ChatRoom'

//Firebase Imports
import firebase, { storage } from 'firebase/app';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import {
  Button, Card, CardSubtitle, Input,
  Container, Row, Col, ButtonGroup
} from 'reactstrap';


//Material UI Imports
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

//md5 Import
import md5 from 'md5';

//Additional Feature imports
import { EditPage } from './EditPage'
import { MatchPage } from './MatchPage'

/* Main app component for this React application, holds functions that will be passed to child components
and the state of stored objects */
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      navOpen: false,
      filterOpen: false,
      conversations: [],
      users: [],
      checkboxesSelected: ["Artists", "Albums", "Songs"],
      ageRange: [0, 100],
      profileInput: {}
    };

  }

  // Initialize firebase authentication and database functionality on component mount
  componentDidMount() {

    this.authUnRegFunc = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) { //someone logged in
        this.setState({ user: firebaseUser, loading: false, login: true });
        this.profileRef.on("value", (snapshot) => {
          
          this.setState({ userProfile: snapshot.val() });
        });
      }
      else { //someone logged out 
        this.setState({ user: null, userProfile: null, loading: false, login: false });
      }

    });

   
    this.usersRef = firebase.database().ref("users");
    this.usersRef.on("value", (snapshot) => {
      if (this.state.user) {
        
        this.profileRef = firebase.database().ref("users/" + this.state.user.uid);
        this.profileRef.on("value", (snapshot) => {
          
          this.setState({ userProfile: snapshot.val() });
        });

      }

      this.setState({ users: snapshot.val() });

      // ADDED FROM CHAT APP BELOW
      this.convoRef = firebase.database().ref("conversations");
      this.convoRef.on("value", (snapshot) => {
        if (snapshot.val() !== null) {
          this.setState({ conversations: snapshot.val() });
        }
      })

      this.userLikesRef = firebase.database().ref("userLikes");
      this.userLikesRef.on("value", (snapshot) => {
        this.setState({ userLikes: snapshot.val() });
      })

    })


  }

  // Make sure to turn off our listeners when the component is unmounting from the page
  componentWillUnmount() {
    this.authUnRegFunc();
    this.usersRef.off();
    this.profileRef.off();
    this.convoRef.off();
  }

  handleLike(uid, name) {
  
    if (Object.keys(this.state.userLikes).includes(uid)) {
      //case where B exists in userLikes

      this.userLikesRef.child(uid).child(this.state.user.uid).child("likedBack").set(true);


      //make a new object for A that includes B with liked back TRUE
      this.userLikesRef.child(this.state.user.uid).child(uid).child("likedBack").set(true)
        .then(() => {


          Object.keys(this.state.userLikes[this.state.user.uid]).map((key) => {
            if (this.state.userLikes[this.state.user.uid][key]["likedBack"]) {
              
              let newConvo = {
                'name': this.state.user.displayName + '+' + this.state.users[key]["name"],
                'userId1': this.state.user.uid,
                'username1': this.state.user.displayName,
                'userId2': key,
                'username2': this.state.users[key]["name"],
                'lastMessage': "none",
                'lastUser': "none",
                'messages': 0
              };

              this.convoRef.push(newConvo);
            }
          })
        })

    } else {
      //case where B is not in userLikes

      //make a new object for A that includes B with liked back FALSE
      this.userLikesRef.child(this.state.user.uid).child(uid).child("likedBack").set(false);

    }

  }

  // A callback function for registering new users in the chat
  handleSignUp(email, password, handle, avatar, userAge, userImg, userImg2) {
  
    this.setState({ errorMessage: null, profileInput: { name: handle, age: parseInt(userAge), img: userImg, img2: userImg2} }); //clear any old errors
    let gravatarImg = "https://www.gravatar.com/avatar/" + md5(email);

  
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then((firebaseUser) => {
        let promise = firebaseUser.updateProfile({ displayName: handle, photoURL: gravatarImg, age: userAge })
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

    this.profileRef.on("value", (snapshot) => {
      this.setState({ userProfile: snapshot.val() });
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

  handleDelete(type, key) {
    this.profileRef.child(type + '/' + key).set(null);
  }

  // Used to toggle the navigation bar from the header 
  toggleNav() {
    this.setState({ navOpen: !this.state.navOpen })
  }

  toggleFilter() {
    this.setState({ filterOpen: !this.state.filterOpen })
  }

  handleCheckBox(selected) {
    const index = this.state.checkboxesSelected.indexOf(selected);
    if (index < 0) {
      this.state.checkboxesSelected.push(selected);
    } else {
      this.state.checkboxesSelected.splice(index, 1);
    }
    this.setState({ checkboxesSelected: [...this.state.checkboxesSelected] });
  }

  handleAgeChange(type, input) {
    //validate input as number
    if (input) {
      //change correct age (min vs. max)
      if (type === "min_change") {
        this.setState({ ageRange: [parseInt(input), this.state.ageRange[1]] })
      } else if (type === "max_change") {
        this.setState({ ageRange: [this.state.ageRange[0], parseInt(input)] })
      }
    }
  }

  addItem(id, type) {


    let url = "https://itunes.apple.com/lookup?id=" + id

    let returnedPromise = fetch(url)  //start the download
      .then(function (response) {  //when done downloading
        let dataPromise = response.json();  //start encoding into an object
        return dataPromise;  //hand this Promise up
      })
      .then((data) => {

        if (type === "musicArtist") {
          firebase.database().ref("users/" + this.state.user.uid).child("artists").push(data.results[0]);
        }
        else if (type === "album") {
          this.profileRef.child("albums").push(data.results[0]);
        }
        else if (type === "song") {
          this.profileRef.child("songs").push(data.results[0]);
        }

      })
      .catch(function (error) {
        //do something if AJAX request fails
        console.log(error);
      })

    return returnedPromise;
  }


  render() {
    let content = null; //content to render
    let conversations = Object.keys(this.state.conversations).map(obj => this.state.conversations[obj]["id"] = obj);
    conversations = Object.keys(this.state.conversations).map(obj => this.state.conversations[obj]);

    // Rendering content for when the route is signing up
    let renderSignUp = (routerProps) => {
      return <div>
        <TopHeader
          className="mb-4"
          title="Sign Up!"
          toggleNavCallback={() => this.toggleNav()}
          toggleFilterCallback={() => this.toggleFilter()}
        />
        <h1> Sign Up </h1>
        <SignUpForm
          signUpCallback={(e, p, h, a, age, img, img2) => this.handleSignUp(e, p, h, a, age, img, img2)}
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
          toggleFilterCallback={() => this.toggleFilter()}
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
    let renderMatchPage = (routerProps) => {

      if (this.state.user) {

        return <div className="hundred_height">
          <TopHeader
            className="mb-4"
            title={this.state.user.displayName + "'s Matches"}
            toggleNavCallback={() => this.toggleNav()}
            toggleFilterCallback={() => this.toggleFilter()}
          />
          <MatchPage
            users={this.state.users}
            user={this.state.user}
            userLikes={this.state.userLikes}
            checkboxesSelected={this.state.checkboxesSelected}
            profile={this.state.userProfile}
            signOutCallback={() => this.handleSignOut()}
            handleLikeCallback={(uid, name) => this.handleLike(uid, name)}
            ageRange={this.state.ageRange} />
        </div>
      } else {
        return <Redirect to='/login' />
      }

    };


    let renderEdit = (routerProps) => {
      if (this.state.user) {
        return <div className="hundred_height">
          <TopHeader
            className="mb-4"
            title={"Edit Profile"}
            toggleNavCallback={() => this.toggleNav()}
            toggleFilterCallback={() => this.toggleFilter()}
          />
          <EditPage
            users={this.state.users}
            user={this.state.user}
            profile={this.state.userProfile}
            usersRef={this.usersRef}
            profileInput={this.state.profileInput}
            handleDeleteCallback={(key, type) => this.handleDelete(key, type)}
            addItemCallback={(id, type) => this.addItem(id, type)} />
        </div>
      } else {
        return <Redirect to='/login' />
      }

    };

    let renderConversation = (routerProps) => {

      if (this.state.user && this.state.users) {

        return <div>
          <TopHeader
            className="mb-4"
            title={routerProps.match.params.convoName}
            toggleNavCallback={() => this.toggleNav()}
            toggleFilterCallback={() => this.toggleFilter()}
          />
          <ChatRoom
            {...routerProps}
            user={this.state.user}
            conversations={conversations}
          />
        </div>
      } else {
        return <Redirect to='/login' />
      }

    };

    content = (

      <div className="container">

        <Switch>
          <Route exact path='/' render={renderMatchPage} />
          <Route exact path='/conversations' render={(routerProps) => (
            <Redirect to="/" />)} />
          <Route exact path='/login' render={renderSignIn} />
          <Route exact path='/join' render={renderSignUp} />
          <Route exact path='/edit' render={renderEdit} />
          {/* Added from chat app below*/}
          <Route path='/conversations/:Id' render={renderConversation} />

        </Switch>

        {/*added from chat app below*/}
        <NavDrawer
          open={this.state.navOpen}
          toggleCallback={() => this.toggleNav()}
          state={this.state}
          user={this.state.user}
          conversationList=
          {<ConversationsList
            user={this.state.user}
            users={this.state.users}
            messages={this.state.messages}
            conversations={conversations}
            toggleCallback={() => this.toggleNav()} />}
          signOutCallback={() => this.handleSignOut()}
          sendMessageCallback={(name) => this.sendMessage()} />

        <FilterDrawer
          open={this.state.filterOpen}
          userLikes={this.state.userLikes}
          users={this.state.users}
          user={this.state.user}
          toggleCallback={() => this.toggleFilter()}
          state={this.state}
          checkboxCallback={(selected) => this.handleCheckBox(selected)}
          handleAgeChangeCallback={(type, input) => this.handleAgeChange(type, input)}
        />

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

// Consistent header on top of the application which is used to open the nav bar and provide general information
class TopHeader extends Component {
  render() {

    return (
      <MuiThemeProvider>
        <AppBar
          className="mb-2"
          title={this.props.title}
          onLeftIconButtonTouchTap={() => this.props.toggleNavCallback()}
          iconElementRight={<IconButton role="button" aria-label="show more"><MoreVertIcon /></IconButton>}
          onRightIconButtonTouchTap={() => this.props.toggleFilterCallback()}
        />
      </MuiThemeProvider>
    );
  }
}

class FilterDrawer extends Component {

  render() {
    let pendingLikesCards = [];
    if (this.props.userLikes && this.props.user && this.props.userLikes[this.props.user.uid]) {
      pendingLikesCards = Object.keys(this.props.userLikes[this.props.user.uid]).map((innerKey) => {
        let userSentLikes = this.props.userLikes[this.props.user.uid];

        if (!userSentLikes[innerKey].likedBack) {
          return <Card className="mb-2">
            <CardSubtitle> {this.props.users[innerKey].name} </CardSubtitle>
          </Card>;
        }
      });
    }

    return (
      <MuiThemeProvider>
        <div id="filter_outer_container">
          <Drawer
            className="drawer"
            open={this.props.open}
            openSecondary={true}
          >
            <AppBar
              title="More"
              iconElementLeft={<IconButton aria-label="close navigation" role="button"><NavigationClose /></IconButton>}
              onLeftIconButtonTouchTap={() => this.props.toggleCallback()}
            />
            <div id="filter_inner_container">
              { // Prompt user to log in if they are not
                !this.props.state.user &&
                <p className="alert alert-info">Please Log In First!</p>}

              { //Content shown when logged in
                this.props.state.user &&
                <Container className="m-1">

                  <h2> Filters: </h2>
                  <Row className="mb-4">
                    <Col>
                      <p className="filter_label mb-0"> Match Basis: </p>
                      <ButtonGroup>
                        <Button role="button" aria-label="select artist" color="primary" onClick={() => this.props.checkboxCallback("Artists")} active={this.props.state.checkboxesSelected.includes("Artists")}>Artists</Button>
                        <Button role="button" aria-label="select albums" color="primary" onClick={() => this.props.checkboxCallback("Albums")} active={this.props.state.checkboxesSelected.includes("Albums")}>Albums</Button>
                        <Button role="button" aria-label="select songs" color="primary" onClick={() => this.props.checkboxCallback("Songs")} active={this.props.state.checkboxesSelected.includes("Songs")}>Songs</Button>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <Row className="mb-4">
                    <p className="filter_label"> Age: </p>

                    <Col className="pr-0">
                      <Input role="input" aria-label="minium age" type="number" id="minAge" min="18" placeholder="18" onChange={(event) => this.props.handleAgeChangeCallback("min_change", event.target.value)} />
                    </Col>
                    <Col className="m-0 p-0"> <p className="secondary_text">to</p> </Col>
                    <Col className="pl-0">
                      <Input role="input" aria-label="maximum age"  type="number" id="maxAge" placeholder="100" onChange={(event) => this.props.handleAgeChangeCallback("max_change", event.target.value)} />
                    </Col>
                  </Row>

                  <h2> Pending Likes: </h2>
                  <Row>
                    {pendingLikesCards}
                  </Row>

                </Container>

              }
            </div>
          </Drawer>
        </div>
      </MuiThemeProvider>
    );
  }
}


export default App;
