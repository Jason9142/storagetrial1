import React, { Component } from "react";
import PropTypes from "prop-types";
import userService from "../services/userService";
import Dropzone from "react-dropzone";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Grow from "@material-ui/core/Grow";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Snackbar from "@material-ui/core/Snackbar";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";

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
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing(2),
    overflow: "auto",
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  form: {
    width: "40%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  backButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1)
  },
  dropzone: {
    width: "100%",
    height: "20%",
    border: "1px dashed black",
    textAlign: "center",
    opacity: 0.3
  }
});

class AdminAddUserForm extends Component {
  state = {
    data: {
      isAdmin: false,
      customerNum: "",
      endDate: "",
      email: "",
      name: "",
      dateOfBirth: "",
      identificationNum: "",
      contactNum: "",
      address: "",
      password: "",
      proofOfAddress: [],
      proofOfIdentification: []
    },
    isEmail: false,
    isNumber: false,
    isPassword: false,
    open: false,
    transition: Grow,
    message: ""
  };

  handleChange = (e, name) => {
    const target = e.target ? e.target : e.currentTarget;
    const data = { ...this.state.data };
    data[target.name] = target.value;

    if (!target.name) {
      data[name] = target.value === "true";
    }

    if (target.name === "email") {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const checkEmail = re.test(target.value);
      this.setState({ isEmail: checkEmail });
    }
    if (target.name === "contactNum") {
      const re = /^[+][0-9]*$/;
      const checkNumber = re.test(target.value);
      this.setState({ isNumber: checkNumber });
    }

    if (target.name === "password") {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
      const checkPass = re.test(target.value);
      this.setState({ isPassword: checkPass });
    }

    this.setState({ data });
  };

  handleSubmit = async e => {
    e.preventDefault();
    let data = new FormData();
    data.append("customerNum", this.state.data.customerNum.toUpperCase());
    data.append("isAdmin", this.state.data.isAdmin);
    data.append("endDate", this.state.data.endDate);
    data.append("email", this.state.data.email);
    data.append("name", this.state.data.name);
    data.append("dateOfBirth", this.state.data.dateOfBirth);
    data.append("identificationNum", this.state.data.identificationNum);
    data.append("contactNum", this.state.data.contactNum);
    data.append("address", this.state.data.address);
    data.append("password", this.state.data.password);
    data.append("proofOfAddress", this.state.data.proofOfAddress);
    data.append("proofOfIdentification", this.state.data.proofOfIdentification);

    try {
      await userService.saveUser(data, null);
      this.props.history.goBack();
    } catch (error) {
      this.setState({ open: true, message: error.data });
    }
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const {
      isAdmin,
      customerNum,
      email,
      name,
      dateOfBirth,
      identificationNum,
      contactNum,
      address,
      password,
      endDate
    } = this.state.data;

    const notEmail =
      this.state.data.email && !this.state.isEmail ? true : false;
    const notNumber =
      this.state.data.contactNum && !this.state.isNumber ? true : false;
    const notPassword =
      this.state.data.password && !this.state.isPassword ? true : false;
    return (
      <div className={classes.root}>
        <TabContainer>
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
              <Typography component="h1" variant="h5">
                Add New User
              </Typography>
              <form
                className={classes.form}
                noValidate
                onSubmit={this.handleSubmit}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdmin}
                          onChange={e => this.handleChange(e, "isAdmin")}
                          value={!isAdmin}
                        />
                      }
                      label="Admin"
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="customerNum"
                      label="Customer No"
                      name="customerNum"
                      autoComplete="customerNum"
                      autoFocus
                      onChange={this.handleChange}
                      value={customerNum}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="endDate"
                      name="endDate"
                      label="Customer Storage End Date"
                      type="date"
                      InputLabelProps={{
                        shrink: true
                      }}
                      value={endDate}
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      error={notEmail}
                      helperText={
                        this.state.data.email && !this.state.isEmail
                          ? "Invalid email"
                          : ""
                      }
                      onChange={this.handleChange}
                      value={email}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="password"
                      label="Password"
                      name="password"
                      autoComplete="password"
                      type="password"
                      // error={notPassword}
                      helperText={
                        notPassword
                          ? "We recommend that your password should be more than 8 characters; contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character,"
                          : ""
                      }
                      onChange={this.handleChange}
                      value={password}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      name="name"
                      autoComplete="name"
                      onChange={this.handleChange}
                      value={name}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="dateOfBirth"
                      name="dateOfBirth"
                      label="Date Of Birth"
                      type="date"
                      InputLabelProps={{
                        shrink: true
                      }}
                      value={dateOfBirth}
                      onChange={this.handleChange}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="identificationNum"
                      label="Identification Num"
                      name="identificationNum"
                      autoComplete="identificationNum"
                      onChange={this.handleChange}
                      value={identificationNum}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="contactNum"
                      label="Contact Num"
                      name="contactNum"
                      autoComplete="contactNum"
                      error={notNumber}
                      helperText={
                        this.state.data.contactNum && !this.state.isNumber
                          ? "Invalid contact number. Please start by entering a plus sign (+). Enter the country code, followed by the full contact number. "
                          : ""
                      }
                      onChange={this.handleChange}
                      value={contactNum}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      id="address"
                      label="Address"
                      name="address"
                      autoComplete="address"
                      onChange={this.handleChange}
                      value={address}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Dropzone
                      accept={["image/png", "image/jpeg", "application/pdf"]}
                      onDrop={acceptedFiles => {
                        this.setState({
                          data: {
                            ...this.state.data,
                            proofOfAddress: acceptedFiles[0]
                          }
                        });
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div className={classes.dropzone} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>
                              Upload proof of address <br />
                              here
                            </p>
                          </div>
                          <aside>
                            <h4>Proof of Address Uploaded</h4>
                            <ul>
                              <li key={this.state.data.proofOfAddress.path}>
                                {this.state.data.proofOfAddress.path} -{" "}
                                {this.state.data.proofOfAddress.size} bytes
                              </li>
                            </ul>
                          </aside>
                        </section>
                      )}
                    </Dropzone>
                  </Grid>

                  <Grid item xs={6}>
                    <Dropzone
                      accept={["image/png", "image/jpeg", "application/pdf"]}
                      onDrop={acceptedFiles => {
                        this.setState({
                          data: {
                            ...this.state.data,
                            proofOfIdentification: acceptedFiles[0]
                          }
                        });
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section>
                          <div className={classes.dropzone} {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Upload proof of identification here</p>
                          </div>
                          <aside>
                            <h4>Proof of Identification Uploaded</h4>
                            <ul>
                              <li
                                key={this.state.data.proofOfIdentification.path}
                              >
                                {this.state.data.proofOfIdentification.path} -{" "}
                                {this.state.data.proofOfIdentification.size}{" "}
                                bytes
                              </li>
                            </ul>
                          </aside>
                        </section>
                      )}
                    </Dropzone>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={
                      !this.state.isEmail ||
                      !this.state.isNumber ||
                      this.state.data.password === "" ||
                      this.state.data.customerNum === "" ||
                      this.state.data.name === "" ||
                      this.state.data.dateOfBirth === "" ||
                      this.state.data.identificationNum === "" ||
                      this.state.data.endDate === "" ||
                      this.state.data.address === "" ||
                      this.state.data.proofOfAddress.path === undefined ||
                      this.state.data.proofOfIdentification.path === undefined
                    }
                    className={classes.submit}
                    onClick={this.handleSubmit}
                  >
                    Add
                  </Button>

                  <Snackbar
                    open={this.state.open}
                    onClose={this.handleClose}
                    autoHideDuration={3000}
                    TransitionComponent={this.state.transition}
                    ContentProps={{
                      "aria-describedby": "message-id"
                    }}
                    message={<span id="message-id">{this.state.message}</span>}
                  />
                </Grid>
              </form>
            </Paper>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

AdminAddUserForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(AdminAddUserForm);
