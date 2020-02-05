/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import userArchiveService from "../services/userArchiveService";
import MaterialTable from "material-table";
import {
  ArrowUpward,
  ChevronLeft,
  MoreVert,
  ChevronRight,
  Clear,
  FilterList,
  FirstPage,
  LastPage,
  SaveAlt,
  Search,
  ViewColumn,
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
  DetailPanel: ChevronRight,
  Export: SaveAlt,
  Filter: FilterList,
  FirstPage: FirstPage,
  LastPage: LastPage,
  NextPage: ChevronRight,
  PreviousPage: ChevronLeft,
  ResetSearch: Clear,
  Search: Search,
  SortArrow: ArrowUpward,
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
  title: {
    fontSize: 14
  }
});

class ArchivedAllUsersPage extends Component {
  state = {
    rows: [],
    open: false
  };
  async componentDidMount() {
    const users = await userArchiveService.getUserArchive();
    const rows = users.data;
    this.setState({ rows });
  }

  render() {
    const { classes } = this.props;
    const columnArray = [
      {
        title: "Archived Date (YYYY-MM-DD)",
        field: "archiveDate",
        type: "datetime"
      },
      {
        title: "Client No.",
        field: "customerNum",
        render: rowData => (
          <Link
            style={{
              color: "#0074d9",
              cursor: "pointer",
              textDecoration: "none"
            }}
            to={`/userArchiveProfilePage/${rowData.moreButton}`}
          >
            {rowData.customerNum}{" "}
          </Link>
        )
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
        title: "",
        field: "moreButton",
        render: rowData => (
          <IconButton
            component={Link}
            to={`/userArchiveProfilePage/${rowData.moreButton}`}
          >
            <Info />
          </IconButton>
        )
      }
    ];

    const array = this.state.rows.map(row => {
      return {
        customerNum: row.customerNum,
        archiveDate: row.archiveDate.substring(0, 10),
        name: row.name,
        email: row.email,
        contactNum: row.contactNum,
        address: row.address,
        identificationNum: row.identificationNum,
        proofOfAddress: row.proofOfAddress,
        proofOfIdentification: row.proofOfIdentification,
        editButton: row._id,
        moreButton: row._id,
        endDate: row.endDate.substring(0, 10)
      };
    });

    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Title>All Users</Title>
            <Paper className={classes.paper}>
              <MaterialTable
                icons={tableIcons}
                title=""
                columns={columnArray}
                data={array}
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

ArchivedAllUsersPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ArchivedAllUsersPage);
