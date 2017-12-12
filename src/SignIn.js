import React, { Component } from 'react'; //import React Component
import { FormFeedback, Alert, FormGroup, Label, Input, Button } from 'reactstrap'
import { Redirect } from 'react-router-dom'

// Form used to log in the user with their credentials
class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined,
    }; //initialize state
  }

  // Callback for the sign in button 
  handleSignIn(event) {
    event.preventDefault(); //don't submit
    this.props.signInCallback(this.state.email, this.state.password);
  }

  // Handles input from the user in a text field
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  /**
   * A helper function to validate a value based on an object of validations
   * Second parameter has format e.g., 
   *    {required: true, minLength: 5, email: true}
   * (for required field, with min length of 5, and valid email)
   */
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


  /* SignUpForm#render() */
  render() {
    let emailErrors = this.validate(this.state.email, { required: true, email: true });
    let passwordErrors = this.validate(this.state.password, { required: true, minLength: 6 });
    let handleErrors = this.validate(this.state.handle, { required: true });

    function isValid(arr) {
      if (arr) {
        if (arr.length > 0) {
          return false;
        } else {
          return true
        }
      } else {
        return undefined;
      }
    }

    // Boolean values for valid input
    let emailValid = isValid(emailErrors);
    let passwordValid = isValid(passwordErrors);

    // Only show if user is NOT logged in
    if (!this.props.user) {
      return (
        <form>

          {/* email */}
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              role="textbox"
              id="email"
              type="email"
              name="email"
              onChange={(event) => this.handleChange(event)}
              valid={emailValid}
            />
            {emailErrors && emailErrors.length > 0 &&
              emailErrors.map((err) => <FormFeedback key={err}>{err}</FormFeedback>)
            }
          </FormGroup>

          {/* password */}
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              role="textbox"
              id="password"
              type="password"
              name="password"
              onChange={(event) => this.handleChange(event)}
              valid={passwordValid}
            />
            {passwordErrors && passwordErrors.length > 0 &&
              passwordErrors.map((err) => <FormFeedback key={err}>{err}</FormFeedback>)
            }
          </FormGroup>

          {/* buttons */}
          <FormGroup>
            <Button
              role="button"
              disabled={!emailValid || !passwordValid} color="success" onClick={(e) => this.handleSignIn(e)} >
              Sign-in
          </Button>
          </FormGroup>

        </form>
      )
    }
    // Redirect if user is logged in
    else {
      return <Redirect to='/' />
    }
  }
}

export default SignInForm; //the default export
