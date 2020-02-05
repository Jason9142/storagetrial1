/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import { Link } from "react-router-dom";
import commodityArchiveService from "../services/commodityArchiveService";
import Typography from "@material-ui/core/Typography";
import Image from "material-ui-image";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import auth from "../services/authService";
import PascalCase from "pascal-case";
import imgService from "../services/imgService";
import path from "path";
import Restore from "@material-ui/icons/Restore";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import userArchiveService from "../services/userArchiveService";
import userService from "../services/userService";

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
  backButton: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(2),
    margin: theme.spacing(1)
  },
  editStyle: {
    display: "inline-flex",
    float: "right"
  },
  paperdetails: {
    padding: theme.spacing(1),
    margin: theme.spacing(1)
  }
});

class CommodityMorePage extends Component {
  state = {
    commodity: {},
    owner: {},
    id: this.props.match.params.id,
    imgUrl: "",
    dialogOpen: false,
    isArchivedUser: false,
    open: false,
    transition: Grow,
    message: ""
  };

  async componentDidMount() {
    const response = await commodityArchiveService.getCommodityArchiveById(
      this.state.id
    );
    const commodity = response.data;

    let isArchivedUser = this.state.isArchivedUser;
    let owner;

    Promise.all([
      await userArchiveService
        .getUserArchiveById(commodity.owner)
        .then(response => {
          owner = response.data;
          isArchivedUser = true;
        })
        .catch(err => null),
      await userService
        .getUserById(commodity.owner)
        .then(response => {
          owner = response.data;
          isArchivedUser = false;
        })
        .catch(err => null)
    ]).then(async () => {
      // Load image
      try {
        const imgUrl = await imgService.getImage(
          path.normalize(response.data.imgUrl)
        );
        const file = new Blob([imgUrl.data], { type: imgUrl.data.type });
        const fileURL = URL.createObjectURL(file);
        this.setState({
          commodity,
          owner,
          imgUrl: fileURL,
          loaded: true,
          isArchivedUser
        });
      } catch (ex) {
        this.setState({ commodity, owner, loaded: true, isArchivedUser });
      }
    });
  }

  handleDialogClickOpen = id => {
    this.setState({ dialogOpen: true, deleteID: id });
  };

  handleDelete = async (e, commodityId) => {
    e.preventDefault();
    try {
      await commodityArchiveService.restoreCommodity(commodityId).then(() => {
        this.setState({ dialogOpen: false });
        this.goBack();
      });
    } catch (error) {
      this.setState({
        open: true,
        message: `Please restore the user before restoring commodity!`
      });
    }
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false, open: false });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const commodity = this.state.commodity;
    const commodityOwner = this.state.owner;

    // console.log(commodityOwner.customerNum);

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
              <Typography>Back</Typography>
            </Button>

            {auth.getCurrentUser().isAdmin && (
              <Dialog
                open={this.state.dialogOpen}
                onClose={this.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Restore Commodity"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Confirm restore commodity?
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
                  <Button
                    variant="contained"
                    onClick={e => this.handleDelete(e, this.state.deleteID)}
                    color="secondary"
                    autoFocus
                  >
                    Restore
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {auth.getCurrentUser().isAdmin && (
              // <div >

              <IconButton
                className={classes.editStyle}
                onClick={() => this.handleDialogClickOpen(this.state.id)}
              >
                <Restore />
                <Typography> Restore</Typography>
              </IconButton>
              // </div>
            )}

            <Grid container direction={"row"} spacing={3}>
              <Grid direction={"row"} container xs={6} item={true}>
                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Date </Title>
                    {commodity.date ? commodity.date.substring(0, 10) : ""}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Type</Title>
                    {PascalCase(commodity.type)}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Certificate Num</Title>
                    {commodity.certificateNum}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Seal Num</Title>
                    {commodity.sealNum}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Serial Num</Title>
                    {commodity.serialNum}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Storage Location</Title>
                    {commodity.storageLocation}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Description</Title>
                    {commodity.description}
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Quantity</Title>
                    {commodity.quantity}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Total Weight</Title>
                    {commodity.totalWeight
                      ? commodity.totalWeight.toFixed(4)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Conversion Rate</Title>
                    {commodity.conversionRate
                      ? commodity.conversionRate.toFixed(4)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Per Piece USD</Title>
                    {commodity.costPerPieceUSD
                      ? commodity.costPerPieceUSD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Per Piece SGD</Title>
                    {commodity.costPerPieceSGD
                      ? commodity.costPerPieceSGD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Price Total USD</Title>
                    {commodity.costPriceTotalUSD
                      ? commodity.costPriceTotalUSD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Price Total SGD</Title>
                    {commodity.costPriceTotalSGD
                      ? commodity.costPriceTotalSGD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Customer Num</Title>
                    {auth.getCurrentUser().isAdmin ? (
                      <Link
                        style={{
                          color: "#0074d9",
                          cursor: "pointer",
                          textDecoration: "none"
                        }}
                        to={
                          this.state.isArchivedUser
                            ? `/userArchiveProfilePage/${commodityOwner._id}`
                            : `/profilePage/${commodityOwner._id}`
                        }
                      >
                        {commodity.customerNum}
                      </Link>
                    ) : (
                      `${commodity.customerNum}`
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Grid item xs={6}>
                <Paper className={classes.paper}>
                  {this.state.imgUrl && <Image src={this.state.imgUrl} />}
                  {this.state.loaded && !this.state.imgUrl && (
                    <h1>Photo not available</h1>
                  )}
                </Paper>
              </Grid>
            </Grid>
            <Snackbar
              open={this.state.open}
              TransitionComponent={this.state.transition}
              ContentProps={{
                "aria-describedby": "message-id"
              }}
              message={<span id="message-id">{this.state.message}</span>}
            />
          </Container>
        </TabContainer>
      </div>
    );
  }
}

CommodityMorePage.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CommodityMorePage);
