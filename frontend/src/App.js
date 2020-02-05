import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import auth from "./services/authService";
import "./App.css";
import Login from "./component/loginForm";
import Logout from "./component/logout";
import ProtectedRoute from "./common/protectedRoute";
import NotFound from "./common/notFound";
import ResetPassword from "./component/resetPasswordForm";
import AdminCommodityForm from "./component/adminCommoditiesForm";
import UserUpdateInfoForm from "./component/userUpdateInfoForm";

// //testing
import DashboardPage from "./pages/dashboardPage";
import CommodityPage from "./pages/commodityPage";
import AdminAllUsersPage from "./pages/adminAllUsersPage";
import NavBar from "./component/navBar";
import Footer from "./component/footer";
import ProfilePage from "./pages/profilePage";
import ForgetPasswordPage from "./pages/forgetPasswordPage";
import CommodityMorePage from "./pages/commodityMorePage";
import AdminAddUserPage from "./component/adminAddUserForm";
import ChangePasswordForm from "./component/changePasswordForm";
import AdminExcelPage from "./pages/adminExcelPage";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";
import cookie from "react-cookies";
import AdminRoute from "./common/adminRoute";
import ArchivedCommodityPage from "./pages/commodityArchive";
import ArchivedCommodityMorePage from "./pages/commodityArchiveMorePage";
import ArchivedUserPage from "./pages/userArchive";
import ArchivedUserProfilePage from "./pages/userArchiveProfilePage";

const theme = createMuiTheme({
  typography: {
    fontFamily: "Nunito",

    h1: {
      fontFamily: "Nunito"
    },
    h2: {
      fontFamily: "Nunito"
    },
    h3: {
      fontFamily: "Nunito"
    },
    h4: {
      fontFamily: "Nunito"
    },
    button: {
      fontFamily: "Nunito"
    }
  },
  overrides: {
    MuiTableHeader: {
      root: {
        padding: 4
      }
    },
    MuiTableCell: {
      root: {
        padding: 4
      }
    }
  }
});

class App extends Component {
  state = {
    user: {},
    value: cookie.load("navBar") ? Number(cookie.load("navBar")) : 0
  };

  async componentDidMount() {
    const user = await auth.getCurrentUser();
    this.setState({ user });
  }

  handleChangeTab = (event, value) => {
    cookie.save("navBar", value, { path: "/" });
    this.setState({ value: Number(cookie.load("navBar")) });
  };

  render() {
    const { user, value } = this.state;
    return (
      <React.Fragment>
        <MuiThemeProvider theme={theme}>
          {user && (
            <NavBar
              value={value}
              onChangeTab={this.handleChangeTab}
              lastLogin={user.lastLogin}
              name={user.name}
            />
          )}
          <main className="container">
            <Switch>
              {/* Protected Routes */}
              <ProtectedRoute path="/dashboardPage" component={DashboardPage} />
              <ProtectedRoute
                path="/profilePage/"
                exact
                component={ProfilePage}
              />
              <ProtectedRoute path="/commodityPage" component={CommodityPage} />
              <ProtectedRoute
                path="/commodityMorePage/:id"
                component={CommodityMorePage}
              />
              <ProtectedRoute
                path="/changePasswordForm/:id"
                component={ChangePasswordForm}
              />
              <ProtectedRoute
                path="/userUpdateInfoForm/:id"
                component={UserUpdateInfoForm}
              />
              {/* <ProtectedRoute
                path="/userUpdateInfoForm"
                component={UserUpdateInfoForm}
              /> */}
              <ProtectedRoute
                path="/archivedCommodityPage/"
                component={ArchivedCommodityPage}
              />

              <ProtectedRoute
                path="/archivedCommodityMorePage/:id"
                component={ArchivedCommodityMorePage}
              />

              {/* Admin Routes */}
              <AdminRoute path="/profilePage/:id" component={ProfilePage} />
              <AdminRoute
                path="/adminAllUsersPage"
                component={AdminAllUsersPage}
              />
              <AdminRoute
                path="/adminCommoditiesForm/:id"
                component={AdminCommodityForm}
              />
              <AdminRoute
                path="/adminAddUserForm/"
                component={AdminAddUserPage}
              />

              <AdminRoute path="/adminExcelPage/" component={AdminExcelPage} />

              <AdminRoute
                path="/commodityForm"
                component={AdminCommodityForm}
              />

              <AdminRoute path="/userArchive/" component={ArchivedUserPage} />
              <AdminRoute
                path="/userArchiveProfilePage/:id"
                component={ArchivedUserProfilePage}
              />

              <Route path="/login/:token" component={Login} />
              <Route path="/login" exact component={Login} />
              <Route path="/logout" component={Logout} />
              <Route path="/forgetPassword" component={ForgetPasswordPage} />
              <Route path="/resetPassword/:token" component={ResetPassword} />
              <Route path="/not-found" component={NotFound} />
              <Redirect from="/" exact to="/dashboardPage" />
              <Redirect to="not-found" />
            </Switch>
          </main>
          {user && <Footer />}
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
