import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSchoolsQuery,
  getMeQuery,
  getRegionsQuery,
} from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { DeleteSchool } from "./DeleteSchool";
import SchoolForm from "./SchoolForm";
import Pagination from "../../Pagination/Pagination";

const Schools = () => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState(null);
  const [createModal, setCreateModal] = useState();
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();
  const [size, setSize] = useState("10");

  const { data: schools } = useQuery({
    ...getSchoolsQuery({
      PageIndex: page,
      PageSize: size,
      Name: name,
      RegionId: region,
      CityId: cityId,
    }),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
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
                <div
                  style={{
                    gap: "20px",
                    display: "grid",
                    width: "85%",
                    justifyContent: "right",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                  }}
                >
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    name="name"
                    className="form-control"
                    required
                    placeholder={`${t("name")}`}
                  />
                  <select
                    className="form-control form-control-md"
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setCityId("");
                    }}
                    value={region}
                  >
                    <option value="">{t("region")}</option>
                    {regions?.result?.map((option) => (
                      <option value={option.id} key={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="form-control form-control-md"
                    onChange={(e) => setCityId(e.target.value)}
                    value={cityId}
                  >
                    <option value="">{t("district")}</option>
                    {regions?.result
                      .filter(
                        (currentRegion) => +region === currentRegion.id
                      )[0]
                      ?.cities?.map((option) => (
                        <option value={option.id} key={option.name}>
                          {option.name}
                        </option>
                      ))}
                  </select>
                  <div /> <div />
                  {user?.result.level === 5 && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setCreateModal(true)}
                    >
                      + {t("createButton")}
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
                        <th>{t("name")}</th>
                        <th>{t("region")}</th>
                        <th>{t("district")}</th>
                        <th className="text-end">{t("action")}</th>
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
      <Pagination
        totalPages={schools?.result.totalPages}
        onPageChange={(page) => setPage(page)}
        size={size}
        setSize={setSize}
      />
      <DeleteSchool isOpen={deleteModal} onClose={() => setDeleteModal(null)} />
    </>
  );
};

export default Schools;
