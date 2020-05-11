import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';

// Redux
import { connect } from "react-redux";

// Import Components
import Login from './components/Auth/Login';
import SideNav from "./components/Navigation/SideNav/sideNav";
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Main from "./components/Pantallas/Main/Main";
import Room from "./components/Pantallas/Room/Room";

function App(props) {
    const { isAuthenticated, isVerifying } = props;
    return (
        <div>
            {/* {isAuthenticated ? <TopMenu></TopMenu> : null} */}
            {isAuthenticated ? <SideNav></SideNav> : null}
            <Switch>
                {
                    <div className="mainDiv">
                    <ProtectedRoute
                        exact
                        path="/"
                        component={Main}
                        isAuthenticated={isAuthenticated}
                        isVerifying={isVerifying}
                    ></ProtectedRoute>
                    <ProtectedRoute
                        exact
                        path="/room"
                        component={Room}
                        isAuthenticated={isAuthenticated}
                        isVerifying={isVerifying}
                    ></ProtectedRoute>
                    <Route path="/login" component={Login} />
                    </div>
                    }
            </Switch>


        </div>
    );
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        isVerifying: state.auth.isVerifying
    };
}

export default connect(mapStateToProps)(App);