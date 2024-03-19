import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSchoolsQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { DeleteSchool } from "./DeleteSchool";
import SchoolForm from "./SchoolForm";

const Schools = () => {
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState(null);
  const [createModal, setCreateModal] = useState();
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();

  const { data: schools } = useQuery({
    ...getSchoolsQuery(),
  });

  return (
    <>
      <div className="row">
        <SchoolForm
          school={selectedSchoolForEdit}
          isCreate={createModal}
          onClose={() => {
            setCreateModal(false);
            setSelectedSchoolForEdit(false);
          }}
        />
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
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setCreateModal(true)}
                  >
                    + New school
                  </button>
                  {/* <button
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
                  </button> */}
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
                            z{" "}
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
                              onClick={() => setSelectedSchoolForEdit(item)}
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
      <DeleteSchool isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
    </>
  );
};

export default Schools;
