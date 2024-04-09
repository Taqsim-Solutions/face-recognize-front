import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersQuery } from "../../../queries/index";
import AddUserModal from "./AddUserModal";
import DeleteModal from "./DeleteUser";
import { useTranslation } from "react-i18next";

const Students = () => {
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();

  const { data: users } = useQuery({
    ...getUsersQuery({ PageIndex: page }),
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
                  {t("users")}
                </div>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCreateModal(true)}
                  >
                    + {`${t("createButton")}`}
                  </button>
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
                        <th>{t("name")}</th>
                        <th>{t("dateOfRegistration")}</th>
                        <th>{t("email")}</th>
                        <th>{t("login")}</th>
                        <th className="text-end">{t("action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.result?.data.map((item, ind) => (
                        <tr key={ind}>
                          <td>
                            <div className="trans-list">
                              <h4>{`${item.firstName} ${item.lastName}`}</h4>
                            </div>
                          </td>
                          <td>
                            <div className="date">
                              {item.createdAt.slice(0, 10)}
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.email}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.login}</h6>
                          </td>
                          <td
                            style={{
                              justifyContent: "right",
                              display: "flex",
                              gap: "10px",
                            }}
                          >
                            <i
                              className="material-icons"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                setEditUser(item);
                                setCreateModal(true);
                              }}
                            >
                              edit
                            </i>
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
      {createModal && (
        <AddUserModal
          user={editUser}
          isCreate={createModal}
          onClose={() => {
            setCreateModal(false);
            setEditUser(false);
          }}
        />
      )}
      <DeleteModal isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
      {users?.result.totalPages > 0 && (
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
                  .repeat(users?.result.totalPages - 1)
                  .split("page")
                  .map((number, i) => (
                    <li
                      key={i}
                      className={`page-item  ${
                        page === i + 1 ? "active" : ""
                      } `}
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
                      page + 1 < users?.result.totalPages && setPage(page + 1)
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
