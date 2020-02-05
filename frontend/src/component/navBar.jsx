import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Link } from "react-router-dom";
import auth from "../services/authService";
import ExitToApp from "@material-ui/icons/ExitToApp";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const styles = theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  imgWrapper: {
    width: "300px",
    // height: "200px"
    paddingLeft: theme.spacing(1)
  },
  wrapper: {
    width: "100%",
    textAlign: "center"
  },
  topBar: {
    // padding: theme.spacing(1)
  },
  right: {
    display: "inline-flex",
    float: "right"
  },
  center: {
    display: "inline-flex"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "auto auto auto",
    padding: "10px",
    justifyContent: "space-between"
  },
  gridItemImage: {
    padding: "5px",
    // width:"100px"
    marginTop: "35px",
    flexWrap: "wrap"
  },

  gridItemWelcome: {
    padding: "5px",
    textAlign: "center",
    marginTop: "100px",
    flexWrap: "wrap"
  },

  gridItemLogout: {
    padding: "5px",
    textAlign: "center",
    marginTop: "100px"
  }
});

class NavBar extends Component {
  render() {
    const { value, onChangeTab, lastLogin, name } = this.props;
    const user = auth.getCurrentUser();
    const { classes } = this.props;
    const lastLogin2 = lastLogin ? lastLogin : "";
    const date = new Date(lastLogin2);
    const time = date.toLocaleTimeString("en-US");
    return (
      <React.Fragment>
        <Box position="static" className={classes.topBar}>
          <div className={classes.gridContainer}>
            <div className={classes.gridItemImage}>
              <img
                alt="Logo"
                height="100px"
                src={require("../assets/img/logo.png")}
              />
            </div>
            <div className={classes.gridItemWelcome}>
              <Typography>Welcome {name},</Typography>
              <Typography>
                {" "}
                You last logged in at {lastLogin2.substring(0, 10)}, {time}
              </Typography>
            </div>
            <div className="grid-item">
              {" "}
              <IconButton
                className={classes.right}
                to="/logout"
                component={Link}
              >
                <ExitToApp />
                <Typography>Logout </Typography>
              </IconButton>
            </div>
          </div>
        </Box>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={onChangeTab}
            indicatorColor="primary"
            textColor="primary"
            scrollable="true"
            scrollButtons="auto"
          >
            <Tab label="Dashboard" to="/dashboardPage" component={Link} />
            <Tab label="Commodities" to="/commodityPage" component={Link} />
            {user && user.isAdmin ? (
              <Tab label="Profiles" to="/adminAllUsersPage" component={Link} />
            ) : (
              <Tab label="Profile" to="/profilePage" component={Link} />
            )}
            {user && user.isAdmin && (
              <Tab label="Excels" to="/adminExcelPage" component={Link} />
            )}
            {user && (
              <Tab
                label="Commodity Archive"
                to="/archivedCommodityPage"
                component={Link}
              />
            )}

            {user && user.isAdmin && (
              <Tab label="User Archive" to="/userArchive" component={Link} />
            )}
          </Tabs>
        </AppBar>
      </React.Fragment>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(NavBar);
