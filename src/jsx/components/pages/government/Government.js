import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGovernmentsQuery } from "../../../../queries/index";
import { DeleteGovernment } from "./DeleteGovernment";
import GovernmentModal from "./GovernmentForm";

const Governments = () => {
  const [editUser, setEditUser] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const { data: customers } = useQuery({
    ...getGovernmentsQuery(),
  });

  return (
    <>
      {createModal && (
        <GovernmentModal
          user={editUser}
          isCreate={createModal}
          onClose={() => {
            setCreateModal(false);
            setEditUser(false);
          }}
        />
      )}
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{ textTransform: "capitalize", fontSize: "20px" }}
                >
                  Government
                </div>
                <div className="d-flex">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCreateModal(true)}
                  >
                    + New government
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
                        <th>Id</th>
                        <th>Level</th>
                        <th>Login</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers?.result?.data.map((item, ind) => (
                        <tr key={ind}>
                          <td>
                            <div className="trans-list">
                              <h4>{`${item.firstName} ${item.lastName}`}</h4>
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.id}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.level}</h6>
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
      <DeleteGovernment
        isOpen={deleteModal}
        onClose={() => setDeleteModal(null)}
      />
    </>
  );
};

export default Governments;
