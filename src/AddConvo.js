import React, { Component } from 'react'; //import React Component
import { Button } from 'reactstrap';
import { Label } from 'reactstrap';
import { Input } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import { Alert } from 'reactstrap';
import { FormFeedback, Form } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import firebase from 'firebase/app';
import _ from 'lodash';

class AddConvo extends Component {
    constructor(props) {
        super(props);
        this.state = { 'name': '', 'userId': '', 'username': '' };
    }

    handleCreate(event) {
        event.preventDefault(); //don't submit
        let name = this.state.name;
        let userId = this.state.userId;
        let username = this.state.username;
        let newConvo = {
            'name': name,
            'userId': userId,
            'username': username,
            'messages': 0
        };
        let conversations = firebase.database().ref('conversations');
        if (!_.find(this.props.convoArray, { 'name': name })) {
            conversations.push(newConvo);
        }
        this.setState({ 'name': '', 'userId': '', 'username': '', Redirect: true, prevName: name });
    }

    handleChange(event) {
        let newState = {};
        newState[event.target.name] = event.target.value;
        newState['userId'] = this.props.user.uid;
        newState['username'] = this.props.user.displayName;
        this.setState(newState);
    }

    render() {
        return (
            <Form inline>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="convoName" className="mr-sm-2">Name</Label>

                    <Invite user={this.props.user} />

                </FormGroup>
                <Button color="primary" onClick={(e) => this.handleCreate(e)}>Create</Button>
                {this.state.Redirect && <Redirect to={'/conversations/' + this.state.prevName} />}
            </Form>
        );
    }
}

class Invite extends Component {
    constructor(props) {
        super(props);
        this.state = { 'users': [] };
    }

    componentDidMount() {
        this.usersRef = firebase.database().ref('users'); //gets reference to registered users
        this.usersRef.on('value', (snapshot) => {
            if (snapshot.val() != null) {
                this.setState({ users: snapshot.val() });
            }
        });
    }
    componentWillUnmount() {
        this.usersRef.off();
    }

    render() {
        let users = Object.keys(this.state.users).map(obj => this.state.users[obj]["id"] = obj);
        users = Object.keys(this.state.users).map(obj => this.state.users[obj]);
        let options = users.map((user) => {
            if (user.userId != this.props.user.uid) {
                return <User invitedUser={user} key={user.username}/>
            }
        })
        return (
            <Input type="select" name="select" id="select" placeholder="other username" >
                {options}
            </Input>
        );
    }
}

class User extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <option>{this.props.invitedUser.username}</option>
        );
    }
}

export default AddConvo;