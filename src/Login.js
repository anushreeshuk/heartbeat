import React, { Component } from 'react'; //import React Component
import SignInForm from './SignIn'; //does this work?!
import firebase from 'firebase/app';
import { Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {  };
    }

    //A callback function for logging in existing users
    handleSignIn(email, password) {
        this.setState({ errorMessage: null }); //clear any old errors

        firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => { //report any errors
            this.setState({ errorMessage: error.message })
        });

    }

    render() {
        let content = null; //content to render
        if (!this.props.user) { //if logged out, show signup form
            content = (
                <div className="container">
                    <h1>Login</h1>
                    <SignInForm
                        signInCallback={(e, p) => this.handleSignIn(e, p)}
                    />
                    <NavLink to='/join' >No Account? Sign Up here!</NavLink>
                </div>
            );
        }

        else { //if logged in, show welcome message
            content = (
                <div>
                    <Redirect exact to='/' />
                </div>
            );
        }

        let display;
        if (this.props.loading) {
            display = <div className="text-center">
                <i className="fa fa-spinner fa-spin fa-3x" aria-label="Connecting..."aria-label="spinner" aria-required="true"></i>
            </div>;
        }
        
        return (
            <div>
                {display}
                {this.state.errorMessage &&
                    <p className="alert alert-danger">{this.state.errorMessage}</p>
                }
                {content}
            </div>
        );
    }
}

export default Login;