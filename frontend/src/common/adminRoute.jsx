import React from "react";
import { Route, Redirect } from "react-router-dom";
import auth from "../services/authService";

const AdminRoute = ({ component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        const user = auth.getCurrentUser();
        if (!user || !user.isAdmin) return <Redirect to="not-found" />;

        return Component ? <Component {...props} /> : render(props);
      }}
    />
  );
};

export default AdminRoute;
