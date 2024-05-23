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

  console.log(attendances);

  useEffect(() => {
    if (attendances) {
      const payload = {};
      attendances?.result.map((schoolClass) => {
        if (!payload.schoolClass?.[schoolClass.degree]) {
          payload[schoolClass.degree] = [];
          payload[schoolClass.degree].push(schoolClass);
        }
        return payload[schoolClass.degree].push(schoolClass);
      });
      setClasses(payload);
    }
  }, [attendances]);

  return (
    <div>
      {Object.keys(classes).map((degree) => (
        <div key={degree} style={{ display: "flex", flexWrap: "wrap" }}>
          <h2
            className="font-w700 mb-0"
            style={{ fontSize: "30px", marginTop: "3px", width: "45px" }}
          >
            {degree}
          </h2>
          <div className="px-3" style={{ gap: "24px", display: "flex" }}>
            {classes[degree]?.map((item, i) => (
              <div
                className="card col-xl-3"
                style={{
                  cursor: "pointer",
                  border: selected.class === item.id ? "2px solid green" : "",
                }}
                onClick={() =>
                  setSelected({
                    class: item.id,
                    degree: degree,
                  })
                }
              >
                <div
                  className="card-body"
                  style={{
                    padding: "10px",
                    display: "flex",
                    width: "220px",
                  }}
                >
                  <h3 className="mb-2 font-w700" style={{ marginRight: "8px" }}>
                    {item.symbol}
                  </h3>
                  <p className="font-w700 mb-0" style={{ marginTop: "5px" }}>
                    {t("class")} ({item.absentStudentsCount})
                  </p>
                </div>
              </div>
            ))}
          </div>
          {selected.degree === degree && (
            <div style={{ width: "100%" }}>
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
                          onChange={(e) => setOnlyNotAttended(e.target.checked)}
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
                                    ? moment(item.comingTime).format("h:mm")
                                    : "-"}
                                </td>
                                <td>
                                  {item.leavingTime
                                    ? moment(item.leavingTime).format("h:mm")
                                    : "-"}
                                </td>
                              </tr>
                            ) : null
                          ) : (
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
                                  ? moment(item.comingTime).format("h:mm")
                                  : "-"}
                              </td>
                              <td>
                                {item.leavingTime
                                  ? moment(item.leavingTime).format("h:mm")
                                  : "-"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
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
                        minHeight: "250px",
                        objectFit: "cover",
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
                    {student.leavingTime
                      ? moment(student.comingTime).format("h:mm")
                      : "-"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
