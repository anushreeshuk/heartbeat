import React, { Component } from 'react'; //import React Component
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';

// displays the list of conversation cards
export class ConvoList extends Component {
    render() {
        if (this.props.login === false) {
            return <Redirect to='/login' />;
        }

        let conversations = this.props.conversations || []; //handle if we aren't given a prop
        let convoCards = conversations.map((convo) => {
            if (convo.userId1 == this.props.currentUser.uid) {
                return <ConvoCard convo={convo} key={convo.name} />;
            }
        });

        return (
            <div>
                <h2>Welcome to Flack!</h2>
                <div className="card-deck" aria-label="header" aria-required="true">
                    {convoCards}
                </div>
            </div>
        );
    }
}

// creates a single conversation card 
export class ConvoCard extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    handleClick() {
        this.setState({ link: true });
        console.log("You clicked on", this.props.convo.name);
    }

    render() {
        let mutt = this.props.convo;
        if (this.state.link) {
            return <Redirect push to={'/conversations/' + this.props.convo.name} />
        }
        if (mutt.messages != 0 | mutt.name === 'general') { //displays only if conversation has message unless it's general
            return (
                <div className="card" onClick={() => this.handleClick()}>
                    <div className="card-body">
                        <h3 className="card-title">{mutt.name}</h3>
                    </div>
                </div>
            );
        }
        return '';
    }
}

