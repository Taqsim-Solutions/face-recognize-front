import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentsQuery, getMeQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DeleteStudent } from "./DeleteStudent";
import settings from "../../../../settings/settings";
import FileUpload from "./StudentExcelUpload";

const Students = () => {
  const [excelModal, setExcelModal] = useState(false);
  const [page, setPage] = useState(0);
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: students } = useQuery({
    ...getStudentsQuery({ PageIndex: page, PageSize: 10 }),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{ textTransform: "capitalize", fontSize: "20px" }}
                >
                  {t("students")}
                </div>
                <div className="d-flex">
                  {(user?.result.level === 1 || user?.result.level === 5) && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigate("/students/create")}
                      >
                        + New student
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setExcelModal(true)}
                        style={{ margin: "0 5px" }}
                      >
                        Excel Upload
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <FileUpload
              isOpen={excelModal}
              onClose={() => setExcelModal(false)}
            />
            <div className="col-xl-12 wow fadeInUp" data-wow-delay="1.5s">
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
                        <th>School</th>
                        <th>Phone number</th>
                        <th>Class name</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students?.result?.data.map((item, ind) => (
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
                            <h6 className="mb-0">{item.schoolName}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.phoneNumber}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.className}</h6>
                          </td>
                          <td
                            style={{
                              justifyContent: "right",
                              display: "flex",
                              gap: "10px",
                            }}
                          >
                            {(user?.result.level === 1 ||
                              user?.result.level === 5) && (
                              <i
                                className="material-icons"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/students/${item.id}`)}
                              >
                                edit
                              </i>
                            )}
                            <i
                              className="material-icons"
                              style={{ cursor: "pointer" }}
                              onClick={() => setDeleteModal(item.id)}
                            >
                              delete
                            </i>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteStudent
        isOpen={deleteModal}
        onClose={() => setDeleteModal(null)}
      />

      {students?.result.totalPages > 0 && (
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
                    onClick={() => page > 0 && setPage(page - 1)}
                  >
                    <i className="la la-angle-left"></i>
                  </p>
                </li>
                {students?.result.totalPages > 0 &&
                  "page"
                    .repeat(students?.result.totalPages - 1)
                    .split("page")
                    .map((number, i) => (
                      <li
                        key={i}
                        className={`page-item  ${page === i ? "active" : ""} `}
                        onClick={() => setPage(i)}
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
                      page + 1 < students?.result.totalPages &&
                      setPage(page + 1)
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
    </>
  );
};

export default Students;
