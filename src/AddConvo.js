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
        this.state = { 'name': '', 'userId': '', 'username1': '', 'username2': '', 'userId2': '' };
    }

    handleCreate(event) {
        event.preventDefault(); //don't submit
        let name = this.state.name;
        let userId1 = this.state.userId1;
        let username1 = this.state.username1;
        let username2 = this.state.username2;
        let userId2 = this.state.userId2;
        let newConvo = {
            'name': name,
            'userId1': userId1,
            'username1': username1,
            'username2': username2,
            'userId2': userId2,
            'messages': 0
        };
        let conversations = firebase.database().ref('conversations');
        if (!_.find(this.props.convoArray, {
            'name': name, 'userId1': userId1,
            'username1': username1,
            'username2': username2,
            'userId2': userId2,
        })) {
            conversations.push(newConvo);
        }
        this.setState({
            'name': '', 'userId1': '', 'username1': '', 'username2': '', 'userId2': '',
            Redirect: true, prevName: name
        });
    }

    handleChange(event, users) {
        let newState = {};
        if(event.target.value == "Choose"){
            newState.valid = false;
        } else {
            newState.valid = true;
        }
        newState[event.target.name] = this.props.user.displayName + '+' + event.target.value;
        newState['userId1'] = this.props.user.uid;
        newState['username1'] = this.props.user.displayName;
        newState['username2'] = event.target.value;
        newState['userId2'] = _.find(users, { 'username': event.target.value })
            ? _.find(users, { 'username': event.target.value }).userId : '';
        this.setState(newState);
    }

    render() {
        return (
            <Form inline>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="convoName" className="mr-sm-2">Name</Label>
                    <Invite user={this.props.user}
                        handleChangeCallback={(e, users) => this.handleChange(e, users)} valid={this.state.valid}/>
                </FormGroup>
                <Button color="primary" onClick={(e) => this.handleCreate(e)} disabled={!this.state.valid}>Create</Button>
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
                return <User invitedUser={user} key={user.username} />
            }
        })
        return (
            <Input type="select" name="name" id="select" placeholder="other username" onClick={(e) =>
                this.props.handleChangeCallback(e, users)} valid={this.props.valid}>
                <option selected="true">Choose</option>
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