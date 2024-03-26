import { useQuery } from "@tanstack/react-query";
import { getAttendancesQuery } from "../../../../queries/index";
import { useEffect, useState } from "react";
import { getAttendancesDetail } from "../../../../api";
import settings from "../../../../settings/settings";

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
  const [students, setStudents] = useState();
  const [selectedClass, setSelectedClass] = useState("");
  const { data: attendances } = useQuery({
    ...getAttendancesQuery(getCurrentDate()),
  });

  useEffect(() => {
    if (selectedClass) {
      getAttendancesDetail(getCurrentDate(), selectedClass).then((res) =>
        setStudents(res)
      );
    }
  }, [selectedClass]);

  return (
    <div>
      <div className="row px-3">
        {attendances?.result.map((item, i) => (
          <div
            className="card col-xl-3"
            style={{
              cursor: "pointer",
              border: selectedClass === item.id ? "1px solid green" : "",
            }}
            onClick={() => setSelectedClass(item.id)}
          >
            <div className="card-body pb-xl-4 pb-sm-3 pb-0">
              <div className="col-xl-3 col-6" key={i}>
                <div className="content-box">
                  <div className="chart-num">
                    <p className="mb-2">
                      {item.degree}-{item.symbol}
                    </p>
                    <h2 className="font-w700 mb-0">
                      {item.absentStudentsCount}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedClass && (
        <div className="col-xl-12 card wow fadeInUp" data-wow-delay="1.5s">
          <div className="table-responsive full-data">
            <div
              id="example-student_wrapper"
              className="dataTables_wrapper no-footer"
            >
              <table
                style={{ paddingBottom: "100px" }}
                className="table-responsive-lg table display dataTablesCard student-tab dataTable no-footer"
                id="example-student"
              >
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Date of birth</th>
                    <th>Phone number</th>
                    <th>Class name</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.result?.map((item, ind) => (
                    <tr key={ind}>
                      <td>
                        <img
                          src={`${settings.baseURL}/images?filename=${item.mainImageName}`}
                          alt=""
                          style={{ width: "50px", borderRadius: "8px" }}
                        />
                      </td>
                      <td>
                        <div className="trans-list">
                          <h4>{`${item.firstName} ${item.lastName}`}</h4>
                        </div>
                      </td>
                      <td>
                        <h6 className="mb-0">
                          {item.dateOfBirth.slice(0, 10)}
                        </h6>
                      </td>
                      <td>
                        <h6 className="mb-0">{item.phoneNumber}</h6>
                      </td>
                      <td>
                        <h6 className="mb-0">{item.className}</h6>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
