'use strict';

import React, { Component } from 'react'; //import React Component
import {
    Button, Card, CardImg, CardSubtitle, CardBody,
    CardTitle,
    Container, Row, Col, ButtonGroup
} from 'reactstrap';

import like from './img/like.png';
import skip from './img/skip.png';
import { PhotoCarousel } from './Carousel'

// A component to display a welcome message to the user upon signing in
export class MatchPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            currentCardIndex: 0,
            loggedIn: false,
        };

    }

    //Handler for the navigation bar
    toggle() {
        this.setState({ open: !this.state.open })
    }

    //Handler for when a user skips the current card on screen
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

                //go thru each key and find matches
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

                        if (currentProfile.artists) {
                            Object.keys(currentProfile.artists).map((artistKey) => {
                                let artist = currentProfile.artists[artistKey];

                                if (profileArtistsIds.includes(artist.artistId)) {

                                    if (!matchDetails.matchedArtistIds.includes(artist.artistId)) {
                                        matchDetails.matchedArtists.push(artist);
                                        matchDetails.matchedArtistIds.push(artist.artistId);
                                    }

                                }
                            });
                        }

                        if (currentProfile.albums) {
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
                        }

                        if (currentProfile.songs) {
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
                        }

                        //factor in filters when making matches
                        let ageRange = this.props.ageRange;
                        let checkboxes = this.props.checkboxesSelected;

                        if (this.props.userLikes) {
                            if (
                                //Verify music filters are being applied
                                (checkboxes.includes("Artists") && matchDetails.matchedArtistIds.length > 0 ||
                                    checkboxes.includes("Albums") && matchDetails.matchedAlbumIds.length > 0 ||
                                    checkboxes.includes("Songs") && matchDetails.matchedSongIds.length > 0)
                                &&
                                //Verify age filter
                                (currentProfile.age >= ageRange[0] && currentProfile.age <= ageRange[1])

                                &&
                                //Dont show them someone they have liked
                                (this.props.userLikes[this.props.user.uid] ?
                                    !Object.keys(this.props.userLikes[this.props.user.uid]).includes(currentProfile.uid) :

                                    //if they have no likes yet, pass this test
                                    true)) {

                                //construct a match
                                let newMatchProfile = Object.assign({}, currentProfile, matchDetails);

                                //assign the match
                                matchedProfiles[currentProfile.uid] = newMatchProfile;
                            }

                           
                        }
                    }
                });
            }
        }


        //set up our matches card stack
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

//A single match card that shows user information and additional functionality 
class MatchedCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            rSelected: "Albums",
        };
    }

    //Handler for when radio buttons are clicked
    onRadioBtnClick(rSelected) {
        
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

                //Viewing albums of current match
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

                //Viewing songs of current match
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

                //Viewing artists of current match
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
            <Card id="display-card">
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
                            <Button role="button" aria-label="select artists" color="primary" onClick={() => this.onRadioBtnClick("Artists")} active={this.state.rSelected === "Artists"}>Artists</Button>
                            <Button role="button" aria-label="select albums" color="primary" onClick={() => this.onRadioBtnClick("Albums")} active={this.state.rSelected === "Albums"}>Albums</Button>
                            <Button role="button" aria-label="select songs" color="primary" onClick={() => this.onRadioBtnClick("Songs")} active={this.state.rSelected === "Songs"}>Songs</Button>
                        </ButtonGroup>
                        <Container className="card_container">

                            <Row className="hundred_height" >
                                <Col xs="12">

                                    <div className="container-outer">
                                        <div className="container-inner">
                                            {displayCollection}
                                        </div>
                                    </div>

                                </Col>
                            </Row>
                        </Container>

                        <ButtonGroup className="action_buttons">
                            <Button aria-label="skip button" role="button" color="link" onClick={() => this.props.handleSkipCallback()}><img src={skip} /></Button>
                            <Button aria-label="like button" role="button" color="link" onClick={() => {
                                //like and then go to the next card
                                this.props.handleLikeCallback(this.props.profile.uid, this.props.profile.name);
                                this.props.handleSkipCallback();
                            }} ><img id="like" src={like} /></Button>
                        </ButtonGroup>
                    </div>
                </CardBody>
            </Card>

        )

    }
}
