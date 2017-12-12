'use strict'
import React, { Component } from 'react'; //import React Component
import {
    Button, Card, CardText, CardImg, CardSubtitle, CardBody,
    CardTitle, Modal, ModalHeader, ModalBody, ModalFooter, Input,
    Container, Row, Col, ButtonGroup, Label, FormGroup
} from 'reactstrap';



export class EditPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            rSelected: "Albums",
        };
    }

    onRadioBtnClick(rSelected) {
        //console.log(rSelected);
        this.setState({ rSelected });
    }

    render() {
        let displayCollection = [];
        let name = "";
        let age = "";


        if (Object.keys(this.props.profileInput).length === 0) {

            if (this.props.profile) {

                name = this.props.profile.name;
                age = this.props.profile.age;

                if (this.state.rSelected === "Albums" && this.props.profile.albums) {
                    displayCollection = Object.keys(this.props.profile.albums).map((albumKey) => {
                        let album = this.props.profile.albums[albumKey];
                        return <Card key={albumKey} className="edit_card">
                            <CardImg top src={album.artworkUrl100} alt="Card image cap" />
                            <CardTitle>{album.collectionName}</CardTitle>
                            <CardSubtitle>{album.artistName}</CardSubtitle>
                            <Button
                                color="danger"
                                style={{ display: "inline-block" }}
                                onClick={() => this.props.handleDeleteCallback("albums", albumKey)}>
                                Delete
                  </Button>
                        </Card>
                    });
                }

                if (this.state.rSelected === "Songs" && this.props.profile.songs) {
                    displayCollection = Object.keys(this.props.profile.songs).map((songKey) => {
                        let song = this.props.profile.songs[songKey];
                        return <Card key={songKey} className="edit_card">
                            <CardImg top src={song.artworkUrl100} alt="Card image cap" />
                            <CardTitle>{song.trackName}</CardTitle>
                            <CardSubtitle>{song.artistName}</CardSubtitle>
                            <Button
                                color="danger"
                                style={{ display: "inline-block" }}
                                onClick={() => this.props.handleDeleteCallback("songs", songKey)}>
                                Delete
                  </Button>
                        </Card>
                    });
                }

                if (this.state.rSelected === "Artists" && this.props.profile.artists) {
                    displayCollection = Object.keys(this.props.profile.artists).map((artistKey) => {
                        let artist = this.props.profile.artists[artistKey];
                        return <Card key={artistKey} className="edit_card">
                            <CardTitle><a href={artist.artistLinkUrl}>{artist.artistName}</a></CardTitle>
                            <CardSubtitle>{artist.primaryGenreName}</CardSubtitle>
                            <Button
                                color="danger"
                                style={{ display: "inline-block" }}
                                onClick={() => this.props.handleDeleteCallback("artists", artistKey)}>
                                Delete
                  </Button>
                        </Card>
                    });
                }
            }
        }
        else {
            this.props.usersRef.child(this.props.user.uid).set({
                uid: this.props.user.uid,
                age: this.props.profileInput.age,
                name: this.props.profileInput.name,
                img: this.props.profileInput.img
            })
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

                                <div className="outside-edit-container">
                                    <div className="inside-edit-container">
                                        {displayCollection}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row className="hundred_height" >
                            <Col xs="12">
                                <div className="outside-add-container">
                                    <div className="inside-add-container">
                                        <AddMusicItem addItemCallback={(id, type) => this.props.addItemCallback(id, type)} />
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

class AddMusicItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: "",
            searchEntity: "musicArtist",
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
            .then((data) => {  //when done encoding
                //do something with the data!!
                //console.log('done')
                this.setState({ data: data });

                // ReactDOM.render(<SearchResults
                //   data={data}
                //   searchEntity={this.state.searchEntity}
                //   addItemCallback={(id, type) => this.props.addItemCallback(id, type)}
                //   searchEntity={this.state.searchEntity} />, document.querySelector("#records"));

            })
            .catch(function (error) {
                //do something if AJAX request fails
                //console.log(error);
            })

        return returnedPromise;
    }
    handleEntityChange(term) {
        //edge case 
        if (term === "Artists") {
            this.setState({ searchEntity: "musicArtist" });
        } else {
            let trimmedTerm = term.substring(0, term.length - 1);
            let cleanedTerm = trimmedTerm.substring(0, 1).toLowerCase()
                + trimmedTerm.substring(1, trimmedTerm.length);
            //console.log(cleanedTerm);
            this.setState({ searchEntity: cleanedTerm })
        }
    }
    render() {

        return (
            <div>
                <form className="form-inline" method="GET" action="https://itunes.apple.com/search">
                    <div className="form-group mr-3">
                        <label htmlFor="searchQuery" className="mr-2">What do you want to add?</label>
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
                    <button type="submit" className="btn btn-primary" onClick={(event) => { event.preventDefault(); this.fetchTrackList(this.state.searchValue) }}>
                        <i className="fa fa-music" aria-hidden="true"></i> Search!
          </button>
                </form>

                <SearchResults
                    data={this.state.data}
                    searchEntity={this.state.searchEntity}
                    addItemCallback={(id, type) => this.props.addItemCallback(id, type)}
                    searchEntity={this.state.searchEntity} />

            </div>

        );
    }
}

class SearchResults extends Component {
    render() {
        //console.log(this.props.data);
        if (this.props.data) {
            let songArray = this.props.data;
            let objects = [];

            if (songArray.results.length == 0 || songArray.results == null) {
                //console.log("No results found");
            } else {
                let songArrayResult = songArray.results;

                objects = Object.keys(songArrayResult).map((key) => {
                    let item = songArrayResult[key];
                    return <Card key={key} className="music_card">
                        {item.artworkUrl100 &&
                            <CardImg top src={item.artworkUrl100} alt="Card image cap" />}
                        {item.trackName &&
                            <CardTitle>{item.trackName}</CardTitle>}

                        {item.collectionName &&
                            <CardTitle>{item.collectionName}</CardTitle>}

                        {item.artistLinkUrl &&
                            <CardTitle><a target="_blank" href={item.artistLinkUrl}>{item.artistName}</a></CardTitle>}

                        {item.collectionName &&
                            <CardSubtitle>{item.artistName}</CardSubtitle>}

                        {this.props.searchEntity === "musicArtist" &&
                            <Button color="success" onClick={(id, type) => this.props.addItemCallback(item.artistId, this.props.searchEntity)}>Add</Button>}
                        {this.props.searchEntity === "album" &&
                            <Button color="success" onClick={(id, type) => this.props.addItemCallback(item.collectionId, this.props.searchEntity)}>Add</Button>}
                        {this.props.searchEntity === "song" &&
                            <Button color="success" onClick={(id, type) => this.props.addItemCallback(item.trackId, this.props.searchEntity)}>Add</Button>}

                    </Card>
                });
            }

            //console.log(objects);
            return (
                <div id="records"> {objects} </div>
            );
        }
        else {
            return (
                <div id="records"> </div>
            );
        }
    }
}