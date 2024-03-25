import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchoolsQuery, getMeQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { DeleteSchool } from "./DeleteSchool";
import SchoolForm from "./SchoolForm";

const Schools = () => {
  const [page, setPage] = useState(1);
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState(null);
  const [createModal, setCreateModal] = useState();
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ PageIndex: page }),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  return (
    <>
      <div className="row">
        {(selectedSchoolForEdit || createModal) && (
          <SchoolForm
            school={selectedSchoolForEdit}
            isCreate={createModal}
            onClose={() => {
              setCreateModal(false);
              setSelectedSchoolForEdit(false);
            }}
          />
        )}
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{ textTransform: "capitalize", fontSize: "20px" }}
                >
                  {t("schools")}
                </div>
                <div className="d-flex">
                  {user?.result.level === 5 && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCreateModal(true)}
                    >
                      + New school
                    </button>
                  )}
                </div>
              </div>
            </div>
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
                        <th>Name</th>
                        <th>Region</th>
                        <th>District</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools?.result?.data.map((item, ind) => (
                        <tr key={ind}>
                          <td>
                            <div className="trans-list">
                              <h4>{item.name}</h4>
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.region.name}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">
                              {item.region.cities[0].name}
                            </h6>
                          </td>
                          <td
                            style={{
                              justifyContent: "right",
                              display: "flex",
                              gap: "10px",
                            }}
                          >
                            {user?.result.level === 5 && (
                              <i
                                className="material-icons"
                                style={{ cursor: "pointer" }}
                                onClick={() => setSelectedSchoolForEdit(item)}
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
              {"page"
                .repeat(schools?.result.totalPages - 1)
                .split("page")
                .map((number, i) => (
                  <li
                    key={i}
                    className={`page-item  ${page === i + 1 ? "active" : ""} `}
                    onClick={() => setPage(i + 1)}
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
                    page + 1 < schools?.result.totalPages && setPage(page + 1)
                  }
                >
                  <i className="la la-angle-right"></i>
                </p>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <DeleteSchool isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
    </>
  );
};

export default Schools;
