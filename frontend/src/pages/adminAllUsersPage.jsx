/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "../component/userTitle";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import amber from "@material-ui/core/colors/amber";
import imgService from "../services/imgService";
import userService from "../services/userService";
import pathModule from "path";
import MaterialTable from "material-table";

import {
  AddBox,
  ArrowUpward,
  Check,
  ChevronLeft,
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
  AddCircle,
  Delete,
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
    margin: theme.spacing(2)
  },
  pendingApproval: {
    backgroundColor: amber[500],
    color: "black"
  },
  approve: {
    backgroundColor: green[500],
    color: "white"
  },
  reject: {
    backgroundColor: red[500],
    color: "white"
  },
  title: {
    fontSize: 14
  }
});

class AdminAllUsersPage extends Component {
  state = {
    rows: [],
    open: false,
    approval: {}
  };
  async componentDidMount() {
    const users = await userService.getUsers();
    const rows = users.data;
    this.setState({ rows });
  }

  handleClickOpen = row => {
    this.setState({ open: true, approval: row });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleApprove = async (e, id) => {
    e.preventDefault();
    try {
      await userService.approve(id);
      this.setState({ open: false });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  handleReject = async (e, id) => {
    e.preventDefault();
    try {
      await userService.reject(id);
      this.setState({ open: false });
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  handleOpenImage = async path => {
    // e.preventDefault();

    const image = await imgService.getImage(pathModule.normalize(path));

    const file = new Blob([image.data], { type: image.data.type });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  render() {
    const { classes } = this.props;
    const columnArray = [
      {
        title: "Client No.",
        field: "customerNum",
        render: rowData => (
          // rowData.admin == true ? (
          //   rowData.customerNum
          // ) :
          <Link
            style={{
              color: "#0074d9",
              cursor: "pointer",
              textDecoration: "none"
            }}
            to={`/profilePage/${rowData.moreButton}`}
          >
            {rowData.customerNum}{" "}
          </Link>
        )
      },
      {
        title: "Admin",
        field: "admin",
        type: "boolean"
      },

      {
        title: "Storage End Date (YYYY-MM-DD)",
        field: "endDate",
        type: "datetime"
      },
      {
        title: "Name",
        field: "name"
      },
      { title: "Email", field: "email" },
      { title: "Contact No.", field: "contactNum" },
      {
        title: "Pending Approval",
        field: "pendingApproval",
        customSort: (a, b) =>
          a.pendingApproval.newEmail !== undefined ||
          a.pendingApproval.newContactNum !== undefined ||
          a.pendingApproval.newIdentificationNum !== undefined ||
          a.pendingApproval.newAddress !== undefined ||
          a.pendingApproval.newProofOfIdentification !== undefined ||
          a.pendingApproval.newProofOfAddress !== undefined
            ? -1
            : 1,

        render: rowData => (
          <div>
            {(rowData.pendingApproval.newEmail ||
              rowData.pendingApproval.newContactNum ||
              rowData.pendingApproval.newIdentificationNum ||
              rowData.pendingApproval.newAddress ||
              rowData.pendingApproval.newProofOfIdentification ||
              rowData.pendingApproval.newProofOfAddress) && (
              <div>
                <Button
                  className={classes.pendingApproval}
                  variant="contained"
                  onClick={() => {
                    this.handleClickOpen(rowData);
                  }}
                >
                  Pending Approval
                </Button>
              </div>
            )}
          </div>
        )
      },

      {
        title: "",
        field: "moreButton",
        render: rowData => (
          // rowData.admin ==true? "" :
          <IconButton
            component={Link}
            to={`/profilePage/${rowData.moreButton}`}
          >
            <Info />
          </IconButton>
        ),
        export: false
      }
    ];
    const array = this.state.rows.map(row => {
      return {
        customerNum: row.customerNum,
        admin: row.isAdmin,
        name: row.name,
        email: row.email,
        contactNum: row.contactNum,
        address: row.address,
        identificationNum: row.identificationNum,
        proofOfAddress: row.proofOfAddress,
        proofOfIdentification: row.proofOfIdentification,
        editButton: row._id,
        moreButton: row._id,
        endDate: row.endDate.substring(0, 10),
        pendingApproval: {
          newEmail: row.newEmail,
          newAddress: row.newAddress,
          newContactNum: row.newContactNum,
          newIdentificationNum: row.newIdentificationNum,
          newProofOfAddress: row.newProofOfAddress,
          newProofOfIdentification: row.newProofOfIdentification,
          _id: row._id
        }
      };
    });

    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Title>All Users</Title>
            <Paper className={classes.paper}>
              <Grid item align="right">
                <IconButton component={Link} to="/adminAddUserForm">
                  <AddCircle />
                  <Typography>Add New User</Typography>
                </IconButton>
              </Grid>

              {this.state.approval.pendingApproval && (
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  maxWidth="lg"
                >
                  <DialogTitle id="alert-dialog-title">
                    {"Pending Approval"}
                  </DialogTitle>
                  <DialogContent>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Info Updated</TableCell>
                          <TableCell>Current</TableCell>
                          <TableCell>New</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.approval.pendingApproval.newEmail && (
                          <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>{this.state.approval.email}</TableCell>
                            <TableCell>
                              {this.state.approval.pendingApproval.newEmail}
                            </TableCell>
                          </TableRow>
                        )}
                        {this.state.approval.pendingApproval.newContactNum && (
                          <TableRow>
                            <TableCell>Contact No</TableCell>

                            <TableCell>
                              {this.state.approval.contactNum}
                            </TableCell>
                            <TableCell>
                              {
                                this.state.approval.pendingApproval
                                  .newContactNum
                              }
                            </TableCell>
                          </TableRow>
                        )}

                        {this.state.approval.pendingApproval
                          .newIdentificationNum && (
                          <TableRow>
                            <TableCell>Identification No</TableCell>

                            <TableCell>
                              {this.state.approval.identificationNum}
                            </TableCell>
                            <TableCell>
                              {
                                this.state.approval.pendingApproval
                                  .newIdentificationNum
                              }
                            </TableCell>
                          </TableRow>
                        )}
                        {this.state.approval.pendingApproval.newAddress && (
                          <TableRow>
                            <TableCell>Address</TableCell>

                            <TableCell>{this.state.approval.address}</TableCell>
                            <TableCell>
                              {this.state.approval.pendingApproval.newAddress}
                            </TableCell>
                          </TableRow>
                        )}
                        {this.state.approval.pendingApproval
                          .newProofOfAddress && (
                          <TableRow>
                            <TableCell>Proof Of Address</TableCell>

                            <TableCell>
                              <a
                                style={{ color: "#0074d9", cursor: "pointer" }}
                                onClick={() =>
                                  this.handleOpenImage(
                                    this.state.approval.proofOfAddress
                                  )
                                }
                              >
                                {this.state.approval.proofOfAddress}
                              </a>
                            </TableCell>
                            <TableCell>
                              <a
                                style={{ color: "#0074d9", cursor: "pointer" }}
                                onClick={() =>
                                  this.handleOpenImage(
                                    this.state.approval.pendingApproval
                                      .newProofOfAddress
                                  )
                                }
                              >
                                {
                                  this.state.approval.pendingApproval
                                    .newProofOfAddress
                                }
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                        {this.state.approval.pendingApproval
                          .newProofOfIdentification && (
                          <TableRow>
                            <TableCell>Proof Of Identification</TableCell>

                            <TableCell>
                              <a
                                style={{ color: "#0074d9", cursor: "pointer" }}
                                onClick={() =>
                                  this.handleOpenImage(
                                    this.state.approval.proofOfIdentification
                                  )
                                }
                              >
                                {this.state.approval.proofOfIdentification}
                              </a>
                            </TableCell>
                            <TableCell>
                              <a
                                style={{ color: "#0074d9", cursor: "pointer" }}
                                onClick={() =>
                                  this.handleOpenImage(
                                    this.state.approval.pendingApproval
                                      .newProofOfIdentification
                                  )
                                }
                              >
                                {
                                  this.state.approval.pendingApproval
                                    .newProofOfIdentification
                                }
                              </a>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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
                      onClick={e =>
                        this.handleReject(
                          e,
                          this.state.approval.pendingApproval._id
                        )
                      }
                      className={classes.reject}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      onClick={e =>
                        this.handleApprove(
                          e,
                          this.state.approval.pendingApproval._id
                        )
                      }
                      className={classes.approve}
                    >
                      Approve
                    </Button>
                  </DialogActions>
                </Dialog>
              )}
              <MaterialTable
                icons={tableIcons}
                title=""
                columns={columnArray}
                data={array}
                // onRowClick={((evt, selectedRow ) => window.location= `/profilePage/${selectedRow.moreButton}`)}
                options={{
                  sorting: true,
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

AdminAllUsersPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AdminAllUsersPage);
