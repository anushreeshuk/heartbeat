import React, { Component } from 'react'; //import React Component
import { MessageBox } from './MessageBox';
import { MessageList } from './MessageList';
import _ from 'lodash';
import { Redirect } from 'react-router-dom';

export class ChatRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let convoName = this.props.match.params.Id;
        let conversation = _.find(this.props.conversations, { 'name': convoName }) || [];
        if (this.props.user) {
            if (conversation.userId1 != this.props.user.uid) {
                return <Redirect to='/conversations' />;
            }
        }
        return (
            <div>
                {/*Displays list of messages and chat box*/}
                <MessageList name={convoName} currentUser={this.props.user} />
                <MessageBox currentUser={this.props.user} name={convoName} conversations={this.props.conversations} />
            </div>
        );
    }
}

