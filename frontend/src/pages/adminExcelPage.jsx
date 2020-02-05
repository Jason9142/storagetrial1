/* eslint-disable no-script-url */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Title from "../component/userTitle";
import Typography from "@material-ui/core/Typography";
import { getExcels, downloadExcel } from "../services/excelService";
import pathModule from "path";
import MaterialTable from "material-table";
import {
  AddBox,
  ArrowUpward,
  Check,
  ChevronLeft,
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
  ViewColumn
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
  title: {
    fontSize: 14
  }
});

class AdminExcelPage extends Component {
  state = {
    rows: []
  };
  async componentDidMount() {
    const excels = await getExcels();
    const rows = excels.data;
    this.setState({ rows });
  }

  handleDownloadExcel = async (path, name) => {
    const response = await downloadExcel(path);
    const file = new Blob([response.data], { type: response.data.type });
    const fileURL = URL.createObjectURL(file);

    const tempLink = document.createElement("a");
    tempLink.href = fileURL;
    tempLink.setAttribute("download", `${name}`);
    tempLink.click();
  };

  render() {
    const { classes } = this.props;
    const columnArray = [
      {
        title: "Date Created",
        field: "created"
      },
      {
        title: "File Name",
        field: "name",
        render: rowData => {
          return (
            <p
              style={{ color: "#0074d9", cursor: "pointer" }}
              onClick={() =>
                this.handleDownloadExcel(rowData.path, rowData.name)
              }
            >
              {rowData.name}
            </p>
          );
        }
      }
    ];

    const array = this.state.rows.map(row => {
      return {
        created: row.created.substring(0, 10),
        name: row.name,
        path: row.path
      };
    });

    return (
      <div className={classes.root}>
        <TabContainer>
          <Container maxWidth="lg" className={classes.container}>
            <Title>Excel Files</Title>
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

AdminExcelPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AdminExcelPage);
