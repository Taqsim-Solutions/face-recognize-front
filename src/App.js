import { lazy, Suspense } from "react";
import Index from "./jsx/index";
import { connect } from "react-redux";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { isAuthenticated } from "./store/selectors/AuthSelectors";
import "./other/swiper/css/swiper-bundle.min.css";
import "./other/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";
import { useAuthContext } from "./context/AuthContext";

const SignUp = lazy(() => import("./jsx/pages/Registration"));
const Login = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./jsx/pages/Login")), 500);
  });
});

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();

    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
}

function App() {
  const { isAuth } = useAuthContext();

  let routeblog = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/page-register" element={<SignUp />} />
    </Routes>
  );
  if (isAuth) {
    return (
      <>
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          <Index />
        </Suspense>
      </>
    );
  } else {
    return (
      <div className="vh-100">
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          {routeblog}
        </Suspense>
      </div>
    );
  }
}

export default App;
