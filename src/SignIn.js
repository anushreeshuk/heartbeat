import React, { Component } from 'react'; //import React Component

import './SignUp.css'; //load module CSS
import noUserPic from './img/no-user-pic.png'; //placeholder image (as a data Uri)
import { Button } from 'reactstrap';
import { Label } from 'reactstrap';
import { Input } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import { Alert } from 'reactstrap';
import { FormFeedback } from 'reactstrap';

class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined,
    }; //initialize state
  }

  //handle signIn button
  handleSignIn(event) {
    event.preventDefault(); //don't submit
    this.props.signInCallback(this.state.email, this.state.password);
  }
  
  validate(value, validations) {
    let errors = [];

    if (value !== undefined) { //check validations
      //handle required
      if (validations.required && value === '') {
        errors.push('Required field.');
      }

      //handle minLength
      if (validations.minLength && value.length < validations.minLength) {
        errors.push(`Must be at least ${validations.minLength} characters.`);
      }

      //handle email type
      if (validations.email) {
        //pattern comparison from w3c
        //https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
        let valid = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)
        if (!valid) {
          errors.push('Not an email address.')
        }
      }
      return errors; //report the errors
    }
    return undefined; //no errors defined (because no value defined!)
  }

  handleChange(event) {
    let newState = {};
    newState[event.target.name] = event.target.value;
    this.setState(newState);
  }

  /* SignUpForm#render() */
  render() {
    let emailErrors = this.validate(this.state.email, { required: true, email: true });
    let emailValid = emailErrors ? (emailErrors.length == 0 ? true : false) : undefined;
    let passwordErrors = this.validate(this.state.password, { required: true, minLength: 6 });
    let passwordValid = passwordErrors ? (passwordErrors.length == 0 ? true : false) : undefined;
    let emailFeedback = emailErrors ? emailErrors.map((error) => <FormFeedback>{error}</FormFeedback>) : '';
    let passwordFeedback = passwordErrors ? passwordErrors.map((error) => <FormFeedback>{error}</FormFeedback>) : '';
    return (
      <form>

        {/* email */}
        <FormGroup aria-label="form" aria-required="true">
          <Label for="email">Email</Label>
          <Input onChange={(e) => this.handleChange(e)}
            id="email"
            type="email"
            name="email"
            valid={emailValid}
          />
          {emailErrors && emailErrors.map((error) => <FormFeedback key={error}>{error}</FormFeedback>)}
        </FormGroup>
        <FormGroup aria-label="form" aria-required="true">
          <Label for="password">Password</Label>
          <Input onChange={(e) => this.handleChange(e)}
            id="password"
            type="password"
            name="password"
            valid={passwordValid}
          />
          {passwordErrors && passwordErrors.map((error) => <FormFeedback key={error}>{error}</FormFeedback>)}
        </FormGroup>
        <FormGroup aria-label="form" aria-required="true">
            <Button color="primary" onClick={(e) => this.handleSignIn(e)}
                disabled={emailValid && passwordValid ? false : true} >
                Sign-in
            </Button>
        </FormGroup>
      </form>
    )
  }
}

//A simple component that displays the form, with alert callbacks
class SignInApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSignIn(email, password) {
    this.setState({ alert: `Signing in: '${email}'` });
  }

  render() {
    let alert = this.state.alert;
    let display = null;
    if (alert != undefined) {
      display = <Alert color="success">{alert}</Alert>;
    } else {
      display = <SignInForm
        signInCallback={(e, p) => this.handleSignIn(e, p)} />;
    }
    return (
      <div className="container">
        <header>
          <h1>Sign Up!</h1>
        </header>
        {display}
      </div>
    );
  }
}

export default SignInForm; 

