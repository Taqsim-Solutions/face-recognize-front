import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getUsersQuery } from "../../../queries/index";
import AddUserModal from "./AddUserModal";
import DeleteModal from "./DeleteUser";
import FileUpload from "./StudentExcelUpload";
import ImportExcelButton from "../../../utils/importExcel";

const Schools = () => {
  const [editUser, setEditUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [excelModal, setExcelModal] = useState(false);
  const { t } = useTranslation();

  const { data: users } = useQuery({
    ...getUsersQuery(),
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
                  {t("Schools")}
                </div>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCreateModal(true)}
                  >
                    + New school
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setExcelModal(true)}
                    style={{ margin: "0 5px" }}
                  >
                    Excel Upload
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => ImportExcelButton()}
                  >
                    Import Excel
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
                  {/* <table
                    style={{ paddingBottom: "100px" }}
                    className="table-responsive-lg table display dataTablesCard student-tab dataTable no-footer"
                    id="example-student"
                  >
                    <thead>
                      <tr>
                        <th>{t("name")}</th>
                        <th>Date</th>
                        <th>Email</th>
                        <th>Login</th>
                        <th>Level</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users?.result.map((item, ind) => (
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
                          <td>
                            <div
                              class={`badge bg-${
                                item.grade === "0"
                                  ? "secondary"
                                  : item.grade === "1"
                                  ? "primary"
                                  : "warning"
                              }`}
                            >
                              {item.level}
                            </div>
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
                  </table> */}
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
      {excelModal && (
        <FileUpload
          user={editUser}
          isCreate={excelModal}
          onClose={() => {
            setExcelModal(false);
          }}
        />
      )}
      <DeleteModal isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
    </>
  );
};

export default Schools;
