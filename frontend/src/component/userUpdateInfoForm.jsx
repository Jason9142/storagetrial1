import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import auth from "../services/authService";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import userService from "../services/userService";
import Dropzone from "react-dropzone";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
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
    marginBottom: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  warning: {
    backgroundColor: theme.palette.error.dark
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

class UserUpdateInfoForm extends Component {
  state = {
    data: {
      isAdmin: false,
      email: "",
      name: "",
      dateOfBirth: "",
      identificationNum: "",
      contactNum: "",
      address: "",
      endDate: "",
      proofOfAddress: [],
      proofOfIdentification: []
    },
    id: this.props.match.params.id,
    originalAddress: "",
    originalIdentificationNum: "",
    originalEmail: "",
    originalContactNum: "",
    open: false,
    message: "",
    Transition: Grow,
    isEmail: false,
    isNumber: false,
    isLoading: false
  };

  async componentDidMount() {
    const userResponse = auth.getCurrentUser().isAdmin
      ? await userService.getUserById(this.state.id)
      : await userService.getUser();

    const data = userResponse.data;
    delete data.proofOfAddress;
    delete data.proofOfIdentification;

    this.setState({
      data,
      originalAddress: data.address,
      originalIdentificationNum: data.identificationNum,
      originalContactNum: data.contactNum,
      originalEmail: data.email,
      isEmail: data.email ? true : false,
      isNumber: data.contactNum ? true : false
    });
  }

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
    this.setState({ data });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    const newData = { ...this.state.data };
    const original = this.state;
    const updateSuccess =
      "Details updated. Please wait for approval to reflect on this page.";
    // newData for proof of identification

    if (
      newData.identificationNum !== this.state.originalIdentificationNum &&
      newData.proofOfIdentification === undefined
    ) {
      // set snack bar to open to ask them to upload proof of address
      const missingProofID = "Please upload your proof of identification";
      return this.processQueue(missingProofID);
    }

    if (
      newData.address !== this.state.originalAddress &&
      newData.proofOfAddress === undefined
    ) {
      const missingProofAddress = "Please upload your proof of address";
      return this.processQueue(missingProofAddress);
    }

    let data = new FormData();
    const adminUpdate = auth.getCurrentUser().isAdmin;

    if (adminUpdate) {
      data.append("customerNum", this.state.data.customerNum.toUpperCase());
      data.append("isAdmin", this.state.data.isAdmin);
      data.append("name", this.state.data.name);
      data.append("dateOfBirth", this.state.data.dateOfBirth);
      data.append("endDate", this.state.data.endDate);
    }

    if (newData.proofOfAddress) {
      data.append("proofOfAddress", newData.proofOfAddress);
    }

    if (newData.proofOfIdentification) {
      data.append("proofOfIdentification", newData.proofOfIdentification);
    }

    if (original.originalEmail !== newData.email) {
      data.append(adminUpdate ? "email" : "newEmail", this.state.data.email);
    }
    if (original.originalIdentificationNum !== newData.identificationNum) {
      data.append(
        adminUpdate ? "identificationNum" : "newIdentificationNum",
        this.state.data.identificationNum
      );
    }
    if (original.originalContactNum !== newData.contactNum) {
      data.append(
        adminUpdate ? "contactNum" : "newContactNum",
        this.state.data.contactNum
      );
    }
    if (original.originalAddress !== newData.address) {
      data.append(
        adminUpdate ? "address" : "newAddress",
        this.state.data.address
      );
    }

    try {
      await userService.saveUser(data, this.state.id).then(() => {
        if (!adminUpdate) {
          this.processQueue(updateSuccess);
        } else {
          this.setState({ isLoading: false });
          this.goBack();
        }
      });
    } catch (error) {
      this.processQueue(error.data);
    }
  };

  processQueue = passingmessage => {
    this.setState({
      open: true,
      message: passingmessage,
      isLoading: false
    });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  handleClose = () => {
    this.setState({ open: false });
    this.props.history.goBack();
  };

  handleSnackbarClose = e => {
    this.setState({ open: false });
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const user = this.state.data;
    const message = this.state.message;
    const notEmail =
      this.state.data.email && !this.state.isEmail ? true : false;
    const notNumber =
      this.state.data.contactNum && !this.state.isNumber ? true : false;
    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg">
            {this.state.isLoading && (
              <CircularProgress size={80} className={classes.progress} />
            )}
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

            <Snackbar
              open={this.state.open}
              onClose={e => this.handleSnackbarClose(e)}
              autoHideDuration={6000}
              TransitionComponent={this.state.Transition}
              ContentProps={{
                "aria-describedby": "message-id"
              }}
              message={<span id="message-id">{message}</span>}
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  className={classes.close}
                  onClick={this.handleClose}
                >
                  <CloseIcon />
                </IconButton>
              ]}
            />

            <Paper className={classes.paper}>
              <Typography component="h1" variant="h5">
                Update Info
              </Typography>
              <form className={classes.form} noValidate>
                <Grid container spacing={1} alignItems="center">
                  {auth.getCurrentUser().isAdmin ? (
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={user.isAdmin}
                            onChange={e => this.handleChange(e, "isAdmin")}
                            value={!user.isAdmin}
                          />
                        }
                        label="Admin"
                      />
                    </Grid>
                  ) : (
                    ""
                  )}

                  {auth.getCurrentUser().isAdmin ? (
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
                        value={user.customerNum || ""}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        disabled
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
                        value={user.customerNum || ""}
                      />
                    </Grid>
                  )}

                  {auth.getCurrentUser().isAdmin ? (
                    <Grid item xs={6}>
                      <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="endDate"
                        name="endDate"
                        label="Storage End Date"
                        type="date"
                        InputLabelProps={{
                          shrink: true
                        }}
                        value={
                          user.endDate ? user.endDate.substring(0, 10) : ""
                        }
                        onChange={this.handleChange}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        disabled
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="endDate"
                        name="endDate"
                        label="Storage End Date"
                        type="date"
                        InputLabelProps={{
                          shrink: true
                        }}
                        value={
                          user.endDate ? user.endDate.substring(0, 10) : ""
                        }
                        onChange={this.handleChange}
                      />
                    </Grid>
                  )}

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
                      value={user.email || ""}
                    />
                  </Grid>

                  {auth.getCurrentUser().isAdmin ? (
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
                        autoFocus
                        onChange={this.handleChange}
                        value={user.name || ""}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        disabled
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        onChange={this.handleChange}
                        value={user.name || ""}
                      />
                    </Grid>
                  )}

                  {auth.getCurrentUser().isAdmin ? (
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
                        value={user.dateOfBirth.substring(0, 10) || ""}
                        onChange={this.handleChange}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={6}>
                      <TextField
                        disabled
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
                        value={user.dateOfBirth.substring(0, 10) || ""}
                        onChange={this.handleChange}
                      />
                    </Grid>
                  )}

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
                      value={user.identificationNum || ""}
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
                      value={user.contactNum || ""}
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
                      value={user.address || ""}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Dropzone
                      accept={["image/png", "image/jpeg", "application/pdf"]}
                      onDrop={(acceptedFiles, rejectedFiles, event) => {
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
                            {this.state.data.proofOfAddress && (
                              <ul>
                                <li key={this.state.data.proofOfAddress.path}>
                                  {this.state.data.proofOfAddress.path} -{" "}
                                  {this.state.data.proofOfAddress.size} bytes
                                </li>
                              </ul>
                            )}
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
                            {this.state.data.proofOfIdentification && (
                              <ul>
                                <li
                                  key={
                                    this.state.data.proofOfIdentification.path
                                  }
                                >
                                  {this.state.data.proofOfIdentification.path} -{" "}
                                  {this.state.data.proofOfIdentification.size}{" "}
                                  bytes
                                </li>
                              </ul>
                            )}
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
                    className={classes.submit}
                    disabled={
                      !this.state.isEmail ||
                      !this.state.isNumber ||
                      this.state.data.name === "" ||
                      this.state.data.dateOfBirth === "" ||
                      this.state.data.identificationNum === "" ||
                      this.state.data.endDate === "" ||
                      this.state.data.address === "" ||
                      this.state.data.contactNum === "" ||
                      this.state.data.customerNum === "" ||
                      this.state.data.endDate === ""
                    }
                    onClick={this.handleSubmit}
                  >
                    Update Info
                  </Button>
                </Grid>
              </form>
            </Paper>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

UserUpdateInfoForm.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(UserUpdateInfoForm);
