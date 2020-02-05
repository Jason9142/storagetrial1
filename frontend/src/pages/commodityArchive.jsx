/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import commodityArchiveService from "../services/commodityArchiveService";
import Typography from "@material-ui/core/Typography";
import auth from "../services/authService";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import {
  getPdfForAdmin,
  getPdfForUser,
  getPdf
} from "./../services/pdfService";
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
  Restore,
  Info
} from "@material-ui/icons";
import userService from "../services/userService";
import userArchiveService from "../services/userArchiveService";
import _ from "lodash";

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
  _id,
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
  archiveStatus,
  archiveDate,
  customerNum,
  owner
) {
  return {
    _id,
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
    archiveStatus,
    archiveDate,
    customerNum,
    owner
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
    message: "",
    isArchived: false
  };
  async componentDidMount() {
    const commodities = auth.getCurrentUser().isAdmin
      ? await commodityArchiveService.getCommodityArchive()
      : await commodityArchiveService.getCommodityArchiveByOwner(); // get everything

    const rows = commodities.data.map(c => {
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
        c.archiveStatus,
        c.archiveDate,
        c.customerNum,
        c.owner
      );
    });

    this.setState({ rows });
  }

  handleDialogClickOpen = id => {
    this.setState({ dialogOpen: true, deleteID: id });
  };

  handleDelete = async (e, commodityId) => {
    e.preventDefault();
    try {
      await commodityArchiveService.restoreCommodity(commodityId).then(() => {
        this.setState({ dialogOpen: false });
        window.location.reload();
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

  render() {
    const { classes } = this.props;
    const columnArray = [
      {
        title: "Archive Date (YYYY-MM-DD)",
        field: "date",
        type: "datetime"
      },
      {
        title: "Customer No.",
        field: "customerNum",
        render: rowData =>
          auth.getCurrentUser().isAdmin ? (
            <Link
              style={{
                color: "#0074d9",
                cursor: "pointer",
                textDecoration: "none"
              }}
              to={
                this.state.isArchived
                  ? `/userArchive/${rowData.owner}`
                  : `/profilePage/${rowData.owner}`
              }
            >
              {rowData.customerNum}
            </Link>
          ) : (
            `${rowData.customerNum}`
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
            to={`/archivedCommodityMorePage/${rowData.moreButton}`}
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
        title: "Total Cost Price/SGD",
        field: "costPriceTotalSGD",
        type: "currency",
        hidden: true
      },
      { title: "USD/SGD Rate", field: "conversionRate" },

      {
        title: "Status",
        field: "archiveStatus",
        render: rowData => (
          <p style={{ color: "red" }}>{rowData.archiveStatus}</p>
        )
      },
      {
        title: "",
        field: "moreButton",
        render: rowData => (
          <IconButton
            component={Link}
            to={`/archivedCommodityMorePage/${rowData.moreButton}`}
          >
            <Info />
          </IconButton>
        ),
        export: false
      },
      {
        title: "",
        field: "deleteButton",
        render: rowData => (
          <IconButton
            onClick={() => this.handleDialogClickOpen(rowData.deleteButton)}
          >
            <Restore />
          </IconButton>
        )
      }
    ];
    const array = this.state.rows.map(row => {
      return {
        date: row.archiveDate.substring(0, 10),
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
        editButton: row._id,
        deleteButton: row._id,
        moreButton: row._id,
        archiveStatus: row.archiveStatus,
        customerNum: row.customerNum,
        owner: row.owner
      };
    });

    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Title>Archived Commodities</Title>

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

            <Paper className={classes.paper}>
              <MaterialTable
                icons={tableIcons}
                title=""
                padding="none"
                columns={
                  auth.getCurrentUser().isAdmin
                    ? columnArray
                    : _.reject(columnArray, e => {
                        if (
                          e.field === "customerNum" ||
                          e.field === "deleteButton"
                        )
                          return e;
                      })
                }
                data={array}
                // onRowClick={((evt, selectedRow ) => window.location= `/commodityArchiveMorePage/${selectedRow.moreButton}`)}
                options={{
                  columnsButton: true,
                  pageSize: 20,
                  pageSizeOptions: [20, 40, 80]
                }}
              />
            </Paper>

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

CommodityPage.propTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(CommodityPage);
