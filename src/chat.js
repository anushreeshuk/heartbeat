import React, { Component } from 'react'; //import React Component
import ReactDOM from 'react-dom';
import './chat.css';
import like from './img/like.png';
import skip from './img/skip.png';
import logo from './img/heartbeat.png';

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


//added from chat app below
export class ConversationsList extends Component {
    render() {

        //represents the list of conversations that will be constructed and returned 
        let conversationsList;

        if (this.props.conversations) {
            //iterate through the conversations prop and create a conversation card for each
            if (Object.keys(this.props.conversations).length > 0) {
                conversationsList = Object.keys(this.props.conversations).map((convo) => {

                    //added afterwards
                    if (convo.indexOf(this.props.user.uid) > -1) {
                        let userIds = convo.split("+");
                        let userName1 = this.props.users[userIds[0]].name;
                        let userName2 = this.props.users[userIds[1]].name;
                        return <ConversationCard
                            key={convo}
                            title={userName1 + " + " + userName2}
                            subtitle={"Last Message: '" + this.props.conversations[convo].lastMessage.text + "' -" + this.props.conversations[convo].lastMessage.displayName}
                            text={"# of Messages: " + this.props.conversations[convo].messages}
                            reroute={"/conversations/" + convo}
                            toggleCallback={() => this.props.toggleCallback()} />
                    }

                });

                //if there is no conversations passed, make the default "general" conversation card  
            } else {
                conversationsList = <ConversationCard
                    key={"general"}
                    title={"general"}
                    subtitle="fill this"
                    text="fill this"
                    reroute={"/conversations/general"}
                    toggleCallback={() => this.props.toggleCallback()} />
            }
        }

        return (
            <div
                className="conversations-list"
                role="region"
                aria-live="polite" >
                {conversationsList}
            </div>
        );
    }
}

//added from chat app below
export class ConversationCard extends Component {
    render() {

        return (
            <div>
                <Card className="convo-card">
                    <CardBody>
                        <CardTitle aria-label="conversation title">{this.props.title}</CardTitle>
                        <CardSubtitle aria-label="last message">{this.props.subtitle}</CardSubtitle>
                        <CardText aria-label="number of messages">{this.props.text}</CardText>
                        <Link aria-label="go to conversation" to={this.props.reroute}>
                            <Button role="button" color="info" onClick={() => this.props.toggleCallback()}>
                                Go
                </Button>
                        </Link>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

//added from chat app below
export class MessagesList extends Component {
    render() {

        // List of messages that will be constructed with multiple message cards for this conversation
        let messageList;

        if (this.props.messages[this.props.conversationName]) {

            messageList = Object.keys(this.props.messages[this.props.conversationName]).map((msgkey) => {
                let msg = this.props.messages[this.props.conversationName][msgkey];
                return <MessageCard
                    key={msgkey}
                    author={msg.author}
                    displayName={msg.displayName}
                    photoURL={msg.photoURL}
                    text={msg.text}
                    timestamp={msg.timestamp} />
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

                <div className="row">
                    <div className="col-12">
                        <SendMessageForm
                            submitCallback={(messageText, conversationName) => { this.props.sendMessageCallback(messageText, conversationName) }}
                            conversationName={this.props.conversationName} />
                    </div>
                </div>
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

//added from chat app below
// Form used to input and send new messages to conversations, 
export class SendMessageForm extends Component {
    constructor(props) {
        super(props);
        this.state = { value: '' }; //initial state
    }

    // Appropriately addressing change for the input box
    handleChange(event) {
        let storageKey = this.props.conversationName + "_draft";
        this.setState({ value: event.target.value });
        localStorage.setItem(storageKey, event.target.value);
    }

    // Callback for when the submit button is clicked 
    handleClick(event) {
        event.preventDefault();
        let storageKey = this.props.conversationName + "_draft";
        this.props.submitCallback(this.state.value, this.props.conversationName);
        this.setState({ value: '' }); //reset once finished
        localStorage.setItem(storageKey, event.target.value);
    }

    // Used to updated value with the local storage to mimick a draft 
    updateValue() {
        let storageKey = this.props.conversationName + "_draft";
        this.setState({ value: localStorage.getItem(storageKey) });
    }

    render() {
        let storageKey = this.props.conversationName + "_draft";
        let fieldValue = this.state.value;

        if (fieldValue !== localStorage.getItem(storageKey) && localStorage.getItem(storageKey) !== null) {
            fieldValue = localStorage.getItem(storageKey);
            this.updateValue();
        }

        return (
            <form>
                <div className="container" />
                <div className="row align-items-start">
                    <div className="col-9">
                        <Input
                            role="textbox"
                            className="form-control mb-3"
                            placeholder="Message"
                            value={fieldValue}
                            onChange={(event) => { this.handleChange(event) }}
                        />
                    </div>

                    <div className="col-3">
                        <Button
                            role="button"
                            color="primary"
                            className="mt-0"
                            onClick={(event) => { this.handleClick(event) }}>
                            Send
              </Button>
                    </div>
                </div>
            </form>
        );
    }
}

export class NavDrawer extends Component {
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
                            title={<img id="logo" src={logo} />}
                            iconElementLeft={<IconButton role="button"><NavigationClose /></IconButton>}
                            onLeftIconButtonTouchTap={() => this.props.toggleCallback()}
                        />

                        { // Prompt user to log in if they are not
                            !this.props.user &&
                            <p className="alert alert-info">Please Log In First!</p>}

                        { //Content shown when logged in
                            this.props.user &&
                            <div>
                                <div>
                                    {this.props.conversationList}

                                    <Button
                                        role="button"
                                        color="info"
                                        id="newConvoPopover"
                                        onClick={() => { this.props.toggleCallback(); this.toggleModal() }}>
                                        New Conversation
                  </Button>

                                    <Modal
                                        aria-label="new conversation modal"
                                        isOpen={this.state.modal}
                                        toggle={this.toggle} className="modal-popover">
                                        <ModalHeader aria-label="make new conversation">New Conversation</ModalHeader>
                                        <ModalBody>
                                            Please enter the name of your new conversation:
                      <Input role="textbox" onChange={(event) => this.handleChange(event)} />
                                        </ModalBody>
                                        <ModalFooter>
                                            <Link to={"/conversations/" + this.state.newConvoValue}>
                                                <Button role="button" color="primary" onClick={() => this.toggleModal()}>
                                                    Create
                        </Button>
                                            </Link>

                                            <Button role="button" color="secondary" onClick={() => this.toggleModal()}>
                                                Cancel
                        </Button>
                                        </ModalFooter>
                                    </Modal>
                                </div>

                                <div>
                                    <Link to="/">
                                        <Button
                                            role="button"
                                            color="info"
                                            onClick={() => this.props.toggleCallback()}>
                                            Home
                    </Button>
                                    </Link>

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