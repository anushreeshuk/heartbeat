'use strict';
// import statements
import React, { Component } from 'react'; 
import Time from 'react-time'
import './message.css'; 
import firebase from 'firebase/app';
import Gravatar from 'react-gravatar'
import md5 from 'md5';
import _ from 'lodash';
import Remarkable from 'remarkable';

// list of messages that have been posted
export class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    
  }

  componentDidMount() {
    this.messagesRef = firebase.database().ref('messages/' + this.props.name); //gets reference to all messages in conversation
    this.messagesRef.on('value', (snapshot) => {
      if (snapshot.val() != null) {
        this.setState({ messages: snapshot.val() });
      }
    });
  }
  componentWillUnmount() {
    this.messagesRef.off();
  }

  render() {

    let messageItems = Object.keys(this.state.messages).map(obj => this.state.messages[obj]["id"] = obj);
    messageItems = Object.keys(this.state.messages).map(obj => this.state.messages[obj]);
    messageItems = messageItems.map((message) => {
      return <MessageItem message={message} key={message.id} currentUser={firebase.auth().currentUser}></MessageItem>
    });

    return (
      <div className="container">
        {messageItems}
      </div>);
  }
}

// displays the all the messages in a list
class MessageItem extends Component {
  
  render() {
    let message = this.props.message;
    let md = new Remarkable('full');
    let messageTxt = md.render((message.text));
    return (
      <div className="row py-4 bg-white border">
        <div className="col-xs-4 col-md-1 sm-4">
          <img id="hi" className="avatar" src={message.userPhoto} aria-label={message.userName} aria-required="true" alt={message.userName + ' avatar'} />
        </div>
        <div className="col sm-8 pl-4 pl-lg-1">
          <span className="handle">{message.userName} {/*space*/} </span>
          <span className="time"><Time value={message.time} relative /></span>
          <div className="message" ><span dangerouslySetInnerHTML={{__html: messageTxt}}/></div>
        </div>
      </div>
    );
  }
}