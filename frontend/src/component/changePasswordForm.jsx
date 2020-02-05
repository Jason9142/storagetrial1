import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import userService from "../services/userService";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import Paper from "@material-ui/core/Paper";
import auth from "../services/authService";
import CircularProgress from "@material-ui/core/CircularProgress";

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    padding: theme.spacing(2),
    overflow: "auto",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
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
    marginTop: -100,
    marginLeft: -100,
    zIndex: 1
  }
});

class ChangePasswordForm extends Component {
  state = {
    data: {
      open: false,
      Transition: Grow,
      password: "",
      newPassword: "",
      confirmNewPassword: ""
    },
    passwordReset: false,
    isPassword: false,
    isMatch: false,
    isLoading: false,
    id: this.props.match.params.id
  };

  handleChange = ({ currentTarget: input }) => {
    const data = { ...this.state.data };
    data[input.name] = input.value;

    if (input.name === "newPassword") {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      const isPassword = regex.test(input.value);
      const isMatch = input.value === data.confirmNewPassword;
      this.setState({ isPassword, isMatch });
    }

    if (input.name === "confirmNewPassword") {
      const isMatch = input.value === data.newPassword;
      this.setState({ isMatch });
    }
    this.setState({ data });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const { newPassword, confirmNewPassword } = this.state.data;
    if (newPassword === confirmNewPassword) {
      await userService.updatePassword(this.state.id, this.state.data);
      this.setState({ open: true, passwordReset: true, isLoading: false });
      return setTimeout(() => {
        this.goBack();
      }, 5000);
    }
    this.setState({ open: true, passwordReset: false, isLoading: false });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const notPassword =
      this.state.data.newPassword && !this.state.isPassword ? true : false;
    const notMatch =
      this.state.data.confirmNewPassword && !this.state.isMatch ? true : false;
    const message = this.state.passwordReset
      ? "Password has been changed. Redirecting to profile page in 5 seconds..."
      : "An error has occured";

    return (
      <div className={classes.root}>
        <TabContainer>
          {this.state.isLoading && (
            <CircularProgress size={80} className={classes.progress} />
          )}
          <Container maxWidth="lg">
            <Button
              className={classes.backButton}
              variant="text"
              size="large"
              color="primary"
              onClick={this.goBack}
            >
              <ChevronLeft />
              Back
            </Button>
            <Paper className={classes.paper}>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
              >
                <Grid item xs={6}>
                  <Container component="main" maxWidth="xs">
                    <div className={classes.paper}>
                      <Typography component="h1" variant="h5">
                        Change Password
                      </Typography>
                      <form
                        className={classes.form}
                        noValidate
                        onSubmit={this.handleSubmit}
                      >
                        {!auth.getCurrentUser().isAdmin && (
                          <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Old Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={this.handleChange}
                          />
                        )}

                        <TextField
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          name="newPassword"
                          label="New Password"
                          type="password"
                          id="newPassword"
                          // error={notPassword}
                          helperText={
                            this.state.data.newPassword &&
                            !this.state.isPassword
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
                          error={notMatch}
                          helperText={
                            this.state.data.confirmNewPassword &&
                            !this.state.isMatch
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
                          Change Password
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
              </Grid>
            </Paper>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

ChangePasswordForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(ChangePasswordForm);
