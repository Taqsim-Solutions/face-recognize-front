import React, { useState, useEffect, useRef, useContext } from "react";
import { changeLanguage, language } from "../../../utils/i18n";
import { getMeQuery } from "../../../queries/index";

import { Link } from "react-router-dom";
/// Scroll
import { Dropdown } from "react-bootstrap";
import { useAuthContext } from "../../../context/AuthContext";
import LogoutPage from "./Logout";

/// Image
import profile from "../../../images/user.jpg";
import Uz from "../../../images/uz.png";
import Ru from "../../../images/ru.png";

import { ThemeContext } from "../../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import settings from "../../../settings/settings";
import { useLangContext } from "../../../context/LangContext";

const Header = ({ onNote }) => {
  //For header fixed
  const { changeLang, lang } = useLangContext();
  const [headerFix, setheaderFix] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setheaderFix(window.scrollY > 50);
    });
  }, []);

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { background, changeBackground } = useContext(ThemeContext);
  const handleThemeMode = () => {
    if (background.value === "dark") {
      changeBackground({ value: "light", label: "Light" });
    } else {
      changeBackground({ value: "dark", label: "Dark" });
    }
  };
  const [changeScreen, setChangeScreen] = useState();
  const fullscreenRef = useRef(null);
  const EnterFullScreen = () => {
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } else {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    }
  };
  const { setIsAuth } = useAuthContext();

  return (
    <div className={`header ${headerFix ? "sticky" : ""}`}>
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-left"></div>
            <ul className="navbar-nav header-right">
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link dz-theme-mode ${
                    background.value === "dark" ? "active" : ""
                  }`}
                  onClick={() => {
                    changeLang(lang === "ru" ? "uz" : "ru");
                    changeLanguage(lang === "ru" ? "uz" : "ru");
                    localStorage.setItem("lang", lang === "ru" ? "uz" : "ru");
                  }}
                >
                  {lang !== "ru" && <img src={Uz} alt="uz" width="20px" />}
                  {lang !== "uz" && <img src={Ru} alt="uz" width="20px" />}
                </Link>
              </li>
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link bell dz-theme-mode ${
                    background.value === "dark" ? "active" : ""
                  }`}
                  onClick={() => handleThemeMode()}
                >
                  <i id="icon-light-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-sun"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  </i>
                  <i id="icon-dark-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-moon"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  </i>
                </Link>
              </li>
              <li className="nav-item dropdown notification_dropdown">
                <Link
                  to={"#"}
                  className={`nav-link bell dz-fullscreen ${
                    changeScreen ? "active" : ""
                  }`}
                  ref={fullscreenRef}
                  onClick={() => {
                    EnterFullScreen();
                    setChangeScreen(!changeScreen);
                  }}
                >
                  <svg
                    id="icon-full-1"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="css-i6dzq1"
                  >
                    <path
                      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                      style={{
                        strokeDasharray: "37, 57",
                        strokeDashoffset: "0",
                      }}
                    ></path>
                  </svg>
                  <svg
                    id="icon-minimize-1"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="A098AE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-minimize"
                  >
                    <path
                      d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
                      style={{
                        strokeDasharray: "37, 57",
                        strokeDashoffset: "0",
                      }}
                    ></path>
                  </svg>
                </Link>
              </li>

              <li className="nav-item ">
                <Dropdown className="dropdown header-profile2">
                  <Dropdown.Toggle
                    variant=""
                    as="a"
                    className="nav-link i-false c-pointer ms-0"
                  >
                    <div className="header-info2 d-flex align-items-center">
                      <img
                        src={
                          user?.result.mainImageName
                            ? `${settings.baseURL}/images?filename=${user?.result.mainImageName}`
                            : profile
                        }
                        alt=""
                      />
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    className="mt-1 dropdown-menu dropdown-menu-end"
                  >
                    <div className="card mb-0">
                      <div className="card-header p-3">
                        <ul className="d-flex align-items-center">
                          <li>
                            <img
                              src={
                                user?.result.mainImageName
                                  ? `${settings.baseURL}/images?filename=${user?.result.mainImageName}`
                                  : profile
                              }
                              className="ms-0"
                              alt=""
                            />
                          </li>
                          <li className="ms-2">
                            <h4 className="mb-0">{`${user?.result.firstName} ${user?.result.lastName}`}</h4>
                            <span>
                              {user?.result.level === 1
                                ? "Teacher"
                                : user?.result.level === 2
                                ? "Director"
                                : user?.result.level === 3
                                ? "District government"
                                : user?.result.level === 4
                                ? "Region government"
                                : "Admin"}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body p-3">
                        <Link to="/profile" className="dropdown-item ai-icon ">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24px"
                            height="24px"
                            viewBox="0 0 24 24"
                            version="1.1"
                            className="svg-main-icon"
                          >
                            <g
                              stroke="none"
                              strokeWidth="1"
                              fill="none"
                              fillRule="evenodd"
                            >
                              <rect x="0" y="0" width="24" height="24" />
                              <path
                                d="M18.6225,9.75 L18.75,9.75 C19.9926407,9.75 21,10.7573593 21,12 C21,13.2426407 19.9926407,14.25 18.75,14.25 L18.6854912,14.249994 C18.4911876,14.250769 18.3158978,14.366855 18.2393549,14.5454486 C18.1556809,14.7351461 18.1942911,14.948087 18.3278301,15.0846699 L18.372535,15.129375 C18.7950334,15.5514036 19.03243,16.1240792 19.03243,16.72125 C19.03243,17.3184208 18.7950334,17.8910964 18.373125,18.312535 C17.9510964,18.7350334 17.3784208,18.97243 16.78125,18.97243 C16.1840792,18.97243 15.6114036,18.7350334 15.1896699,18.3128301 L15.1505513,18.2736469 C15.008087,18.1342911 14.7951461,18.0956809 14.6054486,18.1793549 C14.426855,18.2558978 14.310769,18.4311876 14.31,18.6225 L14.31,18.75 C14.31,19.9926407 13.3026407,21 12.06,21 C10.8173593,21 9.81,19.9926407 9.81,18.75 C9.80552409,18.4999185 9.67898539,18.3229986 9.44717599,18.2361469 C9.26485393,18.1556809 9.05191298,18.1942911 8.91533009,18.3278301 L8.870625,18.372535 C8.44859642,18.7950334 7.87592081,19.03243 7.27875,19.03243 C6.68157919,19.03243 6.10890358,18.7950334 5.68746499,18.373125 C5.26496665,17.9510964 5.02757002,17.3784208 5.02757002,16.78125 C5.02757002,16.1840792 5.26496665,15.6114036 5.68716991,15.1896699 L5.72635306,15.1505513 C5.86570889,15.008087 5.90431906,14.7951461 5.82064513,14.6054486 C5.74410223,14.426855 5.56881236,14.310769 5.3775,14.31 L5.25,14.31 C4.00735931,14.31 3,13.3026407 3,12.06 C3,10.8173593 4.00735931,9.81 5.25,9.81 C5.50008154,9.80552409 5.67700139,9.67898539 5.76385306,9.44717599 C5.84431906,9.26485393 5.80570889,9.05191298 5.67216991,8.91533009 L5.62746499,8.870625 C5.20496665,8.44859642 4.96757002,7.87592081 4.96757002,7.27875 C4.96757002,6.68157919 5.20496665,6.10890358 5.626875,5.68746499 C6.04890358,5.26496665 6.62157919,5.02757002 7.21875,5.02757002 C7.81592081,5.02757002 8.38859642,5.26496665 8.81033009,5.68716991 L8.84944872,5.72635306 C8.99191298,5.86570889 9.20485393,5.90431906 9.38717599,5.82385306 L9.49484664,5.80114977 C9.65041313,5.71688974 9.7492905,5.55401473 9.75,5.3775 L9.75,5.25 C9.75,4.00735931 10.7573593,3 12,3 C13.2426407,3 14.25,4.00735931 14.25,5.25 L14.249994,5.31450877 C14.250769,5.50881236 14.366855,5.68410223 14.552824,5.76385306 C14.7351461,5.84431906 14.948087,5.80570889 15.0846699,5.67216991 L15.129375,5.62746499 C15.5514036,5.20496665 16.1240792,4.96757002 16.72125,4.96757002 C17.3184208,4.96757002 17.8910964,5.20496665 18.312535,5.626875 C18.7350334,6.04890358 18.97243,6.62157919 18.97243,7.21875 C18.97243,7.81592081 18.7350334,8.38859642 18.3128301,8.81033009 L18.2736469,8.84944872 C18.1342911,8.99191298 18.0956809,9.20485393 18.1761469,9.38717599 L18.1988502,9.49484664 C18.2831103,9.65041313 18.4459853,9.7492905 18.6225,9.75 Z"
                                fill="#000000"
                                fillRule="nonzero"
                                opacity="0.3"
                              />
                              <path
                                d="M12,15 C13.6568542,15 15,13.6568542 15,12 C15,10.3431458 13.6568542,9 12,9 C10.3431458,9 9,10.3431458 9,12 C9,13.6568542 10.3431458,15 12,15 Z"
                                fill="#000000"
                              />
                            </g>
                          </svg>
                          <span className="ms-2">View</span>
                        </Link>
                        {user?.result?.school && (
                          <p>
                            {`${user?.result?.region?.name}: ${user?.result?.school?.name}`}
                          </p>
                        )}
                      </div>
                      <div
                        className="card-footer text-center p-3"
                        onClick={() => {
                          localStorage.clear();
                          setIsAuth(false);
                        }}
                      >
                        <LogoutPage />
                      </div>
                    </div>
                  </Dropdown.Menu>
                </Dropdown>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
