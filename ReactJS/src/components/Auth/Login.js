import React, { Component } from 'react';
import '../css/style.css';
import '../css/simplebar.css';
import '../css/tiny-slider.css';
import '../css/bootstrap.min.css';


// Redux
import { loginUser } from "../../Redux/actions";
import { connect } from "react-redux";


import { FaGoogle } from 'react-icons/fa';

class Login extends Component {
    state = { auth: "" };
    handleSubmit = () => {
        const { dispatch } = this.props;
        dispatch(loginUser());
    };
    render() {
        const { isAuthenticated, userName } = this.props;
        if (!isAuthenticated) {
            return (
                <div className="landing">
                {/* https://i.ibb.co/CBJRLPz/1629.jpg BACKGROUND 2 */}
                    <div className="landing-decoration"></div>
                    <div className="landing-info">
                        <h2 className="landing-info-pretitle">Se parte de</h2>
                        <h1 className="landing-info-title">VideoCode</h1>
                        <p className="landing-info-text">Plataforma de salas para comunicarse y codear entre programadores!.</p>
                    </div>
                    <div className="landing-form">
                        <div className="form-box login-register-form-element">
                            <h2 className="form-box-title">Ingresar</h2>
                            <p className="lined-text">Inicia sesión facilmente</p>
                            <div className="social-links">
                                <a className="social-link youtube" style={{color: 'white'}} onClick={this.handleSubmit}>
                                    <FaGoogle />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }

}

function mapStateToProps(state) {
    return {
        isLoggingIn: state.auth.isLoggingIn,
        loginError: state.auth.loginError,
        isAuthenticated: state.auth.isAuthenticated,
        userName: state.auth.user.displayName
    };
}
export default connect(mapStateToProps)(Login);