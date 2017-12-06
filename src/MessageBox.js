import React, { Component } from 'react'; //import React Component
import './message.css'; //load module-specific CSS
import firebase from 'firebase/app';
import Gravatar from 'react-gravatar'
import md5 from 'md5';
import _ from 'lodash';

//A form the user can use to post a message
export class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.state = { post: localStorage.getItem(this.props.name) || '' };
  }

  //when the text in the form changes
  updatePost(event) {
    localStorage.setItem(this.props.name, event.target.value);
    this.setState({ post: (event.target.value) });
  }

  //post a new message to the database
  postMessage(event) {
    event.preventDefault(); //don't submit
    let newMessage = {
      text: this.state.post,
      userId: this.props.currentUser.uid,
      userName: this.props.currentUser.displayName,
      userPhoto: this.props.currentUser.photoURL,
      time: firebase.database.ServerValue.TIMESTAMP
    };
    let messages = firebase.database().ref('messages/' + this.props.name);
    messages.push(newMessage);
    let id;
    if (!_.find(this.props.conversations, { 'name': this.props.name, 'userId1': this.props.currentUser.uid })) {
      id = firebase.database().ref('conversations').push({
        name: this.props.name,
        userId1: this.props.currentUser.uid,
        username1: this.props.currentUser.displayName, username2: this.props.currentUser.displayName,
        userId2: this.props.currentUser.uid, messages: 0
      }).key;
    } else {
      let convo = _.find(this.props.conversations, {
        'name': this.props.name,
        'userId1': this.props.currentUser.uid
      });
      firebase.database().ref('messages/' + convo.username2 + '+' + convo.username1).push(newMessage);
      let id1;
      if (_.find(this.props.conversations, {
        'name': convo.username2 + '+' + convo.username1,
        'userId2': this.props.currentUser.uid
      })) {
        id1 = _.find(this.props.conversations, {
          'name': convo.username2 + '+' + convo.username1,
          'userId2': this.props.currentUser.uid
        }).id;
      } else {
        id1 = firebase.database().ref('conversations').push({
          name: convo.username2 + '+' + convo.username1,
          userId1: convo.userId2,
          username1: convo.username2, username2: convo.username1,
          userId2: this.props.currentUser.uid, messages: 0
        }).key;
      }
      firebase.database().ref('conversations').once('value').then(function (snapshot) {
        let y = snapshot.val()[id].messages;
        let x = firebase.database().ref('conversations/' + id1);
        x.update({ messages: y + 1 });
      });;
      id = convo.id;
    }
    firebase.database().ref('conversations').once('value').then(function (snapshot) {
      let y = snapshot.val()[id].messages;
      let x = firebase.database().ref('conversations/' + id);
      x.update({ messages: y + 1 });
    });;
    localStorage.setItem(this.props.name, '');
    this.setState({ post: '' }); //empty out post for next time
  }

  render() {
    let user = this.props.currentUser; //the current user (convenience)
    let photoURL = user != null ? user.photoURL : '';

    return (
      <div className="container">
        <div className="row py-3 chirp-box">
          <img src={photoURL} default="monsterid" className="avatar" />
          <div className="col pl-4 pl-lg-1">
            <form>
              <textarea name="text" className="form-control mb-2" placeholder="Type message here..."
                value={this.state.post}
                onChange={(e) => this.updatePost(e)}
              />

              {/* Only show this if the post length is > 300 */}
              {this.state.post.length > 300 &&
                <small className="form-text">300 character limit!</small>
              }

              <div className="text-right">
                {/* Disable if invalid post length */}
                <button className="btn btn-primary"
                  disabled={this.state.post.length === 0 || this.state.post.length > 300}
                  onClick={(e) => this.postMessage(e)}
                >
                  <i className="fa fa-pencil-square-o" aria-hidden="true"></i> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}