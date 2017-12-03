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
        this.state = { 'name': '' };
    }

    handleCreate(event) {
        event.preventDefault(); //don't submit
        let name = this.state.name;
        let newConvo = {
            'name': name,
            'messages': 0
        };
        let conversations = firebase.database().ref('conversations');
        let key = '';
        if (!_.find(this.props.convoArray, { 'name': this.state.name })) {
           conversations.push(newConvo); 
        }
        this.setState({ 'name': '', Redirect: true, prevName: name });
    }

    handleChange(event) {
        let newState = {};
        newState[event.target.name] = event.target.value;
        this.setState(newState);
    }

    render() {
        return (
            <Form inline>
                <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
                    <Label for="convoName" className="mr-sm-2">Name</Label>
                    <Input type="name" name="name" id="name" placeholder="conversation name" onChange={(e) => this.handleChange(e)} />
                </FormGroup>
                <Button color="primary" onClick={(e) => this.handleCreate(e)}>Create</Button>
                {this.state.Redirect && <Redirect to={'/conversations/' + this.state.prevName} />}
            </Form>
        );
    }
}

export default AddConvo;