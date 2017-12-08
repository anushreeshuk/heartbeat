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
import renderHTML from 'react-render-html';

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
    let messageList = Object.keys(this.state.messages).map(obj => this.state.messages[obj]["id"] = obj);
    messageList = Object.keys(this.state.messages).map(obj => this.state.messages[obj]);
    if (messageList) {
      messageList = messageList.map((message) => {
        return <MessageCard
        key={message.id}
        displayName={message.userName}
        photoURL={message.userPhoto}
        text={message.text}
        timestamp={message.time} />
    });        
    }

    return (
      <div className="container-fluid">

        <div className="row">
          <div className="col-12" >
            <div
              className="messages-list"
              role="region"
              aria-live="polite">
              {messageList && messageList.length > 0 &&
                messageList}
              { // incase there are no messages in this conversation
                !messageList &&
                <p className="alert alert-info">No Messages Available</p>}
            </div>
          </div>
        </div>

        {/* <div className="row">
          <div className="col-12">
            <SendMessageForm
              submitCallback={(messageText, conversationName) => { this.props.sendMessageCallback(messageText, conversationName) }}
              conversationName={this.props.conversationName} />
          </div>
        </div> */}
      </div>

    );
  }
}

//added from chat app below
// Shows a specific message that includes the display name, picture, text, and time sent
export class MessageCard extends Component {
  render() {

    // Using Remarkable's library to render Markdown in messages
    let md = new Remarkable({
      linkify: true,
      link_open: function (tokens, idx /*, options, env */) {
        var title = tokens[idx].title ? (' title="' + this.escapeHtml(this.replaceEntities(tokens[idx].title)) + '"') : '';
        return '<a target="_blank" href="' + this.escapeHtml(tokens[idx].href) + '"' + title + '>';
      }
    });

    return (
      <Card className="message-card">
        <CardBody>
          <CardTitle aria-label="sender information">
            <img className="avatar-mini" src={this.props.photoURL} alt={this.props.displayName} />
            {this.props.displayName}</CardTitle>
          <CardSubtitle className="message-time" aria-label="message sent time">
            {new Date(this.props.timestamp).toLocaleString()}
          </CardSubtitle>
          <CardText className="message-text" aria-label="message text">{renderHTML(md.render(this.props.text))}</CardText>
        </CardBody>
      </Card>
    );
  }
}
