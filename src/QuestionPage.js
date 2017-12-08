import React, { Component } from 'react'; //import React Component
import firebase from 'firebase/app';
import 

//A form the user can use to post a Chirp
export default class ChirpBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            song: ''
        };
    }

    //when the text in the form changes
    updateUser(event) {
        this.setState({ songs: event.target.value });
    }

    //post a new user to the database
    postUser(event) {
        event.preventDefault(); //don't submit
        let newSong = {
            songName: this.state.song, // name of the user
            // age: this.state.age, //age of the user 
            img1: this.props.currentUser.img1, //img of the user
            img2: this.props.currentUser.img2, //second pic
            uid: this.props.currentUser.uid,
            // albums: undefined,
            // artists: undefined,
            // songs: undefined
   
    }
        let songs = firebase.database().ref('songs');
        songs.push(newSong)

        this.setState({ song: '' }); //empty out post for next time
    }

    render() {
        let user = this.props.currentUser; //the current user (convenience)
    
        return (
          <div className="container">
            <div className="row py-3 chirp-box">
              <div className="col pl-4 pl-lg-1">
                <form>
                  <textarea name="songName" className="form-control mb-2" placeholder="Enter you Favorite Song"
                    value={this.state.songs}
                    onChange={(e) => this.updateUser(e)}
                  />
    
                  <div className="text-right">
                    {/* Disable if invalid post length */}
                    <button className="btn btn-primary"
                      disabled={this.state.post.length === 0 || this.state.post.length > 140}
                      onClick={(e) => this.postUser(e)}
                    >
                      <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      }
    }
}

