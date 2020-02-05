/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import commodityService from "../services/commodityService";
import imgService from "../services/imgService";
import Typography from "@material-ui/core/Typography";
import auth from "../services/authService";
import { Link, Redirect } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import { getPdfForAdmin, getPdfForUser } from "./../services/pdfService";
import { downloadExcel } from "./../services/excelService";
import Dropzone from "react-dropzone";
import { transferExcelToDatabase } from "../services/excelService";
import Button from "@material-ui/core/Button";
import Grow from "@material-ui/core/Grow";
import Snackbar from "@material-ui/core/Snackbar";
import PascalCase from "pascal-case";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import MaterialTable from "material-table";
import TextField from "@material-ui/core/TextField";
import {
  AddBox,
  ArrowUpward,
  Check,
  ChevronLeft,
  PictureAsPdf,
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
  Info
} from "@material-ui/icons";
import CircularProgress from "@material-ui/core/CircularProgress";
import pathModule from "path";

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

// Generate Order Data
function createData(
  id,
  owner,
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
  customerNum
) {
  return {
    id,
    owner,
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
    customerNum
  };
}

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
    margin: theme.spacing(1)
  },
  paperUpload: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    margin: theme.spacing(1)
  },
  dropzone: {
    width: "100%",
    height: "100%",
    border: "1px dashed black",
    textAlign: "center",
    opacity: 0.3
  },
  dropzoneExcel: {
    width: "100%",
    height: 135,
    border: "1px dashed black",
    textAlign: "center",
    opacity: 0.3
  },
  submit: {
    float: "right"
  },
  form: {
    height: "100%"
  },
  overrides: {
    MuiTable: {
      root: {
        backgroundColor: "lightblue"
      },
      paddingDefault: {
        padding: "40px 24px 40px 16px"
      }
    }
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

class CommodityPage extends Component {
  state = {
    rows: [],
    file: {},
    sealPhoto: {},
    oldSealNum: "",
    open: false,
    dialogOpen: false,
    transition: Grow,
    deleteID: "",
    isLoading: false,
    message: ""
  };
  async componentDidMount() {
    const commodities = auth.getCurrentUser().isAdmin
      ? await commodityService.getCommodities() // get everything
      : await commodityService.getCommodity(); // get by web token
    const rows = commodities.data.map(c => {
      return createData(
        c._id,
        c.owner,
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
        c.customerNum
      );
    });
    this.setState({ rows });
  }

  handleGeneratePDF = async () => {
    this.setState({ isLoading: true });
    const user = auth.getCurrentUser();
    let message = "";
    try {
      const response = user.isAdmin
        ? await getPdfForAdmin()
        : await getPdfForUser(user._id);

      const file = new Blob([response.data], { type: response.data.type });
      const fileURL = URL.createObjectURL(file);
      message =
        "PDF report generated. If your report is not showing, please disable your adblocker and try again.";
      window.open(fileURL);
      this.setState({ isLoading: false, message, open: true });
    } catch (err) {
      if (err.status === 409) {
        message = err.data.errors;
      } else {
        message = err.data;
      }
      this.setState({ open: true, isLoading: false, message });
    }
  };

  handleDownloadExcelTemplate = async e => {
    const response = await downloadExcel("uploads/template/template.xlsx");
    const file = new Blob([response.data], { type: response.data.type });
    const fileURL = URL.createObjectURL(file);
    // window.open(fileURL);
    const tempLink = document.createElement("a");
    tempLink.href = fileURL;
    tempLink.setAttribute("download", "template.xlsx");
    tempLink.click();
    //
  };

  handleSubmitExcel = async e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    let message = "";

    const form = new FormData();
    form.append("commoditiesUpdateFile", this.state.file);
    await transferExcelToDatabase(form)
      .then(() => {
        message = "Excel file successfully uploaded!";
        this.setState({ open: true, isLoading: false, file: {}, message });
        // set snackbar success message
      })
      .catch(err => {
        // set snackbar error message
        if (err.status === 409) {
          const file = this.state.file;
          const extname = pathModule.extname(file.path);
          const basename = pathModule.basename(file.path, extname);
          message = `Unexpected errors have occured, please check ${basename}-error${extname} under 'EXCELS' tab for more details`;
        } else {
          message = err.data;
        }
        this.setState({ open: true, isLoading: false, message });
      });
  };

  handleChange = e => {
    const target = e.target ? e.target : e.currentTarget;
    const oldSealNum = target.value;

    this.setState({ oldSealNum });
  };

  handleSubmitSealPhoto = async e => {
    e.preventDefault();
    this.setState({ isLoading: true });
    let message = "";
    try {
      const form = new FormData();
      form.append("image", this.state.sealPhoto);
      if (this.state.oldSealNum.trim().length > 0) {
        form.append("oldSealNum", this.state.oldSealNum);
        await imgService.updateImage(form).then(() => {
          this.setState({ isLoading: false });
        });
      } else {
        await imgService.uploadImage(form).then(() => {
          this.setState({
            isLoading: false,
            open: true,
            message: "Seal number photo uploaded successfully"
          });
        });
      }
    } catch (err) {
      if (err.status === 409) {
        message = err.data.errors;
      } else {
        message = err.data;
      }
      this.setState({ open: true, isLoading: false, message });
    }
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleDialogClickOpen = id => {
    this.setState({ dialogOpen: true, deleteID: id });
  };

  handleDelete = async (e, commodityId, archiveStatus) => {
    e.preventDefault();
    let message = "";
    await commodityService
      .archiveCommodity(commodityId, archiveStatus)
      .then(() => {
        this.setState({ dialogOpen: false });
        // return <Redirect to="/commodityPage" />;
        return window.location.reload();
      })
      .catch(err => {
        // set snackbar error message
        if (err.status === 409) {
          message = err.data.errors;
        } else {
          message = err.data;
        }
        this.setState({ open: true, message });
      });
  };

  handleClose = () => {
    this.setState({ open: false });
  };
  handleDialogClose = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const { classes } = this.props;
    const columnArray = auth.getCurrentUser().isAdmin
      ? [
          {
            title: "Start Date (YYYY-MM-DD)",
            field: "date",
            type: "datetime"
          },
          {
            title: "Customer No.",
            field: "customerNum",
            render: rowData => (
              <Link
                style={{
                  color: "#0074d9",
                  cursor: "pointer",
                  textDecoration: "none"
                }}
                to={`/profilePage/${rowData.owner._id}`}
              >
                {rowData.customerNum}{" "}
              </Link>
            )
          },
          { title: "Cert No.", field: "certificateNum" },
          { title: "Seal No.", field: "sealNum" },
          { title: "Storage Location", field: "storageLocation" },
          {
            title: "Description",
            field: "description",
            render: rowData => (
              <Link
                style={{
                  color: "#0074d9",
                  cursor: "pointer",
                  textDecoration: "none"
                }}
                to={`/commodityMorePage/${rowData.moreButton}`}
              >
                {rowData.description}{" "}
              </Link>
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
            title: "TotalCostPrice/SGD",
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
            ),
            export: false
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
              )),
            export: false
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
              )),
            export: false
          }
        ]
      : [
          {
            title: "Start Date(YYYY-MM--DD)",
            field: "date",
            type: "datetime"
          },
          { title: "Cert No.", field: "certificateNum" },
          { title: "Seal No.", field: "sealNum" },
          { title: "Storage Location", field: "storageLocation" },
          { title: "Serial No.", field: "serialNum" },
          {
            title: "Description",
            field: "description",
            render: rowData => (
              <Link
                style={{
                  color: "#0074d9",
                  cursor: "pointer",
                  textDecoration: "none"
                }}
                to={`/commodityMorePage/${rowData.moreButton}`}
              >
                {rowData.description}{" "}
              </Link>
            )
          },
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
            title: "TotalCostPrice/USD",
            field: "costPriceTotalUSD",
            type: "currency"
          },
          {
            title: "TotalCostPrice/SGD",
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
            ),
            export: false
          }
        ];

    const array = this.state.rows.map(row => {
      return {
        // customerNum: row.customerNum,
        date: row.date.substring(0, 10),
        owner: row.owner,
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
        moreButton: row.id,
        customerNum: row.customerNum
      };
    });
    return (
      <div className={classes.root}>
        <TabContainer>
          {this.state.isLoading && (
            <CircularProgress size={200} className={classes.progress} />
          )}
          <Container maxWidth="lg" className={classes.container}>
            <Title>Commodities</Title>
            <Snackbar
              open={this.state.open}
              onClose={this.handleClose}
              TransitionComponent={this.state.transition}
              ContentProps={{
                "aria-describedby": "message-id"
              }}
              message={<span id="message-id">{this.state.message}</span>}
            />
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
            <Grid container direction={"row"}>
              {auth.getCurrentUser().isAdmin && (
                <Grid item xs={6}>
                  <Paper className={classes.paperUpload}>
                    <Title>Upload Commodity Excel File</Title>
                    <form
                      className={classes.form}
                      noValidate
                      onSubmit={this.handleSubmitExcel}
                    >
                      <Dropzone
                        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        multiple={false}
                        onDrop={acceptedFiles => {
                          this.setState({ file: acceptedFiles[0] });
                        }}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              className={classes.dropzoneExcel}
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              <p>
                                Drag 'n' drop a file here, or click to select
                                file
                              </p>
                            </div>
                            <aside>
                              <h4>File</h4>
                              {this.state.file && (
                                <ul>
                                  <li key={this.state.file.path}>
                                    {this.state.file.path} -{" "}
                                    {this.state.file.size} bytes
                                  </li>
                                </ul>
                              )}
                            </aside>
                          </section>
                        )}
                      </Dropzone>

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={this.handleSubmitExcel}
                      >
                        Upload
                      </Button>
                    </form>
                  </Paper>
                </Grid>
              )}

              {auth.getCurrentUser().isAdmin && (
                <Grid item xs={6}>
                  <Paper className={classes.paperUpload}>
                    <Title>Update Seal Number Photo</Title>
                    <form
                      className={classes.form}
                      noValidate
                      onSubmit={this.handleSubmitSealPhoto}
                    >
                      <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="oldSealNum"
                        label="Old Seal No. (Optional)"
                        name="oldSealNum"
                        onChange={this.handleChange}
                      />
                      <Dropzone
                        accept={["image/png", "image/jpeg", "application/pdf"]}
                        multiple={false}
                        onDrop={acceptedFiles => {
                          this.setState({ sealPhoto: acceptedFiles[0] });
                        }}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <section>
                            <div
                              className={classes.dropzone}
                              {...getRootProps()}
                            >
                              <input {...getInputProps()} />
                              <p>
                                Drag 'n' drop a file (JPEG, PNG or PDF) here,
                                or click to select file
                              </p>
                            </div>
                            <aside>
                              <h4>File</h4>
                              {this.state.sealPhoto && (
                                <ul>
                                  <li key={this.state.sealPhoto.path}>
                                    {this.state.sealPhoto.path} -{" "}
                                    {this.state.sealPhoto.size} bytes
                                  </li>
                                </ul>
                              )}
                            </aside>
                          </section>
                        )}
                      </Dropzone>

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={this.handleSubmitSealPhoto}
                      >
                        Upload
                      </Button>
                    </form>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Paper className={classes.paper}>
              <Grid item align="right">
                {auth.getCurrentUser().isAdmin && (
                  <IconButton
                    className={classes.genPDF}
                    onClick={this.handleDownloadExcelTemplate}
                  >
                    <SaveAlt />
                    <Typography>Download Excel Template</Typography>
                  </IconButton>
                )}
                <IconButton
                  className={classes.genPDF}
                  onClick={this.handleGeneratePDF}
                >
                  <PictureAsPdf />
                  <Typography>Download PDF Report</Typography>
                </IconButton>
              </Grid>

              <MaterialTable
                icons={tableIcons}
                title="All Commodities"
                padding="none"
                columns={columnArray}
                data={array}
                options={{
                  columnsButton: true,
                  exportButton: auth.getCurrentUser().isAdmin ? true : false,
                  exportAllData: true,
                  pageSize: 20,
                  pageSizeOptions: [20, 40, 80]
                }}
              />
            </Paper>
          </Container>
        </TabContainer>
      </div>
    );
  }
}

CommodityPage.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CommodityPage);
