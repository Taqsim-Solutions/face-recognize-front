/// Menu
// import Metismenu from "metismenujs";
import React, { useReducer, useContext, useEffect, useState } from "react";
/// Scroll
import { Link } from "react-router-dom";
import { MenuList } from "./Menu";
import { useScrollPosition } from "@n8tb1t/use-scroll-position";
import { ThemeContext } from "../../../context/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { getMeQuery } from "../../../queries/index";
import { useTranslation } from "react-i18next";

const reducer = (previousState, updatedState) => ({
  ...previousState,
  ...updatedState,
});

const initialState = {
  active: "",
  activeSubmenu: "",
};

const SideBar = () => {
  const { t } = useTranslation();
  //  let d = new Date();
  const {
    iconHover,
    sidebarposition,
    headerposition,
    sidebarLayout,
    ChangeIconSidebar,
  } = useContext(ThemeContext);

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const [state, setState] = useReducer(reducer, initialState);

  useEffect(() => {
    var btn = document.querySelector(".nav-control");
    var aaa = document.querySelector("#main-wrapper");
    function toggleFunc() {
      return aaa.classList.toggle("menu-toggle");
    }
    btn.addEventListener("click", toggleFunc);
  }, []);

  const [hideOnScroll, setHideOnScroll] = useState(true);
  useScrollPosition(
    ({ prevPos, currPos }) => {
      const isShow = currPos.y > prevPos.y;
      if (isShow !== hideOnScroll) setHideOnScroll(isShow);
    },
    [hideOnScroll]
  );

  /// Path
  let path = window.location.pathname;
  path = path.split("/");
  path = path[path.length - 1];
  /// Active menu

  useEffect(() => {
    MenuList.forEach((data) => {
      data.content?.forEach((item) => {
        if (path === item.to) {
          setState({ active: data.title });
        }
        item.content?.forEach((ele) => {
          if (path === ele.to) {
            setState({ activeSubmenu: item.title, active: data.title });
          }
        });
      });
    });
  }, [path]);

  return (
    <div
      onMouseEnter={() => ChangeIconSidebar(true)}
      onMouseLeave={() => ChangeIconSidebar(false)}
      className={`dlabnav ${iconHover} ${
        sidebarposition.value === "fixed" &&
        sidebarLayout.value === "horizontal" &&
        headerposition.value === "static"
          ? hideOnScroll > 120
            ? "fixed"
            : ""
          : ""
      }`}
    >
      <div className="dlabnav-scroll">
        <ul className="metismenu" id="menu">
          {user &&
            MenuList.map((data, index) => {
              let menuClass = data.classsChange;
              if (menuClass === "menu-title") {
                return (
                  data.level.includes(user?.result?.level) && (
                    <li
                      key={index}
                      className={`${menuClass} ${
                        window.location.href === data.title ? "mm-active" : ""
                      } `}
                    >
                      {t(data.title)}
                    </li>
                  )
                );
              } else {
                return (
                  data.level.includes(user?.result?.level) && (
                    <li
                      className={`${
                        state.active === data.title ? "mm-active" : ""
                      } `}
                      key={index}
                    >
                      <Link
                        to={data.to}
                        className={`${data.to === path ? "mm-active" : ""}`}
                      >
                        {data.iconStyle}
                        <span className="nav-text">{t(data.title)}</span>
                      </Link>
                    </li>
                  )
                );
              }
            })}
        </ul>
      </div>
    </div>
  );
};

export default SideBar;
