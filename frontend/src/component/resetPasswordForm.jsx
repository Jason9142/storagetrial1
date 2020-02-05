import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import userService from "../services/userService";
import { Redirect } from "react-router-dom";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  progress: {
    color: "primary",
    position: "absolute",
    top: "65%",
    left: "50%",
    marginTop: -40,
    marginLeft: -40,
    zIndex: 1
  }
});

class ResetPassword extends Component {
  state = {
    data: {
      open: false,
      Transition: Grow,
      newPassword: "",
      confirmNewPassword: ""
    },
    isValid: "",
    passwordReset: false,
    isPassword: false,
    isMatch: false,
    isLoading: false
  };

  async componentDidMount() {
    const pathParam = window.location.pathname.split("/")[
      window.location.pathname.split("/").length - 1
    ];
    try {
      await userService.authenticateToken({
        token: pathParam
      });
      this.setState({ isValid: true, token: pathParam });
    } catch (ex) {
      this.setState({ isValid: false });
    }
  }

  handleChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.value;
    // let isMatch = "";
    // let isPassword = "";

    if (input.name === "newPassword") {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      const isPassword = re.test(input.value);
      const isMatch = input.value === data.confirmNewPassword;
      this.setState({ isPassword, isMatch });
    }

    if (input.name === "confirmNewPassword") {
      const isMatch = input.value === this.state.data.newPassword;
      this.setState({ isMatch });
    }

    this.setState({ data });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const { newPassword, confirmNewPassword } = this.state.data;
    const { token, data } = this.state;
    this.setState({ isLoading: true });
    if (newPassword === confirmNewPassword) {
      await userService.resetPassword(token, data);
      // Do pop-up "Password has been changed. Redirecting to login page in 5 seconds..."
      this.setState({ open: true, passwordReset: true, isLoading: false });
      return setTimeout(() => {
        window.location = "/login";
      }, 5000);
    }

    this.setState({ open: true, passwordReset: false });
  };

  render() {
    const { classes } = this.props;
    if (this.state.isValid !== "" && this.state.isValid !== true)
      return <Redirect to="/not-found" />;

    const message = this.state.passwordReset
      ? "Password has been changed. Redirecting to login page in 5 seconds..."
      : "An error has occured";

    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        {this.state.isValid === true && (
          <Grid item xs={6}>
            <Container component="main" maxWidth="xs">
              <CssBaseline />
              {this.state.isLoading && (
                <CircularProgress size={80} className={classes.progress} />
              )}
              <div className={classes.paper}>
                <Typography component="h1" variant="h5">
                  Reset Password
                </Typography>
                <form
                  className={classes.form}
                  noValidate
                  onSubmit={this.handleSubmit}
                >
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type="password"
                    id="newPassword"
                    // error={
                    //   this.state.data.newPassword && !this.state.isPassword
                    // }
                    helperText={
                      this.state.data.newPassword && !this.state.isPassword
                        ? "We recommend that your password should be more than 8 characters; contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character,"
                        : ""
                    }
                    autoComplete="current-password"
                    onChange={this.handleChange}
                  />

                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    name="confirmNewPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirmNewPassword"
                    error={
                      this.state.data.confirmNewPassword && !this.state.isMatch
                    }
                    helperText={
                      this.state.data.confirmNewPassword && !this.state.isMatch
                        ? "Please make sure your passwords match"
                        : ""
                    }
                    autoComplete="current-password"
                    onChange={this.handleChange}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={this.handleSubmit}
                    disabled={
                      // !this.state.isPassword ||
                      "" || !this.state.isMatch
                    }
                  >
                    Reset
                  </Button>
                </form>
                <Snackbar
                  open={this.state.open}
                  onClose={this.handleClose}
                  TransitionComponent={this.state.Transition}
                  ContentProps={{
                    "aria-describedby": "message-id"
                  }}
                  message={<span id="message-id">{message}</span>}
                />
              </div>
            </Container>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default withStyles(styles)(ResetPassword);
