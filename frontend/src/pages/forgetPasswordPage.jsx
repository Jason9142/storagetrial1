import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import auth from "../services/authService";
import user from "../services/userService";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import { Link } from "react-router-dom";
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
    alignItems: "center",
    margin: theme.spacing(1)
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
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

class ForgetPasswordPage extends Component {
  state = {
    open: false,
    Transition: Grow,
    data: {
      email: ""
    },
    sent: false,
    message: "",
    isEmail: false,
    isLoading: false
  };

  handleClick = async e => {
    e.preventDefault();
    let message = "";
    let sent = false;
    this.setState({ isLoading: true });
    try {
      await user.forgetPassword(this.state.data);
      message = `Email sent to ${this.state.data.email}`;
      sent = true;
    } catch (error) {
      message = error.data;
      sent = false;
    }
    this.setState({ open: true, sent, message, isLoading: false });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.value;
    if (input.name === "email") {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const checkEmail = re.test(input.value);
      this.setState({ isEmail: checkEmail });
    }

    this.setState({ data });
  };
  render() {
    const { classes } = this.props;
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justify="center"
        style={{ minHeight: "100vh" }}
      >
        <Grid item xs={12}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            {this.state.isLoading && (
              <CircularProgress size={80} className={classes.progress} />
            )}
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                Enter your registered e-mail address and we'll email
                instructions for setting a new password.
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
                  autoComplete="email"
                  error={this.state.data.email && !this.state.isEmail}
                  helperText={
                    this.state.data.email && !this.state.isEmail
                      ? "Invalid email"
                      : ""
                  }
                  onChange={this.handleChange}
                />

                <Grid item align="right">
                  <Button
                    className={classes.button}
                    variant="text"
                    size="small"
                    color="primary"
                    component={Link}
                    to="/login"
                  >
                    Back to login
                  </Button>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={this.state.sent || !this.state.isEmail}
                  onClick={this.handleClick}
                >
                  Send
                </Button>
              </form>
              <Snackbar
                open={this.state.open}
                onClose={this.handleClose}
                TransitionComponent={this.state.Transition}
                ContentProps={{
                  "aria-describedby": "message-id"
                }}
                message={<span id="message-id">{this.state.message}</span>}
              />
            </div>
          </Container>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ForgetPasswordPage);
