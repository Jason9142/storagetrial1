import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import auth from "../services/authService";
import { Redirect } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import { Link } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

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
  button: {
    textTransform: "none"
  },
  imgWrapper: {
    marginBottom: theme.spacing(3)
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

class Login extends Component {
  state = {
    data: {
      email: "",
      password: ""
    },
    message: "",
    transition: Grow,
    open: false,
    isLoading: false,
    isEmail: false,
    redirect: false
  };

  // For 2FA
  async componentDidMount() {
    const path = window.location.pathname;
    if (path !== "/login") {
      await auth
        .verify2fa(path.split("/")[2])
        .then(function () {
          window.location = "/";
        })
        .catch(() => {
          this.setState({ redirect: true });
        });
    }
  }

  handleSubmit = async e => {
    e.preventDefault();
    let message = "";
    this.setState({ isLoading: true });
    try {
      const { data } = this.state;
      await auth.login(data.email, data.password);
      message =
        "Please close this browser and check your email to perform 2-factor authorization.";
    } catch (ex) {
      if (ex && ex.status === 400) {
        message = ex.data;
      } else {
        message = "An unexpected error has occured";
      }
    }
    this.setState({ message, open: true, isLoading: false });
  };

  handleChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.value;

    if (input.name === "email") {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const checkEmail = re.test(input.value);
      this.setState({ isEmail: checkEmail });
    }

    data.email = data.email.toLowerCase();
    this.setState({ data });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const user = auth.getCurrentUser();
    if (user) return <Redirect to="/dashboardPage" />;

    const path = window.location.pathname;
    if (path !== "/login")
      return !this.state.redirect ? null : <Redirect to="../not-found" />;

    const { classes } = this.props;

    const notEmail =
      this.state.data.email && !this.state.isEmail ? true : false;
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={6}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
              <div className={classes.imgWrapper}>
                <img
                  alt="Logo"
                  src={require("../assets/img/logo.png")}
                  className={classes.bigAvatar}
                />
              </div>{" "}
              <Typography component="h1" variant="h5">
                Sign in
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
                  id="email"
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  error={notEmail}
                  helperText={
                    this.state.data.email && !this.state.isEmail
                      ? "Invalid email"
                      : ""
                  }
                  onChange={this.handleChange}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  onChange={this.handleChange}
                />
                <Grid item align="right">
                  <Button
                    className={classes.button}
                    variant="text"
                    size="small"
                    color="primary"
                    component={Link}
                    to="/forgetPassword"
                  >
                    Forget Password?
                  </Button>
                </Grid>

                {this.state.isLoading && (
                  <CircularProgress size={80} className={classes.progress} />
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={this.handleSubmit}
                >
                  Sign In
                </Button>
              </form>
              <Snackbar
                open={this.state.open}
                autoCapitalize="true"
                autoHideDuration={4000}
                onClose={this.handleClose}
                TransitionComponent={this.state.transition}
                ContentProps={{
                  "aria-describedby": "message-id"
                }}
                message={<span id="message-id">{this.state.message}</span>}
              />
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Two-factor Authentication"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {this.state.message}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.handleClose}
                    variant="contained"
                    color="primary"
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </Container>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(Login);
