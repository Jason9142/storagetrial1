/* eslint-disable no-script-url */
import React, { Component } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import commodityService from "../services/commodityService";
import userService from "../services/userService";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import Image from "material-ui-image";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Edit from "@material-ui/icons/Edit";
import auth from "../services/authService";
import PascalCase from "pascal-case";
import imgService from "../services/imgService";
import path from "path";
import Delete from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
  pdfjs.version
}/pdf.worker.js`;

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
    id: this.props.match.params.id,
    imgUrl: "",
    imgType: "",
    dialogOpen: false
  };

  async componentDidMount() {
    const response = await commodityService.getCommodityById(this.state.id);
    const commodity = response.data;
    // Load image
    try {
      const imgUrl = await imgService.getImage(
        path.normalize(response.data.imgUrl)
      );
      const file = new Blob([imgUrl.data], { type: imgUrl.data.type });
      const fileURL = URL.createObjectURL(file);
      this.setState({
        commodity,
        imgUrl: fileURL,
        imgType: imgUrl.data.type,
        loaded: true
      });
    } catch (ex) {
      this.setState({ commodity, loaded: true });
    }
  }
  handleDialogClickOpen = id => {
    this.setState({ dialogOpen: true, deleteID: id });
  };

  handleDelete = async (e, commodityId, archiveStatus) => {
    e.preventDefault();
    await commodityService
      .archiveCommodity(commodityId, archiveStatus)
      .then(() => {
        this.setState({ dialogOpen: false });
        this.goBack();
      });
  };

  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  goBack = () => {
    this.props.history.goBack();
  };

  render() {
    const { classes } = this.props;
    const commodity = this.state.commodity;
    const commodityOwner = commodity.owner ? commodity.owner : "";
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
                  <Button
                    variant="contained"
                    onClick={e =>
                      this.handleDelete(e, this.state.deleteID, "Transferred")
                    }
                    color="secondary"
                    autoFocus
                  >
                    Transfer
                  </Button>
                  <Button
                    onClick={e =>
                      this.handleDelete(e, this.state.deleteID, "Released")
                    }
                    variant="contained"
                    color="secondary"
                  >
                    Release
                  </Button>
                  <Button
                    onClick={e =>
                      this.handleDelete(
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
              // <div >

              <IconButton
                className={classes.editStyle}
                onClick={() => this.handleDialogClickOpen(this.state.id)}
              >
                <Delete />
                <Typography> Archive</Typography>
              </IconButton>
              // </div>
            )}
            {auth.getCurrentUser().isAdmin && (
              <IconButton
                className={classes.editStyle}
                component={Link}
                to={`/adminCommoditiesForm/${this.state.id}`}
              >
                <Edit />
                <Typography> Edit </Typography>
              </IconButton>
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
                    <Title>Cost Per Piece USD</Title>$
                    {commodity.costPerPieceUSD
                      ? commodity.costPerPieceUSD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Per Piece SGD</Title>$
                    {commodity.costPerPieceSGD
                      ? commodity.costPerPieceSGD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Price Total USD</Title>$
                    {commodity.costPriceTotalUSD
                      ? commodity.costPriceTotalUSD.toFixed(2)
                      : ""}
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper className={classes.paperdetails}>
                    <Title>Cost Price Total SGD</Title>$
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
                        to={`/profilePage/${commodityOwner._id}`}
                      >
                        {commodityOwner.customerNum}{" "}
                      </Link>
                    ) : (
                      `${commodityOwner.customerNum}`
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Grid item xs={6}>
                <Paper className={classes.paper}>
                  {this.state.imgUrl &&
                    this.state.imgType === "application/pdf" && (
                      <Document file={this.state.imgUrl}>
                        <Page pageNumber={1} />
                      </Document>
                    )}
                  {this.state.imgUrl &&
                    (this.state.imgType === "image/jpeg" ||
                      this.state.imgType === "image/png") && (
                      <Image src={this.state.imgUrl} />
                    )}
                  {this.state.loaded && !this.state.imgUrl && (
                    <h1>Photo not available</h1>
                  )}
                </Paper>
              </Grid>
            </Grid>
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
