import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from 'reactstrap';
import SignUpForm from './SignUp';
import firebase from 'firebase/app';
import Join from './Join';
import Login from './Login';
import AddConvo from './AddConvo';
import './App.css';
import { ChatRoom } from './ChatRoom';
import { ConvoList, ConvoCard } from './Welcome';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';
import _ from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { conversations: [], loading: true };
  }

  componentDidMount() {
    this.authUnRegFunc = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) { //firebaseUser defined: is logged in
        this.setState({ user: firebaseUser, login: true });
      } else { //firebaseUser undefined: is not logged in
        this.setState({ user: null, login: false });
      }
      this.setState({ loading: false });
    });
    this.conversationsRef = firebase.database().ref('conversations'); ///finds existing conversations
    this.conversationsRef.on('value', (snapshot) => {
      if (snapshot.val() != null) {
        console.log(snapshot.val());
        this.setState({ conversations: snapshot.val() });
      }
    });
  }
  componentWillUnmount() {
    this.authUnRegFunc;
    this.conversationsRef.off();
  }

  render() {
    let conversations = Object.keys(this.state.conversations).map(obj => this.state.conversations[obj]["id"] = obj);
    conversations = Object.keys(this.state.conversations).map(obj => this.state.conversations[obj]);
    if (!_.find(conversations, { 'name': 'general' })) {
      console.log(conversations);
      console.log(this.state.user);
    }
    return (
      <div>
        <header className="jumbotron jumbotron-fluid py-4" aria-label="jumbotron-header" aria-required="true">
          <div className="container" aria-label="container" aria-required="true">
            <Link to="/"><h1>Flack</h1></Link>
          </div>
        </header>

        <main className="container">
          <div className="row">
            <div className="col-xs">
              {this.state.user &&
                <NavMenu conversations={conversations} currentUser={this.state.user} />}
            </div>
            <div className="col-9">
              <div>
                <Switch>
                  <Route exact path='/' render={(routerProps) => (
                    <ConvoList {...routerProps} conversations={conversations} login={this.state.login} currentUser={this.state.user} />
                  )} />
                  <Route exact path='/conversations' render={(routerProps) => (
                    <ConvoList {...routerProps} conversations={conversations} login={this.state.login} />
                  )} />
                  <Route path='/login' render={(routerProps) => (
                    <Login {...routerProps} user={this.state.user} loading={this.state.loading} />
                  )} />
                  <Route path='/join' render={(routerProps) => (
                    <Join {...routerProps} user={this.state.user} loading={this.state.loading} />
                  )} />
                  <Route path='/conversations/:Id' render={(routerProps) => (
                    <ChatRoom {...routerProps} user={this.state.user} conversations={conversations} />
                  )} />
                  <Route path='/add' render={(routerProps) => (
                    <AddConvo {...routerProps} convoArray={conversations} user={this.state.user} />
                  )} />
                  <Redirect to="/" />
                </Switch>
              </div>
            </div>
          </div>
        </main>

        <footer className="container">
          <small>Created by Vineeth Varghese and Anushree Shukla</small>
        </footer>
      </div>
    );
  }
}

class NavMenu extends Component {
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  //A callback function for logging out the current user
  handleSignOut() {
    this.setState({ errorMessage: null }); //clear any old errors
    firebase.auth().signOut().catch((error) => { //report any errors
      this.setState({ errorMessage: error.message });
    });
  }

  render() {
    let navItems = this.props.conversations.map((conversation) => {
      if (conversation.userId1 == this.props.currentUser.uid) {
        return <NavMenuItems conversation={conversation} key={conversation.name} />;
      }
    });
    return (
      <Navbar color="faded" light>
        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
        <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav navbar >
            <NavItem>
              <NavLink exact to="/" activeClassName='activeLink'>Home</NavLink>
            </NavItem>
            {navItems}
            <NavItem>
              <NavLink to="/add" activeClassName='activeLink'>Add Conversation</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/" onClick={() => this.handleSignOut()} >Log Out</NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

// add chats to the nav bar
class NavMenuItems extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.props.conversation.messages != 0 | this.props.conversation.name === 'general') { //displays only if conversation has message unless it's general
      return (<NavItem>
        <NavLink exact to={"/conversations/" + this.props.conversation.name} activeClassName='activeLink'>{this.props.conversation.name}</NavLink>
      </NavItem>);
    } else {
      return '';
    }

  }
}
export default App;