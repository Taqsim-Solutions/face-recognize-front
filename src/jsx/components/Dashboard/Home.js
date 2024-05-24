import React, { useState, useContext, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import loadable from "@loadable/component";
import pMinDelay from "p-min-delay";
//Import Components
import { ThemeContext } from "../../../context/ThemeContext";
import { SVGICON } from "./Content";
import { TeacherDetails } from "./Elements/TeacherDetails";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getPerformanceQuery,
  geSchoolOverviewQuery,
  getRegionsQuery,
  getSchoolsQuery,
  getDashboardOverviewQuery,
  getMeQuery,
  getOverallStatisticsQuery,
  getClassesQuery,
  getSchoolNumbersQuery,
} from "../../../queries/index";
import { useTranslation } from "react-i18next";
import { Badge } from "react-bootstrap";

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
    title: "total_schools",
    svg: SVGICON.user,
    change: "std-data",
    key: "allSchoolsNumber",
    count: 90,
  },
  {
    title: "connected_schools",
    svg: SVGICON.user2,
    change: "event-data",
    key: "connectedSchoolsNumber",
    count: 265,
  },
  {
    title: "number_of_total_teachers",
    svg: SVGICON.user2,
    change: "event-data",
    key: "teachersCount",
    count: 190,
  },
  // {
  //   title: "absents",
  //   svg: SVGICON.event,
  //   change: "event-data",
  //   key: "absentsCount",
  //   count: 18,
  // },
];

const Home = () => {
  const [schoolOverviewPage, setOverviewPage] = useState(1);
  const [schoolsPage, setSchoolsPage] = useState(1);
  const [schoolValues, setSchoolValues] = useState([]);
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [classesValues, setClassesValues] = useState([]);
  const [classId, setClassId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [date, setDate] = useState("");
  const [teacherDate, setTeacherDate] = useState([]);
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

  const { data: schoolNumbers } = useQuery({
    ...getSchoolNumbersQuery(),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: classes } = useQuery({
    ...getClassesQuery({
      PageSize: "1000",
      SchoolId: schoolId || user?.result.school?.id,
      WithStudents: true,
    }),
    enabled: Boolean(schoolId || user?.result.school?.id),
  });

  const { data: overall } = useQuery({
    ...getOverallStatisticsQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
      ClassId: classId,
      DateFrom: date,
      DateTo: date
        ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000 - 1000)
        : "",
    }),
  });

  const { data: schoolOverview } = useQuery({
    ...geSchoolOverviewQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
      PageIndex: schoolsPage,
      ClassId: classId,
      DateFrom: date,
      DateTo: date
        ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000 - 1000)
        : "",
    }),
  });

  const { data: overview } = useQuery({
    ...getDashboardOverviewQuery({
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
      DateFrom: date || "2023-09-01Z",
      DateTo: date
        ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000 - 1000)
        : "",
      ClassId: classId,
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

  useEffect(() => {
    if (classes?.result) {
      const options = classes.result.data.map((option) => ({
        label: `${option.degree}-${option.symbol}`,
        value: option.id,
      }));
      setClassesValues(options);
    }
  }, [classes]);

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {!user?.result.region?.id && (
          <div className="form-group mb-4" style={{ width: "200px" }}>
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
          <div className="form-group mb-4" style={{ width: "200px" }}>
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
          <div className="mb-2" style={{ width: "200px" }}>
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
        {(user?.result.class === null || schoolId) && schoolId && (
          <div className="mb-2" style={{ width: "200px" }}>
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("class")}
              </label>
              <select
                className="form-control form-control-md"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">{t("class")}</option>
                {classesValues?.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mb-2" style={{ width: "200px" }}>
          <label htmlFor="basic-url" className="form-label d-block">
            {t("date")}
          </label>
          <DatePicker
            className="form-control"
            placeholderText={t("select")}
            selected={date}
            onChange={(e) => {
              setDate(e);
              const year = e.getFullYear();
              const month = String(e.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
              const day = String(e.getDate()).padStart(2, "0");
              const day2 = String(+e.getDate() + 1).padStart(2, "0");
              const formattedDateFrom = `${year}-${month}-${day}`;
              const formattedDateTo = `${year}-${month}-${day2}`;
              setTeacherDate([`${formattedDateFrom}Z`, `${formattedDateTo}Z`]);
            }}
          />
        </div>
      </div>
      {user?.result.level >= 3 && (
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
                          <h2 className="font-w700 mb-0">
                            {schoolNumbers?.result[item.key]}
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
      )}
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
                    <th>{t("Percentage")}</th>
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
                              schoolsPage > 0 && setSchoolsPage(schoolsPage - 1)
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
                                schoolsPage === i + 1 ? "active" : ""
                              } `}
                              onClick={() => setSchoolsPage(i + 1)}
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
        </div>{" "}
        <div className="col-xl-12">
          <div className="card">
            <div
              className="card-header border-0 px-3"
              style={{ padding: "25px 20px", alignItems: "center" }}
            >
              <h4 className="heading m-0">{t("latestAbsents")}</h4>
            </div>
            <div className="card-body p-0">
              <TeacherDetails
                filter={{
                  RegionId: region,
                  CityId: cityId,
                  SchoolId: schoolId,
                  DateFrom: teacherDate?.[0],
                  DateTo: teacherDate?.[1],
                  ClassId: classId,
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
                    <th>{t("category")}</th>
                    <th>{t("Percentage")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: "red" }}>{t("category_1")}</td>
                    <td style={{ color: "red" }}>
                      <Badge bg="" className="badge-danger light badge-lg">
                        35%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "red" }}>{t("category_2")}</td>
                    <td style={{ color: "red" }}>
                      <Badge bg="" className="badge-danger light badge-lg">
                        15%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "red" }}>{t("category_3")}</td>
                    <td style={{ color: "red" }}>
                      <Badge bg="" className="badge-danger light badge-lg">
                        15%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "red" }}>{t("category_4")}</td>
                    <td style={{ color: "red" }}>
                      <Badge bg="" className="badge-danger light badge-lg">
                        10%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "green" }}>{t("category_5")}</td>
                    <td style={{ color: "green" }}>
                      <Badge bg="" className="badge-success light badge-lg">
                        20%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "green" }}>{t("category_6")}</td>
                    <td style={{ color: "green" }}>
                      <Badge bg="" className="badge-success light badge-lg">
                        50%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "green" }}>{t("category_7")}</td>
                    <td style={{ color: "green" }}>
                      <Badge bg="" className="badge-success light badge-lg">
                        30%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "orange" }}>{t("category_8")}</td>
                    <td style={{ color: "orange" }}>
                      <Badge bg="" className="badge-warning light badge-lg">
                        30%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "orange" }}>{t("category_9")}</td>
                    <td style={{ color: "orange" }}>
                      <Badge bg="" className="badge-warning light badge-lg">
                        35%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "orange" }}>{t("category_10")}</td>
                    <td style={{ color: "orange" }}>
                      <Badge bg="" className="badge-warning light badge-lg">
                        15%
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: "orange" }}>{t("category_11")}</td>
                    <td style={{ color: "orange" }}>
                      <Badge bg="" className="badge-warning light badge-lg">
                        25%
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
