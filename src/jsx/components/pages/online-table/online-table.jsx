import { useQuery } from "@tanstack/react-query";
import { getAttendancesQuery } from "../../../../queries/index";
import { useEffect, useState } from "react";
import { getAttendancesDetail } from "../../../../api";
import settings from "../../../../settings/settings";
import { useTranslation } from "react-i18next";
import * as moment from "moment";

const getCurrentDate = () => {
  var today = new Date();
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  return year + "-" + month + "-" + day + "Z";
};

export function OnlineTable() {
  const [mode, setMode] = useState(true);
  const [onlyNotAttented, setOnlyNotAttended] = useState(false);
  const [classes, setClasses] = useState({});
  const [students, setStudents] = useState();
  const [selected, setSelected] = useState({
    class: "",
    degree: "",
  });

  const { data: attendances } = useQuery({
    ...getAttendancesQuery(getCurrentDate()),
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (selected.class) {
      getAttendancesDetail(getCurrentDate(), selected.class)
        .then((res) => setStudents(res))
        .catch((err) => alert(err.data.message));
    }
  }, [selected.class]);

  useEffect(() => {
    if (attendances?.result) {
      const payload = {};
      attendances.result.forEach((schoolClass) => {
        console.log(schoolClass);
        if (!payload[schoolClass.degree]) {
          payload[schoolClass.degree] = [];
        }
        payload[schoolClass.degree].push(schoolClass);
      });
      setClasses(payload);
    }
  }, [attendances]);

  return (
    <div>
      {Object.keys(classes).map((degree) => (
        <div
          key={degree}
          id={degree}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <h2
            className="font-w700 mb-0"
            style={{ fontSize: "30px", marginTop: "3px", width: "45px" }}
          >
            {degree}
          </h2>
          <div
            className="px-3"
            style={{
              gap: "0 24px",
              display: "flex",
              flexWrap: "wrap",
              width: "80%",
            }}
          >
            {classes[degree]?.map((item, i) => (
              <a
                href={`#${item.degree}`}
                className="card"
                style={{
                  cursor: "pointer",
                  border: selected.class === item.id ? "2px solid green" : "",
                  width: "200px",
                }}
                onClick={() => {
                  if (
                    item.id !== selected.class ||
                    selected.degree !== degree
                  ) {
                    setSelected({
                      class: item.id,
                      degree: degree,
                    });
                  } else {
                    setSelected({
                      class: "",
                      degree: "",
                    });
                  }
                }}
              >
                <div
                  className="card-body"
                  style={{
                    padding: "10px",
                    display: "flex",
                    width: "220px",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <h3 className="font-w700" style={{ margin: "0 5px" }}>
                    {item.symbol}
                  </h3>
                  <p className="font-w700 mb-0">{t("class")}</p>
                  <h3
                    className="mb-2 font-w700"
                    style={{
                      marginLeft: "auto",
                      marginRight: "26px",
                      marginBottom: 0,
                    }}
                  >
                    <span>{item.studentsCount} / </span>
                    <span style={{ color: "red" }}>
                      {item.absentStudentsCount}
                    </span>
                  </h3>
                </div>
              </a>
            ))}
          </div>
          {selected.degree === degree && (
            <div style={{ width: "100%" }}>
              <div
                class="form-check form-switch"
                style={{
                  marginLeft: "60px",
                  marginBottom: "20px",
                  background: "white",
                  padding: "10px 50px",
                }}
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  defaultChecked={true}
                  onChange={(e) => setMode(e.target.checked)}
                />
                <label class="form-check-label" for="flexSwitchCheckDefault">
                  {t("table")}
                </label>
              </div>
              {mode && (
                <div
                  style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "6px",
                    marginBottom: "40px",
                    marginLeft: "60px",
                  }}
                >
                  <div>
                    <div>
                      <div
                        className="mb-4"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <h2 className="heading mb-0" style={{ color: "green" }}>
                          {t("attended")}
                        </h2>
                        <div class="form-check form-switch">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                            value={onlyNotAttented}
                            onChange={(e) =>
                              setOnlyNotAttended(e.target.checked)
                            }
                          />
                          <label
                            class="form-check-label"
                            for="flexSwitchCheckDefault"
                          >
                            {t("notAttendedStudents")}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive full-data">
                    <div
                      id="example-student_wrapper"
                      className="dataTables_wrapper no-footer"
                    >
                      <table
                        className="table-responsive-lg table display dataTablesCard student-tab dataTable no-footer"
                        id="example-student"
                      >
                        <thead>
                          <tr>
                            <th>{t("image")}</th>
                            <th>{t("name")}</th>
                            <th>{t("phoneNumber")}</th>
                            <th>{t("comingTime")}</th>
                            <th>{t("leavingTime")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students?.result?.map((item, ind) =>
                            onlyNotAttented ? (
                              !item.attended ? (
                                <tr key={ind}>
                                  <td>
                                    <img
                                      src={
                                        item.mainImageName
                                          ? `${settings.baseURL}/images?filename=${item.mainImageName}`
                                          : "https://st4.depositphotos.com/3265223/21282/v/450/depositphotos_212821870-stock-illustration-default-avatar-photo-placeholder-profile.jpg"
                                      }
                                      alt=""
                                      style={{
                                        width: "36px",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <div className="trans-list">
                                      <h4>{`${item.firstName} ${item.lastName}`}</h4>
                                    </div>
                                  </td>
                                  <td>
                                    <h6 className="mb-0">{item.phoneNumber}</h6>
                                  </td>
                                  <td>
                                    {item.attended
                                      ? moment
                                          .utc(new Date(item.comingTime))
                                          .format("hh:mm A")
                                      : "-"}
                                  </td>
                                  <td>
                                    {item.attended
                                      ? moment
                                          .utc(new Date(item.leavingTime))
                                          .format("hh:mm")
                                      : "-"}
                                  </td>
                                </tr>
                              ) : null
                            ) : (
                              item.attended && (
                                <tr key={ind}>
                                  <td>
                                    <img
                                      src={
                                        item.mainImageName
                                          ? `${settings.baseURL}/images?filename=${item.mainImageName}`
                                          : "https://st4.depositphotos.com/3265223/21282/v/450/depositphotos_212821870-stock-illustration-default-avatar-photo-placeholder-profile.jpg"
                                      }
                                      alt=""
                                      style={{
                                        width: "36px",
                                        borderRadius: "8px",
                                      }}
                                    />
                                  </td>
                                  <td>
                                    <div className="trans-list">
                                      <h4>{`${item.firstName} ${item.lastName}`}</h4>
                                    </div>
                                  </td>
                                  <td>
                                    <h6 className="mb-0">{item.phoneNumber}</h6>
                                  </td>
                                  <td>
                                    {item.attended
                                      ? moment
                                          .utc(new Date(item.comingTime))
                                          .format("hh:mm")
                                      : "-"}
                                  </td>
                                  <td>
                                    {item.attended
                                      ? moment
                                          .utc(new Date(item.leavingTime))
                                          .format("hh:mm")
                                      : "-"}
                                  </td>
                                </tr>
                              )
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {!mode && (
                <div
                  style={{
                    gap: "20px 0",
                    marginBottom: "50px",
                    marginLeft: "60px",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {students?.result?.map((student) => (
                    <div
                      key={student.id}
                      className="col-xl-2"
                      style={{
                        background: "white",
                        marginRight: "20px",
                        padding: "10px",
                        borderRadius: "8px",
                        width: "195px",
                      }}
                    >
                      <img
                        src={
                          student.mainImageName
                            ? `${settings.baseURL}/images?filename=${student.mainImageName}`
                            : "https://st4.depositphotos.com/3265223/21282/v/450/depositphotos_212821870-stock-illustration-default-avatar-photo-placeholder-profile.jpg"
                        }
                        alt=""
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          objectFit: "cover",
                          minHeight: "250px",
                        }}
                      />
                      <div className="trans-list">
                        <h5
                          style={{
                            marginTop: "10px",
                            marginBottom: "4px",
                          }}
                        >
                          {`${student.firstName} ${student.lastName}`}
                        </h5>
                      </div>
                      {t("comingTime")}:{" "}
                      {student.attended
                        ? moment
                            .utc(new Date(student.comingTime))
                            .format("hh:mm")
                        : "-"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
