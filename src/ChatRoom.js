import React, { Component } from 'react'; //import React Component
import { MessageBox } from './MessageBox';
import { MessageList } from './MessageList';
import _ from 'lodash';

export class ChatRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        let convoName = this.props.match.params.Id;
        return (
            <div>
                {/*Displays list of messages and chat box*/}
                <MessageList name={convoName} currentUser={this.props.user} />
                <MessageBox currentUser={this.props.user} name={convoName} conversations={this.props.conversations} />
            </div>
        );
    }
}

