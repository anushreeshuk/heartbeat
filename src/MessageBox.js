import React, { Component } from 'react'; //import React Component
import './message.css'; //load module-specific CSS
import firebase from 'firebase/app';
import _ from 'lodash';

//A form the user can use to post a message
export class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.state = { post: localStorage.getItem(this.props.name) || '' };
  }

  //when the text in the form changes
  updatePost(event) {
    localStorage.setItem(this.props.name, event.target.value); //updates local storage message text
    this.setState({ post: (event.target.value) }); // sets state to message text
  }

  //post a new message to the database
  postMessage(event) {
    event.preventDefault(); //don't submit

    /* creates a new message that stores the text, id, name, 
    and photo of the user posting the message, and a timestamp*/
    let newMessage = {
      text: this.state.post,
      userId: this.props.currentUser.uid,
      userName: this.props.currentUser.displayName,
      userPhoto: this.props.currentUser.photoURL,
      time: firebase.database.ServerValue.TIMESTAMP
    };

    //gets a reference to messages of this conversation stored in firebase
    let messages = firebase.database().ref('messages/' + this.props.name);

    //adds the new message to firebase
    messages.push(newMessage);
    let id;

    //checks if the conversation(username1 + username2) currently exists
    if (!_.find(this.props.conversations, { 'name': this.props.name, 'userId1': this.props.currentUser.uid })) {

      // adds conversation to firebase if conversation does not exist and stores the key
      id = firebase.database().ref('conversations').push({
        name: this.props.name,
        userId1: this.props.currentUser.uid,
        username1: this.props.currentUser.displayName, username2: this.props.currentUser.displayName,
        userId2: this.props.currentUser.uid, messages: 0
      }).key;

    } else {
      // stores the location of conversation in firebase
      let convo = _.find(this.props.conversations, {
        'name': this.props.name,
        'userId1': this.props.currentUser.uid
      });

      /* gets a reference and adds the new message to the same conversation 
      but in user2's name(username2 + usename1), so user 2 can view this conversation */
      firebase.database().ref('messages/' + convo.username2 + '+' + convo.username1).push(newMessage);
      let id1;

      //checks if the conversation(username2 + username1) currently exists
      if (_.find(this.props.conversations, { 'name': convo.username2 + '+' + convo.username1, 'userId2': this.props.currentUser.uid })) {

        //gets the key of the conversation(username2 + username1)
        id1 = _.find(this.props.conversations, {
          'name': convo.username2 + '+' + convo.username1,
          'userId2': this.props.currentUser.uid
        }).id;

      } else {

        // adds conversation(username2 + username1) to firebase if conversation does not exist and stores the key
        id1 = firebase.database().ref('conversations').push({
          name: convo.username2 + '+' + convo.username1,
          userId1: convo.userId2,
          username1: convo.username2, username2: convo.username1,
          userId2: this.props.currentUser.uid, messages: 0
        }).key;
      }

      //updates last message and # of messages in conversation(username2 + username1) 
      firebase.database().ref('conversations').once('value').then(function (snapshot) {
        let y = snapshot.val()[id].messages;
        let x = firebase.database().ref('conversations/' + id1);
        x.update({ lastMessage: newMessage.text, lastUser: newMessage.userName, messages: y + 1 });
      });;
      id = convo.id;
    }

    //updates last message and # of messages in conversation(username1 + username2) 
    firebase.database().ref('conversations').once('value').then(function (snapshot) {
      let y = snapshot.val()[id].messages;
      let x = firebase.database().ref('conversations/' + id);
      x.update({ lastMessage: newMessage.text, lastUser: newMessage.userName, messages: y + 1 });
    });;
    localStorage.setItem(this.props.name, ''); //empty out local storage for next time
    this.setState({ post: '' }); //empty out post for next time
  }

  render() {
    let user = this.props.currentUser; //the current user (convenience)
    let photoURL = user != null ? user.photoURL : '';

    return (
      <div className="container">
        <div className="row py-3 chirp-box">
          
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