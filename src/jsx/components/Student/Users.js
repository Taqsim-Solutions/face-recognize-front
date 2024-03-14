import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersQuery } from "../../../queries/index";
import AddUserModal from "./AddUserModal";
import DeleteModal from "./DeleteUser";

const Students = () => {
  const [editUser, setEditUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createModal, setCreateModal] = useState(false);

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
                <div />
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCreateModal(true)}
                  >
                    + New users
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
                        <th>Name</th>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Role</th>
                        <th>Email</th>
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
                            <span className="text-primary font-w600">
                              {item.id}
                            </span>
                          </td>
                          <td>
                            <div className="date">
                              {item.createdAt.slice(0, 10)}
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.role?.name}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.email}</h6>
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
                              textAlign: "right",
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
      <AddUserModal
        user={editUser}
        isCreate={createModal}
        onClose={() => {
          setCreateModal(false);
          setEditUser(false);
        }}
      />
      <DeleteModal isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
    </>
  );
};

export default Students;
