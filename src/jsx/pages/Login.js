import React, { useState } from "react";
import { connect } from "react-redux";
import swal from "sweetalert";
import BgImage from "../../images/bg1.png";
import pol from "../../images/pol.jpg";
import { loginAPI } from "../../api";
import { useAuthContext } from "../../context/AuthContext";

function Login(props) {
  const [login, setLogin] = useState("");
  let errorsObj = { login: "", password: "" };
  const [errors, setErrors] = useState(errorsObj);
  const [password, setPassword] = useState("");
  const { setIsAuth } = useAuthContext();

  function onLogin(e) {
    e.preventDefault();
    let error = false;
    const errorObj = { ...errorsObj };
    if (login === "") {
      errorObj.login = "Login is Required";
      error = true;
    }
    if (password === "") {
      errorObj.password = "Password is Required";
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    loginAPI({ email: login, password })
      .then((res) => {
        console.log(res);
        localStorage.setItem("token", res.result);
        setIsAuth(true);
      })
      .catch((err) => {
        swal("Oops", err.data.message, "error");
      });
  }

  const element = document.querySelector("body");
  let dataTheme = element.getAttribute("data-theme-version");

  return (
    <div className="container h-100">
      <div className="row h-100 align-items-center justify-contain-center">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="row m-0">
                <div
                  className="col-xl-6 col-md-6 sign text-center sign-bg"
                  style={{
                    backgroundImage: "url(" + pol + ")",
                  }}
                >
                  <div>
                    {dataTheme === "light" ? (
                      <img
                        src={BgImage}
                        className="slideskew img-fix bitcoin-img"
                      />
                    ) : (
                      <img
                        src={BgImage}
                        className=" slideskew img-fix bitcoin-img "
                      />
                    )}
                  </div>
                </div>
                <div className="col-xl-6 col-md-6">
                  <div className="sign-in-your px-2">
                    <h4 className="fs-20 ">Sign in your account</h4>
                    <span>
                      Welcome back! Login with your data that you entered during
                      registration
                    </span>
                    {props.errorMessage && (
                      <div className="bg-red-300 text-red-900 border border-red-900 p-1 my-2">
                        {props.errorMessage}
                      </div>
                    )}
                    {props.successMessage && (
                      <div className="bg-green-300 text-green-900 border border-green-900 p-1 my-2">
                        {props.successMessage}
                      </div>
                    )}
                    <form onSubmit={onLogin}>
                      <div className="mb-3 mt-5">
                        <label className="mb-1">
                          <strong>Login</strong>
                        </label>
                        <input
                          type="login"
                          className="form-control"
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          placeholder="Type Your Login"
                        />

                        {errors.login && (
                          <div className="text-danger fs-12">
                            {errors.login}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="mb-1">
                          <strong>Password</strong>
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          placeholder="Type Your Password"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                          <div className="text-danger fs-12">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      <div className="text-center mt-5">
                        <button
                          type="submit"
                          className="btn btn-primary btn-block"
                        >
                          Sign Me In
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    errorMessage: state.auth.errorMessage,
    successMessage: state.auth.successMessage,
    showLoading: state.auth.showLoading,
  };
};
export default connect(mapStateToProps)(Login);
