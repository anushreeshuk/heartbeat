import React, { Component } from 'react'; //import React Component
import ReactDOM from 'react-dom';
import './App.css';
import like from './img/like.png';
import skip from './img/skip.png';
//Forms 
import SignUpForm from './SignUp';
import SignInForm from './SignIn';

//Firebase Imports
import firebase, { storage } from 'firebase/app';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';
import {
  Button, Card, CardText, CardImg, CardSubtitle, CardBody,
  CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Input,
  Container, Row, Col, ButtonGroup, Label, FormGroup,
  Carousel,
  CarouselItem,
  CarouselControl,
  CarouselIndicators,
  CarouselCaption
} from 'reactstrap';


//Material UI Imports
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';

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
      filterOpen: false,
      users: [],
      checkboxesSelected: ["Artists", "Albums", "Songs"],
      ageRange: [0, 100],
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

    this.usersRef.child(uid).child("likes/" + this.state.user.uid).set(this.state.user.displayName)
      .catch(err => console.log(err));;

    //Adding liked user to current user's list:
    this.usersRef.child(this.state.user.uid).child("likes/" + uid).set(name)
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

  handleEdit(e) {
    let card = e.parentElement;
    let title = card.querySelector('h4').textContent;

    let found = false;
    Object.keys(this.state.userProfile.albums).map((key) => {
      if (!found) {
        if (this.state.userProfile.albums[key].collectionName === title) {
          this.profileRef.child('albums/' + key).set(null);
          found = true;
        }
      }
    })

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
      "collectionId": 966997496,
      "amgArtistId": 905792,
      "artistName": "Drake",
      "collectionName": "If You're Reading This It's Too Late",
      "collectionCensoredName": "If You're Reading This It's Too Late",
      "artistViewUrl": "https://itunes.apple.com/us/artist/drake/271256?uo=4",
      "collectionViewUrl": "https://itunes.apple.com/us/album/if-youre-reading-this-its-too-late/966997496?uo=4",
      "artworkUrl60": "http://is3.mzstatic.com/image/thumb/Music3/v4/ff/e3/8b/ffe38bc5-3ad5-3da5-1089-b467770ab617/source/60x60bb.jpg",
      "artworkUrl100": "http://is3.mzstatic.com/image/thumb/Music3/v4/ff/e3/8b/ffe38bc5-3ad5-3da5-1089-b467770ab617/source/100x100bb.jpg",
      "collectionPrice": 9.99,
      "collectionExplicitness": "explicit",
      "contentAdvisoryRating": "Explicit",
      "trackCount": 17,
      "copyright": "℗ 2015 Cash Money Records Inc.",
      "country": "USA",
      "currency": "USD",
      "releaseDate": "2015-02-12T08:00:00Z",
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

  render() {
    let content = null; //content to render

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
            handleEditCallback={(e) => this.handleEdit(e)} />
        </div>
      } else {
        return <Redirect to='/login' />
      }

    };


    content = (

      <div className="container">

        <Switch>
          <Route exact path='/' render={renderMatchPage} />
          <Route exact path='/login' render={renderSignIn} />
          <Route exact path='/join' render={renderSignUp} />
          <Route exact path='/edit' render={renderEdit} />
        </Switch>

        <NavDrawer
          open={this.state.navOpen}
          toggleCallback={() => this.toggleNav()}
          state={this.state}
          signOutCallback={() => this.handleSignOut()}
          sendMessageCallback={(name) => this.sendMessage()} />

        <FilterDrawer
          open={this.state.filterOpen}
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

class AddSong extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: "",
      results: [],
      searchEntity: "musicArtist"
    };
  }

  fetchTrackList(searchTerm) {
    // toggleSpinner();
    let url = "https://itunes.apple.com/search?entity=" + this.state.searchEntity + "&limit=25&term=" + searchTerm;

    let returnedPromise = fetch(url)  //start the download
      .then(function (response) {  //when done downloading
        let dataPromise = response.json();  //start encoding into an object
        return dataPromise;  //hand this Promise up
      })
      .then(function (data) {  //when done encoding
        //do something with the data!!
        console.log('done')
        console.log(data);

        let songArray = data;
        document.querySelector('#records').innerHTML = '';
        if (songArray.results.length == 0 || songArray.results == null) {
          console.log("No results found");
        } else {
          let songArrayResult = songArray.results;

          let objects = Object.keys(songArrayResult).map((key) => {
            let item = songArrayResult[key];
            return <Card key={key} className="music_card">
              {item.artworkUrl100 &&
                <CardImg top src={item.artworkUrl100} alt="Card image cap" />}
              <CardTitle>{item.trackName}</CardTitle>
              <CardSubtitle>{item.artistName}</CardSubtitle>
              <Button color="success">Add</Button>
            </Card>
          });

          let div = document.createElement('div');
          ReactDOM.render(objects, document.querySelector("#records"));

          console.log(div);

          // let img = document.createElement('img');
          // img.src = songObject.artworkUrl100;
          // img.alt = songObject.trackName;
          // img.title = songObject.trackName;
          // document.querySelector('#records').append(img);
        }

      })
      .catch(function (error) {
        //do something if AJAX request fails
        console.log(error);
      })

    return returnedPromise;
  }

  renderSearchResults(songArray) {
    document.querySelector('#records').innerHTML = '';
    if (songArray.results.length == 0 || songArray.results == null) {
      console.log("No results found");
    } else {
      let songArrayResult = songArray.results;

      for (let song in songArrayResult) {
        this.renderTrack(songArrayResult[song]);
      }
    }
  }

  renderTrack(songObject) {
    let img = document.createElement('img');
    img.src = songObject.artworkUrl100;
    img.alt = songObject.trackName;
    img.title = songObject.trackName;
    document.querySelector('#records').append(img);
  }

  handleEntityChange(term) {
    //edge case 
    if (term === "Artists") {
      this.setState({ searchEntity: "musicArtist" });
    } else {
      let trimmedTerm = term.substring(0, term.length - 1);
      let cleanedTerm = trimmedTerm.substring(0, 1).toLowerCase()
        + trimmedTerm.substring(1, trimmedTerm.length);
      console.log(cleanedTerm);
      this.setState({ searchEntity: cleanedTerm })
    }
  }
  render() {

    return (
      <div>
        <form className="form-inline" method="GET" action="https://itunes.apple.com/search">
          <div className="form-group mr-3">
            <label htmlFor="searchQuery" className="mr-2">What do you want to hear?</label>
            <Input role="textbox" onChange={(event) => this.setState({ searchValue: event.target.value })} />
          </div>
          <FormGroup>
            <Label for="exampleSelect">Type:</Label>
            <Input type="select" name="select" id="exampleSelect" onChange={(event) => this.handleEntityChange(event.target.value)}>
              <option>Artists</option>
              <option>Albums</option>
              <option>Songs</option>
            </Input>
          </FormGroup>
          <button type="submit" className="btn btn-primary" onClick={() => this.fetchTrackList(this.state.searchValue)}>
            <i className="fa fa-music" aria-hidden="true"></i> Search!
        </button>
        </form>


        <div id="records">
          {this.state.results}
        </div>
      </div>

    );
  }
}

class EditPage extends Component {
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
    let displayCollection = [];
    let name = "";
    let age = "";

    if (this.props.profile) {
      if (this.props.profile.albums) {

        name = this.props.profile.name;
        age = this.props.profile.age;

        if (this.state.rSelected === "Albums") {
          displayCollection = Object.keys(this.props.profile.albums).map((albumKey) => {
            let album = this.props.profile.albums[albumKey];
            return <Card key={albumKey} className="edit_card">
              <CardImg top src={album.artworkUrl100} alt="Card image cap" />
              <CardTitle>{album.collectionName}</CardTitle>
              <CardSubtitle>{album.artistName}</CardSubtitle>
              <Button style={{ display: "inline-block" }} onClick={(event) => this.props.handleEditCallback(event.target)}>
                Delete
              </Button>
            </Card>
          });
        }

        if (this.state.rSelected === "Songs") {
          displayCollection = Object.keys(this.props.profile.songs).map((songKey) => {
            let song = this.props.profile.songs[songKey];
            return <Card key={songKey} className="edit_card">
              <CardImg top src={song.artworkUrl100} alt="Card image cap" />
              <CardTitle>{song.trackName}</CardTitle>
              <CardSubtitle>{song.artistName}</CardSubtitle>
              <Button style={{ display: "inline-block" }} onClick={(event) => this.props.handleEditCallback(event.target)}>
                Delete
              </Button>
            </Card>
          });
        }

        if (this.state.rSelected === "Artists") {
          displayCollection = Object.keys(this.props.profile.artists).map((artistKey) => {
            let artist = this.props.profile.artists[artistKey];
            return <Card key={artistKey} className="edit_card">
              <CardTitle>{artist.artistName}</CardTitle>
              <CardSubtitle>{artist.primaryGenreName}</CardSubtitle>
              <Button style={{ display: "inline-block" }} onClick={(event) => this.props.handleEditCallback(event.target)}>
                Delete
              </Button>
            </Card>
          });
        }
      }
    }

    return (
      <div className="center-outer-div">
        <div className="center-inner-div">
          <ButtonGroup>
            <Button color="primary" onClick={() => this.onRadioBtnClick("Artists")} active={this.state.rSelected === "Artists"}>Artists</Button>
            <Button color="primary" onClick={() => this.onRadioBtnClick("Albums")} active={this.state.rSelected === "Albums"}>Albums</Button>
            <Button color="primary" onClick={() => this.onRadioBtnClick("Songs")} active={this.state.rSelected === "Songs"}>Songs</Button>
          </ButtonGroup>
          <Container className="card_container">

            <Row className="hundred_height" >
              <Col xs="12">
                {this.state.rSelected + ":"}

                <div className="outside-edit-container">
                  <div className="inside-edit-container">
                    {displayCollection}
                  </div>

                </div>

                <div className="outside-add-container">
                  <div className="inside-add-container">
                    <AddSong />
                  </div>
                </div>

              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

class PhotoCarousel extends Component {
  constructor(props) {
    super(props);
    this.state = { activeIndex: 0 };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToIndex = this.goToIndex.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
  }

  onExiting() {
    this.animating = true;
  }

  onExited() {
    this.animating = false;
  }

  next() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === this.props.items.length - 1 ? 0 : this.state.activeIndex + 1;
    this.setState({ activeIndex: nextIndex });
  }

  previous() {
    if (this.animating) return;
    const nextIndex = this.state.activeIndex === 0 ? this.props.items.length - 1 : this.state.activeIndex - 1;
    this.setState({ activeIndex: nextIndex });
  }

  goToIndex(newIndex) {
    if (this.animating) return;
    this.setState({ activeIndex: newIndex });
  }

  render() {
    let { activeIndex } = this.state;

    let slides = this.props.items.map((item) => {
      return (
        <CarouselItem
          onExiting={this.onExiting}
          onExited={this.onExited}
          key={item.src}
          src={item.src}
          altText={item.altText}
        >
          <CarouselCaption captionText={"none"} captionHeader={item.caption} />
        </CarouselItem>
      );
    });

    return (
      <Carousel
        activeIndex={activeIndex}
        next={this.next}
        previous={this.previous}
      >
        <CarouselIndicators items={this.props.items} activeIndex={activeIndex} onClickHandler={this.goToIndex} />
        {slides}
        <CarouselControl direction="prev" directionText="Previous" onClickHandler={this.previous} />
        <CarouselControl direction="next" directionText="Next" onClickHandler={this.next} />
      </Carousel>
    );
  }
}

// A component to display a welcome message to the user upon signing in
class MatchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      currentCardIndex: 0,
    };

  }

  toggle() {
    this.setState({ open: !this.state.open })
  }

  handleSkip() {
    this.setState({ currentCardIndex: this.state.currentCardIndex + 1 })
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

            let ageRange = this.props.ageRange;
            let checkboxes = this.props.checkboxesSelected;

            if (
              //Verify music filters are being applied
              (checkboxes.includes("Artists") && matchDetails.matchedArtistIds.length > 0 ||
                checkboxes.includes("Albums") && matchDetails.matchedAlbumIds.length > 0 ||
                checkboxes.includes("Songs") && matchDetails.matchedSongIds.length > 0)
              &&
              //Verify age filter
              (currentProfile.age >= ageRange[0] && currentProfile.age <= ageRange[1])) {

              //construct a match
              let newMatchProfile = Object.assign({}, currentProfile, matchDetails);

              //assign the match
              matchedProfiles[currentProfile.uid] = newMatchProfile;
            }

            console.log(matchedProfiles);
          }
        });
      }
    }


    let profileKeys = Object.keys(matchedProfiles)
    let endOfStack = false;
    let matchedCards = profileKeys.map((key) => {
      if (!endOfStack) {
        let currentProfile = matchedProfiles[key];

        if (profileKeys.length === this.state.currentCardIndex) {
          endOfStack = true;
          return <p className="alert alert-info text-center">No More Matches. Adjust filters or add music to find more!</p>
        }

        if (
          //only display one card, move to the next if skipped
          profileKeys[this.state.currentCardIndex] === key) {
          return <MatchedCard
            key={key}
            profile={currentProfile}
            user={this.props.user}
            handleLikeCallback={(uid, name) => this.props.handleLikeCallback(uid, name)}
            handleSkipCallback={() => this.handleSkip()} />
        }
      }

    })

    return (
      <div className="container">
        {matchedCards}
      </div>
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
          {/* <CardImg top className="person_img" src={this.props.profile.img} alt="Card image cap" /> */}

          <PhotoCarousel items={[
            {
              src: this.props.profile.img,
              altText: 'Slide 1',
            },
            {
              src: this.props.profile.img2,
              altText: 'Slide 1',
            },
          ]} />
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
              <Button color="link" onClick={() => this.props.handleSkipCallback()}><img src={skip} /></Button>
              <Button color="link" onClick={() => this.props.handleLikeCallback(this.props.profile.uid, this.props.profile.name)} ><img id="like" src={like} /></Button>
            </ButtonGroup>
          </div>
        </CardBody>
      </Card>

    )

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
          iconElementRight={<IconButton><MoreVertIcon /></IconButton>}
          onRightIconButtonTouchTap={() => this.props.toggleFilterCallback()}
        />
      </MuiThemeProvider>
    );
  }
}

class FilterDrawer extends Component {

  render() {

    let ageOptions = [];
    for (let i = 0; i < 100; i++) {
      ageOptions.push(i);
    }

    let options = ageOptions.map((i) => {
      return <option>{i}</option>
    })

    return (
      <MuiThemeProvider>
        <div id="filter_outer_container">
          <Drawer
            className="drawer"
            open={this.props.open}
            openSecondary={true}
          >
            <AppBar
              title="Filter"
              iconElementLeft={<IconButton role="button"><NavigationClose /></IconButton>}
              onLeftIconButtonTouchTap={() => this.props.toggleCallback()}
            />
            <div id="filter_inner_container">
              { // Prompt user to log in if they are not
                !this.props.state.user &&
                <p className="alert alert-info">Please Log In First!</p>}

              { //Content shown when logged in
                this.props.state.user &&
                <Container className="m-1">
                  <Row className="mb-4">
                    <Col>
                      <p className="filter_label mb-0"> Match Basis: </p>
                      <ButtonGroup>
                        <Button color="primary" onClick={() => this.props.checkboxCallback("Artists")} active={this.props.state.checkboxesSelected.includes("Artists")}>Artists</Button>
                        <Button color="primary" onClick={() => this.props.checkboxCallback("Albums")} active={this.props.state.checkboxesSelected.includes("Albums")}>Albums</Button>
                        <Button color="primary" onClick={() => this.props.checkboxCallback("Songs")} active={this.props.state.checkboxesSelected.includes("Songs")}>Songs</Button>
                      </ButtonGroup>
                    </Col>
                  </Row>

                  <Row>
                    <p className="filter_label"> Age: </p>

                    <Col className="pr-0">
                      <Input type="number" id="minAge" placeholder="0" onChange={(event) => this.props.handleAgeChangeCallback("min_change", event.target.value)} />
                    </Col>
                    <Col className="m-0 p-0"> <p className="secondary_text">to</p> </Col>
                    <Col className="pl-0">
                      <Input type="number" id="maxAge" placeholder="100" onChange={(event) => this.props.handleAgeChangeCallback("max_change", event.target.value)} />
                    </Col>
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

/* Navigation Drawer component holding access to all the conversations, as well as the ability to create
new conversations, go back to home, or logout. */
class NavDrawer extends Component {

  render() {

    return (
      <MuiThemeProvider>
        <div>
          <Drawer
            id="filter_drawer"
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
                  <Link to="/">
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
