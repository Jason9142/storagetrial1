import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { Link, Redirect } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Title from "../component/userTitle";
import userService from "../services/userService";
import auth from "../services/authService";
import { getPdfForUser } from "./../services/pdfService";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import commodityService from "../services/commodityService";
import MaterialTable from "material-table";
import PascalCase from "pascal-case";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import imgService from "../services/imgService";
import pathModule from "path";
import {
  AddBox,
  ArrowUpward,
  Check,
  ChevronLeft,
  PictureAsPdf,
  MoreVert,
  ChevronRight,
  Clear,
  DeleteOutline,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  SaveAlt,
  Search,
  ViewColumn,
  Delete,
  AddCircle,
  Info
} from "@material-ui/icons";

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
const tableIcons = {
  Add: AddBox,
  Check: Check,
  Clear: Clear,
  Delete: DeleteOutline,
  DetailPanel: ChevronRight,
  Edit: Edit,
  Export: SaveAlt,
  Filter: FilterList,
  FirstPage: FirstPage,
  LastPage: LastPage,
  NextPage: ChevronRight,
  PreviousPage: ChevronLeft,
  ResetSearch: Clear,
  Search: Search,
  SortArrow: ArrowUpward,
  ThirdStateCheck: Remove,
  ViewColumn: ViewColumn
};

function createData(
  id,
  date,
  type,
  certificateNum,
  sealNum,
  serialNum,
  storageLocation,
  description,
  quantity,
  totalWeight,
  costPerPieceUSD,
  costPerPieceSGD,
  costPriceTotalUSD,
  costPriceTotalSGD,
  conversionRate,
  endDate
) {
  return {
    id,
    date,
    type,
    certificateNum,
    sealNum,
    serialNum,
    storageLocation,
    description,
    quantity,
    totalWeight,
    costPerPieceUSD,
    costPerPieceSGD,
    costPriceTotalUSD,
    costPriceTotalSGD,
    conversionRate,
    endDate
  };
}

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    alignItems: "center",
    margin: theme.spacing(1)
  },

  commodityPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    margin: theme.spacing(1)
  },

  button: {
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    width: 200
  },

  proofButton: {
    width: 230
  },
  backButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1)
  },
  form: {
    width: "40%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  editStyle: {
    display: "inline-flex",
    float: "right",
    fontFamily: "Nunito"
  },
  pdfGen: {
    display: "inline-flex",
    fontFamily: "Nunito"
  },
  title: {
    fontSize: 14
  }
});

class ProfilePage extends Component {
  state = {
    user: {},
    rows: [],
    id: this.props.match.params.id,
    open: false,
    dialogOpen: false,
    deleteID: "",
    transition: Grow,
    message: "",
    snackbarOpen: false
  };

  async componentDidMount() {
    const userResponse = auth.getCurrentUser().isAdmin
      ? await userService.getUserById(this.state.id)
      : await userService.getUser();
    const user = userResponse.data;
    const rows = user.commodities.map(c => {
      return createData(
        c._id,
        c.date,
        c.type,
        c.certificateNum,
        c.sealNum,
        c.serialNum,
        c.storageLocation,
        c.description,
        c.quantity,
        c.totalWeight,
        c.costPerPieceUSD,
        c.costPerPieceSGD,
        c.costPriceTotalUSD,
        c.costPriceTotalSGD,
        c.conversionRate,
        c.endDate,
        c.proofOfAddress
      );
    });

    this.setState({ user, rows });
  }

  handleGeneratePDF = async () => {
    const response = await getPdfForUser(this.state.id);
    var file = new Blob([response.data], { type: "application/pdf" });
    var fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleDelete = async e => {
    e.preventDefault();
    let message = "";
    await userService
      .archiveUser(this.state.user)
      .then(() => {
        this.setState({ open: false });
        this.props.history.goBack();
      })
      .catch(err => {
        if (err.status === 409) {
          message = err.data.errors;
        } else {
          message = err.data;
        }
        this.setState({ snackbarOpen: true, message });
      });
  };

  handleDialogClickOpen = id => {
    this.setState({ dialogOpen: true, deleteID: id });
  };

  handleCommodityDelete = async (e, commodityId, archiveStatus) => {
    e.preventDefault();
    let message = "";
    await commodityService
      .archiveCommodity(commodityId, archiveStatus)
      .then(() => {
        this.setState({ dialogOpen: false });
        window.location.reload();
      })
      .catch(err => {
        if (err.status === 409) {
          message = err.data.errors;
        } else {
          message = err.data;
        }
        this.setState({ snackbarOpen: true, message });
      });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  handleSnackbarClose = () => {
    this.setState({ snackbarOpen: false });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  handleOpenImage = async path => {
    const image = await imgService.getImage(pathModule.normalize(path));

    const file = new Blob([image.data], { type: image.data.type });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  render() {
    const { classes } = this.props;
    const user = this.state.user;

    const columnArray = auth.getCurrentUser().isAdmin
      ? [
          {
            title: "Start Date(YYYY-MM--DD)",
            field: "date",
            type: "datetime"
          },
          { title: "Cert No.", field: "certificateNum" },
          { title: "Seal No.", field: "sealNum" },
          { title: "Storage Location", field: "storageLocation" },
          {
            title: "Description",
            field: "description",
            render: rowData => (
              <a
                style={{
                  color: "#0074d9",
                  cursor: "pointer",
                  textDecoration: "none"
                }}
                onClick={() =>
                  (window.location = `/commodityMorePage/${rowData.moreButton}`)
                }
              >
                {rowData.description}{" "}
              </a>
            )
          },
          { title: "Serial No.", field: "serialNum" },
          { title: "Quantity", field: "quantity" },
          { title: "Total Weight", field: "totalWeight" },
          { title: "Type", field: "type" },
          {
            title: "Cost Per Piece/USD",
            field: "costPerPieceUSD",
            type: "currency",
            hidden: true
          },
          {
            title: "Cost Per Piece/SGD",
            field: "costPerPieceSGD",
            type: "currency",
            hidden: true
          },
          {
            title: "Total Cost Price/USD",
            field: "costPriceTotalUSD",
            type: "currency"
          },
          {
            title: "Total Cost Price/SGD",
            field: "costPriceTotalSGD",
            type: "currency",
            hidden: true
          },
          { title: "USD/SGD Rate", field: "conversionRate" },
          {
            title: "",
            field: "moreButton",
            render: rowData => (
              <IconButton
                component={Link}
                to={`/commodityMorePage/${rowData.moreButton}`}
              >
                <Info />
              </IconButton>
            )
          },
          {
            title: "",
            field: "editButton",
            render:
              auth.getCurrentUser().isAdmin &&
              (rowData => (
                <IconButton
                  component={Link}
                  to={`/adminCommoditiesForm/${rowData.editButton}`}
                >
                  <Edit />
                </IconButton>
              ))
          },
          {
            title: "",
            field: "deleteButton",
            render:
              auth.getCurrentUser().isAdmin &&
              (rowData => (
                <IconButton
                  onClick={() =>
                    this.handleDialogClickOpen(rowData.deleteButton)
                  }
                >
                  <Delete />
                </IconButton>
              ))
          }
        ]
      : [];

    const array = auth.getCurrentUser().isAdmin
      ? this.state.rows.map(row => {
          return {
            date: row.date.substring(0, 10),
            certificateNum: row.certificateNum,
            sealNum: row.sealNum,
            serialNum: row.serialNum,
            storageLocation: row.storageLocation,
            description: row.description,
            quantity: row.quantity,
            type: PascalCase(row.type),
            totalWeight: row.totalWeight,
            conversionRate: row.conversionRate.toFixed(4),
            costPriceTotalUSD: row.costPriceTotalUSD,
            costPerPieceSGD: row.costPerPieceSGD,
            costPerPieceUSD: row.costPerPieceUSD,
            costPriceTotalSGD: row.costPriceTotalSGD,
            editButton: row.id,
            deleteButton: row.id,
            moreButton: row.id
          };
        })
      : {};
    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {auth.getCurrentUser().isAdmin && (
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
                )}

                {auth.getCurrentUser().isAdmin && (
                  <Dialog
                    open={this.state.dialogOpen}
                    onClose={this.handleDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"Archive Commodity"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        Confirm archive commodity?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={this.handleDialogClose}
                        variant="contained"
                        color="primary"
                      >
                        Cancel
                      </Button>
                      {/* <Button
                        variant="contained"
                        onClick={e =>
                          this.handleCommodityDelete(e, this.state.deleteID)
                        }
                        color="secondary"
                        autoFocus
                      >
                        Delete
                      </Button> */}

                      <Button
                        variant="contained"
                        onClick={e =>
                          this.handleCommodityDelete(
                            e,
                            this.state.deleteID,
                            "Transferred"
                          )
                        }
                        color="secondary"
                        autoFocus
                      >
                        Transfer
                      </Button>
                      <Button
                        onClick={e =>
                          this.handleCommodityDelete(
                            e,
                            this.state.deleteID,
                            "Released"
                          )
                        }
                        variant="contained"
                        color="secondary"
                      >
                        Release
                      </Button>
                      <Button
                        onClick={e =>
                          this.handleCommodityDelete(
                            e,
                            this.state.deleteID,
                            "Sold back to GSC"
                          )
                        }
                        variant="contained"
                        color="secondary"
                      >
                        Sell back to GSC
                      </Button>
                    </DialogActions>
                  </Dialog>
                )}

                {auth.getCurrentUser().isAdmin && (
                  <Grid className={classes.editStyle} item>
                    <IconButton onClick={this.handleClickOpen}>
                      <Delete />
                      <Typography>Archive User</Typography>
                    </IconButton>

                    <Dialog
                      open={this.state.open}
                      onClose={this.handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"Archive User"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Confirm archive user?
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={this.handleClose}
                          variant="contained"
                          color="primary"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={this.handleDelete}
                          color="secondary"
                          autoFocus
                        >
                          Archive
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
                )}

                {auth.getCurrentUser().isAdmin && (
                  <Snackbar
                    open={this.state.snackbarOpen}
                    onClose={this.handleSnackbarClose}
                    TransitionComponent={this.state.transition}
                    ContentProps={{
                      "aria-describedby": "message-id"
                    }}
                    message={<span id="message-id">{this.state.message}</span>}
                  />
                )}

                <Title>Profile</Title>

                <Paper className={classes.paper}>
                  <form
                    className={classes.form}
                    noValidate
                    onSubmit={this.handleSubmit}
                  >
                    <Grid container spacing={1} alignItems="center">
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

                      <Grid item xs={12}>
                        <TextField
                          disabled
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          id="email"
                          label="Email Address"
                          name="email"
                          autoComplete="email"
                          autoFocus
                          onChange={this.handleChange}
                          value={user.email || ""}
                        />
                      </Grid>

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
                          value={
                            user.dateOfBirth
                              ? user.dateOfBirth.substring(0, 10)
                              : ""
                          }
                          onChange={this.handleChange}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          disabled
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          id="identificationNum"
                          label="Identification Num"
                          name="identificationNum"
                          autoComplete="identificationNum"
                          autoFocus
                          onChange={this.handleChange}
                          value={user.identificationNum || ""}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <TextField
                          disabled
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          id="contactNum"
                          label="Contact Num"
                          name="contactNum"
                          autoComplete="contactNum"
                          autoFocus
                          onChange={this.handleChange}
                          value={user.contactNum || ""}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          disabled
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          id="address"
                          label="Address"
                          name="address"
                          autoComplete="address"
                          autoFocus
                          onChange={this.handleChange}
                          value={user.address || ""}
                        />
                      </Grid>

                      <Grid item xs={6}>
                        <Button
                          className={classes.proofButton}
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={e => {
                            this.handleOpenImage(user.proofOfAddress);
                          }}
                        >
                          Proof of Address
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          className={classes.proofButton}
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={e => {
                            this.handleOpenImage(user.proofOfIdentification);
                          }}
                        >
                          Proof of Identification
                        </Button>
                      </Grid>
                    </Grid>
                  </form>

                  <Button
                    className={classes.button}
                    variant="contained"
                    size="small"
                    color="primary"
                    component={Link}
                    to={`/userUpdateInfoForm/${user._id}`}
                  >
                    Update Info
                  </Button>
                  <Button
                    className={classes.button}
                    variant="contained"
                    size="small"
                    color="primary"
                    component={Link}
                    to={`/changePasswordForm/${user._id}`}
                  >
                    Change Password
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>

          {auth.getCurrentUser().isAdmin && (
            <Grid item xs={12}>
              <Container maxWidth="lg" className={classes.container}>
                <Title>Commodities</Title>
                <Paper className={classes.commodityPaper}>
                  <Grid item align="right">
                    <IconButton
                      className={classes.pdfGen}
                      onClick={this.handleGeneratePDF}
                    >
                      <PictureAsPdf />
                      <Typography> Download PDF Report</Typography>
                    </IconButton>

                    {/* {auth.getCurrentUser().isAdmin && ( */}
                    <IconButton
                      component={Link}
                      to={`/adminCommoditiesForm/${this.state.id}`}
                    >
                      <AddCircle />
                      <Typography>Add New Commodity</Typography>
                    </IconButton>
                    {/* )} */}
                  </Grid>
                  <MaterialTable
                    icons={tableIcons}
                    title=""
                    padding="none"
                    columns={columnArray}
                    data={array}
                    options={{
                      columnsButton: true,
                      pageSize: 10,
                      pageSizeOptions: [10, 20, 40]
                    }}
                  />
                </Paper>
              </Container>
            </Grid>
          )}
        </TabContainer>
      </div>
    );
  }
}

ProfilePage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ProfilePage);
