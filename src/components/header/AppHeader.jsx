import React from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-responsive-modal';
import SuccessModal from 'react-responsive-modal';
import {setCookie,getCookie,ajaxPost,API_HOST} from "../../services/config"

import { alertService } from 'services/alert';

import { SignUpForm } from '../modal';
import { SignInForm } from '../modal';

import {authService} from 'services/auth';
import 'assets/styles/header.scss';
import 'assets/styles/sign/modal.scss';
import 'assets/styles/sign/signin.scss';
export class AppHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      menu_open: false,
      is_logged_in: authService.isSigned(),
      user_name: authService.userName(),
      is_signup_form: true,
      signup_visible: false,
      is_signup_success: false,
      email:"",
      email_code:""
    }

    this.handleMenuOpen = this.handleMenuOpen.bind(this);
    this.signUpModalShowHandler = this.signUpModalShowHandler.bind(this);
    this.signInModalShowHandler = this.signInModalShowHandler.bind(this);
    this.handleSingInForm = this.handleSingInForm.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onLoginHandler = this.onLoginHandler.bind(this);
    this.onSignupSuccess = this.onSignupSuccess.bind(this);
    this.facebook=this.facebook.bind(this);
    this.handleChangeVerficatedCode=this.handleChangeVerficatedCode.bind(this)
    this.handleSubmitVerification=this.handleSubmitVerification.bind(this);
  }

  componentDidMount() {
    if ((window.location.pathname.includes('rooms') 
      || window.location.pathname.includes('dashboard')
      || window.location.pathname.includes('inbox'))
      && authService.isSigned() === false) {
      window.location.href = '/';
    }
  }
  handleChangeVerficatedCode(e)
  {
      this.setState({email_code:e.target.value});
  }
  handleSubmitVerification(e)
  {
    e.preventDefault();
    const code=this.state.email_code;
    const email=this.state.email;
    const data={email_code:code,email:email};
    ajaxPost(API_HOST+'/ajax/verifyuser',data).then(res=>{
      if(res.success==true)
      {
        alertService.showSuccess("Your email verified", "");
        window.location.href="/";
      }
      else
      {
        alertService.showError("Verification Failed", "");
      }
    });
  }
  facebook(){
    this.setState({is_logged_in: true, user_name: authService.userName()});
    window.location.href="/";
  }
  handleMenuOpen() {
    this.setState({
      menu_open: !this.state.menu_open
    })
  }
  signInModalShowHandler(e) {
    this.setState({
      is_signup_form: false,
      signup_visible: !this.state.signup_visible
    })
  }
  signUpModalShowHandler(e) {
    this.setState({
      is_signup_form: true,
      signup_visible: !this.state.signup_visible
    })
  }

  handleSingInForm() {
    this.setState({
      is_signup_form: !this.state.is_signup_form
    })
  }

  onLoginHandler(email, password) {
    this.setState({email:email});
    authService.signIn(email, password).then(res => {
      if (res) { 
        if (res.success === true) {
          alertService.showSuccess("Login Success", "");
          this.setState({is_logged_in: true, user_name: authService.userName()});
          
          window.location.href = '/';
        }
        else if (res.success === 'notVerify') {
          alertService.showWarning("You must verify the email", "");
          this.setState({ is_signup_success : true,signup_visible: false});
        }
        else {
          alertService.showWarning(res.message, "");
        }
      }
      else {
        alertService.showError("Login Failed", "");
      }
    })
  }

  onForgotPasswordHandler(email) {
    authService.forgotPassword(email).then(res => {
      if (res && res.success === true) {
        // toast success.
        alertService.showSuccess("Please check your email", "");
        window.location.href = '/';
      }
      else {
        // toast error.
        alertService.showError("No email address matches your entry", "");
      }
    })
  }

  onSignupSuccess() {
    const email=getCookie('email');
    this.setState({
      email:email,
      signup_visible : false,
      is_signup_success : true
    })
  }

  onLogout(e) {
    e.preventDefault();
    authService.signOut().then(res => {
      window.location.href = '/';
    });
  }

  render() {
    const {is_logged_in, menu_open} = this.state;
    if (is_logged_in) {
      return (
        <div className="header">
          <div className="container">
            <div className="header-container">
              <div className="logo" data-mobile-logo="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp" data-sticky-logo="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp">
                <Link to='/'><img src="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp" alt="logo" width='100%' height = 'auto' /></Link>
              </div>
              <div className={menu_open ? "burger-menu menu-open" : "burger-menu"} onClick={this.handleMenuOpen}>
                <div className="line-menu line-half first-line" />
                <div className="line-menu" />
                <div className="line-menu line-half last-line" />
              </div>
              <nav className="navik-menu">
                <ul className={menu_open ? "d-h-auto" : "d-h-0"}>
                  <li>
                    <Link to="/help">
                      Help
                    </Link>
                  </li>
                  <li className="submenu-right">
                    <a href="#inbox-submenu" data-target="#inbox-submenu">
                      Mail
                      <span></span>
                    </a>
                    <ul>
                      <li>
                        <Link to="/inbox" className="link-reset view-trips">
                          <span className=' text-black'>Messages</span><small>(View Inbox)</small>
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard" className="link-reset view-trips">
                          <span className=' text-black'>Notifications</span><small>(View Dashboard)</small>
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="submenu-right">
                    <a href="#dashboard-submenu" data-target="#dashboard-submenu">
                      Hi {this.state.user_name}
                      <span></span>
                    </a>
                    <ul>
                      <li><a className="dropdown-item menuitems" href="/dashboard">Dashboard</a></li>
                      <li><a className="dropdown-item menuitems" href="/dashboard/room-listing">Your Listings</a></li>
                      <li><a className="dropdown-item menuitems" href="/dashboard/myprofile">Edit Profile</a></li>
                      <li><a className="dropdown-item menuitems" href="/dashboard/myaccount">Account</a></li>
                      <li><a className="dropdown-item menuitems" href="/dashboard/account_ba">BookingAutomation</a></li>
                      <li><a className="dropdown-item menuitems" href="/dashboard/ba_update">Update</a></li>
                      <div className="dropdown-divider" />
                      <li><a href='#logout' onClick={(e) => this.onLogout(e)}>LogOut</a></li>
                    </ul>
                  </li>
                  <li>
                    <a href="/rooms/new">
                      List your Home
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )
  }
  else {
    let is_signup_form = this.state.is_signup_form;
    let is_singin_form = !is_signup_form;
    let modal_footer_text = (
        <div className=" text-center">
          Already a Vacation.Rentals member? &nbsp;
          <Link to="#" className="modal-link link-to-login-in-signup login-btn login_popup_head link_color" onClick={this.handleSingInForm} aria-label="Input Text"> Log In </Link>
        </div>
      );
      const email_code={width:'300px',height:'35px'};
      const email_button={boxShadow:'1px 2px 2px green',color: 'darkblue',borderRadius: '0.5em',fontSize: '20px',margin:'15px',width:"150px",height:'40px',background:'rgb(191, 244, 190)'};
    if (is_singin_form) {
      modal_footer_text = (
        <div className=" text-center">
          Don’t have an account?
          <Link to="#" className="ml-1 link-to-signup-in-login login-btn link_color signup_popup_head" onClick={this.handleSingInForm} aria-label="Input Text"> Sign Up </Link>
        </div>
      );
    }
    return (
      <div className="header">
        <div className="container">
          <div className="header-container">
            <div className="logo" 
              data-mobile-logo="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp" 
              data-sticky-logo="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp">
              <a href='/'>
                <img src="https://res.cloudinary.com/vacation-rentals/image/upload/v1555704142/images/logo.webp" alt="logo" />
              </a>
            </div>
            <div className={menu_open ? "burger-menu menu-open" : "burger-menu"} onClick={this.handleMenuOpen}>
              <div className="line-menu line-half first-line" />
              <div className="line-menu" />
              <div className="line-menu line-half last-line" />
            </div>
            <nav className="navik-menu">
              <ul className={menu_open ? "d-h-auto" : "d-h-0"}>
                <li>
                  <Link to="#" name="singin" onClick={this.signInModalShowHandler}>
                    Log In
                    <div className="hover-transition"></div>
                  </Link>
                </li>
                <li>
                  <Link to="#" name="singup" onClick={this.signUpModalShowHandler}>
                    Sign Up
                    <div className="hover-transition"></div>
                  </Link>
                </li>
                <li>
                  <Link to="/help">
                    Help
                    <div className="hover-transition"></div>
                  </Link>
                </li>
                <li>
                  <Link to="/contactus">
                    Contact Us
                    <div className="hover-transition"></div>
                  </Link>
                </li>
                <li>
                  {/* <Link to="#" onClick={handleShowSigninModal}> */}
                  <Link to="/rooms/new">
                    List your Home
                    <div className="hover-transition"></div>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <SuccessModal open={this.state.is_signup_success} onClose={() => this.setState({ is_signup_success: false })} styles={{ modal: { padding: '0px' } }}>
          <div className="modal-content modal-newsletter">
            <form onSubmit={this.handleSubmitVerification}>
              <div className="modal-header">
              </div>
              <div className="modal-body text-center">
                <div className="icon-box mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M494.586 164.516c-4.697-3.883-111.723-89.95-135.251-108.657C337.231 38.191 299.437 0 256 0c-43.205 0-80.636 37.717-103.335 55.859-24.463 19.45-131.07 105.195-135.15 108.549A48.004 48.004 0 0 0 0 201.485V464c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V201.509a48 48 0 0 0-17.414-36.993zM464 458a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6V204.347c0-1.813.816-3.526 2.226-4.665 15.87-12.814 108.793-87.554 132.364-106.293C200.755 78.88 232.398 48 256 48c23.693 0 55.857 31.369 73.41 45.389 23.573 18.741 116.503 93.493 132.366 106.316a5.99 5.99 0 0 1 2.224 4.663V458zm-31.991-187.704c4.249 5.159 3.465 12.795-1.745 16.981-28.975 23.283-59.274 47.597-70.929 56.863C336.636 362.283 299.205 400 256 400c-43.452 0-81.287-38.237-103.335-55.86-11.279-8.967-41.744-33.413-70.927-56.865-5.21-4.187-5.993-11.822-1.745-16.981l15.258-18.528c4.178-5.073 11.657-5.843 16.779-1.726 28.618 23.001 58.566 47.035 70.56 56.571C200.143 320.631 232.307 352 256 352c23.602 0 55.246-30.88 73.41-45.389 11.994-9.535 41.944-33.57 70.563-56.568 5.122-4.116 12.601-3.346 16.778 1.727l15.258 18.526z"/></svg>
                </div>
                <h4>Thank you for your registration</h4>
                <p>Please check your email inbox to verify your account.</p>
                <input style={email_code} placeholder="Please enter the code" id="email_code" name="email_code" onChange={this.handleChangeVerficatedCode} type="text"  />
                    <button style={email_button} type="submit">Confirm</button>
                <p>If there is no new email, please check spam folder.</p>
              </div>
            </form>
          </div>
        </SuccessModal>
        <Modal open={ this.state.signup_visible } onClose={()=>this.setState({signup_visible : false})} styles={{ modal : { padding : '0px'} }} center>
          <div className="sign-modal">
            <div className="modal-body">
              <SignUpForm
                visible={is_signup_form}
                onSignupSuccess={this.onSignupSuccess}
              />
              <SignInForm
                visible={is_singin_form}
                facebooklogin={this.facebook}
                onForgotPassword={(email) => this.onForgotPasswordHandler(email)}
                onLogin={(email, password) => this.onLoginHandler(email, password)}
              />
            </div>
            <div className="modal-footer">
              { modal_footer_text }
            </div>
          </div>
        </Modal>
      </div>
      );
    }
  }
}
