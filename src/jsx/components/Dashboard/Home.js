import React, { useState, useContext, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
//Import Components
import { ThemeContext } from "../../../context/ThemeContext";
import { SVGICON } from "./Content";
import { TeacherDetails } from "./Elements/TeacherDetails";
import { useQuery } from "@tanstack/react-query";
import {
  getPerformanceQuery,
  geSchoolOverviewQuery,
  getRegionsQuery,
  getSchoolsQuery,
  getDashboardOverviewQuery,
  getMeQuery,
  getOverallStatisticsQuery,
} from "../../../queries/index";
import { useTranslation } from "react-i18next";

const SchoolPerformance = loadable(() =>
  pMinDelay(import("./Elements/SchoolPerformance"), 500)
);
const SchoolOverView = loadable(() =>
  pMinDelay(import("./Elements/SchoolOverView"), 1000)
);

const cardBlog = [
  {
    title: "students",
    svg: SVGICON.user,
    change: "std-data",
    key: "totalStudents",
  },
  {
    title: "boys",
    svg: SVGICON.user2,
    change: "event-data",
    key: "boysCount",
  },
  {
    title: "girls",
    svg: SVGICON.user2,
    change: "event-data",
    key: "girlsCount",
  },
  {
    title: "absents",
    svg: SVGICON.event,
    change: "event-data",
    key: "absentsCount",
  },
];

const cardBlog2 = [
  {
    title: " Всего школ",
    svg: SVGICON.user,
    change: "std-data",
    key: "totalStudents",
    count: 90,
  },
  {
    title: "подключенные школы ",
    svg: SVGICON.user2,
    change: "event-data",
    key: "boysCount",
    count: 265,
  },
  {
    title: "количество  всего учащихся",
    svg: SVGICON.user2,
    change: "event-data",
    key: "girlsCount",
    count: 190,
  },
  {
    title: " отсутствующие",
    svg: SVGICON.event,
    change: "event-data",
    key: "absentsCount",
    count: 18,
  },
];

const Home = () => {
  const [schoolOverviewPage, setOverviewPage] = useState(1);
  const [schoolValues, setSchoolValues] = useState([]);
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [performanceWeek, setPerformanceWeek] = useState("this"); // this && last
  const { changeBackground } = useContext(ThemeContext);
  const { t } = useTranslation();
  useEffect(() => {
    changeBackground({ value: "light", label: "Light" });
  }, []);

  const { data: performance } = useQuery({
    ...getPerformanceQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
    }),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: overall } = useQuery({
    ...getOverallStatisticsQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
    }),
  });

  const { data: schoolOverview } = useQuery({
    ...geSchoolOverviewQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
    }),
  });

  const { data: overview } = useQuery({
    ...getDashboardOverviewQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
      DateFrom: "2023-09-01Z",
    }),
  });

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ size: "100", RegionId: region, CityId: cityId }),
  });

  useEffect(() => {
    if (schools?.result) {
      const options = schools.result.data.map((option) => ({
        label: option.name,
        value: option.id,
      }));
      setSchoolValues(options);
    }
  }, [schools]);

  useEffect(() => {
    if (user?.result.region?.id) {
      setRegion(user.result.region.id);
    }
    if (user?.result.city?.id) {
      setCityId(user.result.city.id);
    }
    if (user?.result.school?.id) {
      setSchoolId(user.result.school.id);
    }
  }, [user]);

  return (
    <>
      <div className="row">
        {!user?.result.region?.id && (
          <div className="form-group mb-4 col-xl-3">
            <label htmlFor="basic-url" className="form-label d-block">
              {t("region")}
            </label>
            <select
              className="form-control form-control-md"
              onChange={(e) => {
                setRegion(e.target.value);
                setCityId("");
              }}
              value={region}
            >
              <option value="">{t("region")}</option>
              {regions?.result?.map((option) => (
                <option value={option.id} key={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {region && !user?.result.city?.id && (
          <div className="form-group mb-4 col-xl-3">
            <label htmlFor="basic-url" className="form-label d-block">
              {t("district")}
            </label>
            <select
              className="form-control form-control-md"
              onChange={(e) => setCityId(e.target.value)}
              value={cityId}
            >
              <option value="">{t("select")}</option>
              {regions?.result
                .filter((currentRegion) => +region === currentRegion.id)[0]
                ?.cities?.map((option) => (
                  <option value={option.id} key={option.name}>
                    {option.name}
                  </option>
                ))}
            </select>
          </div>
        )}
        {cityId && region && !user?.result.school?.id && (
          <div className="col-xl-3 mb-2">
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("school")}
              </label>
              <select
                className="form-control form-control-md"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              >
                <option value=""> {t("select")}</option>
                {schoolValues.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body pb-xl-4 pb-sm-3 pb-0">
              <div className="row">
                {cardBlog2.map((item, ind) => (
                  <div className="col-xl-3 col-6" key={ind}>
                    <div className="content-box">
                      <div className={`icon-box icon-box-xl ${item.change}`}>
                        {item.svg}
                      </div>
                      <div className="chart-num">
                        <p>{t(item.title)}</p>
                        <h2 className="font-w700 mb-0">{item.count}</h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body pb-xl-4 pb-sm-3 pb-0">
              <div className="row">
                {cardBlog.map((item, ind) => (
                  <div className="col-xl-3 col-6" key={ind}>
                    <div className="content-box">
                      <div className={`icon-box icon-box-xl ${item.change}`}>
                        {item.svg}
                      </div>
                      <div className="chart-num">
                        <p>{t(item.title)}</p>
                        <h2 className="font-w700 mb-0">
                          {overall?.result?.[item.key]}
                        </h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-6 ">
          <div className="card crypto-chart ">
            <div className="card-header pb-0 border-0 flex-wrap">
              <div className="mb-sm-0">
                <div className="chart-title">
                  <h2 className="heading mb-0">{t("schoolPerfomance")}</h2>
                </div>
              </div>
              <div className="p-static">
                <div className="d-flex align-items-center mb-5 mb-sm-0">
                  <div
                    onClick={() => setPerformanceWeek("this")}
                    style={
                      performanceWeek === "this"
                        ? {
                            background: "var(--rgba-primary-1)",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            color: "var(--primary)",
                            fontWeight: 500,
                          }
                        : { padding: "0.5rem 1rem" }
                    }
                  >
                    <span className="fs-14">{t("thisWeek")}</span>
                    {/* <h4 className="fs-5 font-w700 mb-0">1.245</h4> */}
                  </div>
                  <div
                    onClick={() => setPerformanceWeek("last")}
                    style={
                      performanceWeek === "last"
                        ? {
                            background: "var(--rgba-primary-1)",
                            padding: "0.5rem 1rem",
                            borderRadius: "5px",
                            color: "var(--primary)",
                            fontWeight: 500,
                          }
                        : { padding: "0.5rem 1rem" }
                    }
                  >
                    <span className="fs-14">{t("lastWeek")}</span>
                    {/* <h4 className="fs-5 font-w700 mb-0">1.356</h4> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body pt-2 custome-tooltip pb-0 px-2">
              <SchoolPerformance
                data={
                  performance?.result[
                    performanceWeek === "this"
                      ? "thisWeekPerformance"
                      : "lastWeekPerformance"
                  ]
                }
              />
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="card h-auto">
            {" "}
            <div className="card-header pb-0 border-0 flex-wrap">
              <div>
                <div className="mb-3">
                  <h2 className="heading mb-0">{t("schoolOverwiew")}</h2>
                </div>
              </div>
            </div>
            <SchoolOverView data={overview?.result?.overview} />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header py-3 border-0 px-3">
              <h4 className="heading m-0">{t("latestAbsents")}</h4>
            </div>
            <div className="card-body p-0">
              <TeacherDetails
                filter={{
                  RegionId: region,
                  CityId: cityId,
                  SchoolId: schoolId,
                }}
              />
            </div>
          </div>
        </div>
        <div className="table-responsive basic-tbl">
          <div className="card">
            <div className="card-header py-3 border-0 px-3">
              <h4 className="heading m-0">{t("school")}</h4>
            </div>
            <div
              id="teacher-table_wrapper"
              className="dataTables_wrapper no-footer"
            >
              <table
                id="teacher-table"
                className="tech-data dataTable no-footer"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr>
                    <th>{t("school")}</th>
                    <th>{t("totalStudents")}</th>
                    <th>{t("boys")}</th>
                    <th>{t("girls")}</th>
                    <th>{t("percentage")}</th>
                    <th className="text-end">{t("absents")}</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolOverview?.result?.data?.map((item, ind) => (
                    <tr key={ind}>
                      <td>{item.name}</td>
                      <td>{item.totalStudents}</td>
                      <td>{item.boysCount}</td>
                      <td>{item.girlsCount}</td>
                      <td>{item.percentage}%</td>
                      <td>{item.absentsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {schoolOverview?.result.totalPages > 1 && (
                <div>
                  <div className="col-12 ps-3">
                    <nav>
                      <ul
                        className="pagination pagination-gutter pagination-primary pagination-sm no-bg"
                        style={{
                          margin: "30px 0",
                          display: "flex",
                          justifyContent: "right",
                        }}
                      >
                        <li className="page-item page-indicator">
                          <p
                            className="page-link"
                            to="/email-inbox"
                            onClick={() =>
                              schoolOverview > 0 &&
                              setOverviewPage(schoolOverview - 1)
                            }
                          >
                            <i className="la la-angle-left"></i>
                          </p>
                        </li>
                        {"page"
                          .repeat(schoolOverview?.result.totalPages - 1)
                          .split("page")
                          .map((number, i) => (
                            <li
                              key={i}
                              className={`page-item  ${
                                schoolOverviewPage === i + 1 ? "active" : ""
                              } `}
                              onClick={() => setOverviewPage(i + 1)}
                            >
                              <p className="page-link" to="/email-inbox">
                                {i + 1}
                              </p>
                            </li>
                          ))}

                        <li className="page-item page-indicator">
                          <p
                            className="page-link"
                            to="/email-inbox"
                            onClick={() =>
                              setOverviewPage + 1 <
                                schoolOverview?.result.totalPages &&
                              setOverviewPage(schoolOverviewPage + 1)
                            }
                          >
                            <i className="la la-angle-right"></i>
                          </p>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
