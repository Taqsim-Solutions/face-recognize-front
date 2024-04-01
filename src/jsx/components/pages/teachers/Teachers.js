import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTeachersQuery,
  getSchoolsQuery,
  getRegionsQuery,
} from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DeleteTeacher } from "./DeleteTeacher";
import settings from "../../../../settings/settings";

const Teachers = () => {
  const [firstName, setFirstName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ size: "100", RegionId: region, CityId: cityId }),
  });

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const { data: customers } = useQuery({
    ...getTeachersQuery({
      PageIndex: page,
      PageSize: 10,
      FirstName: firstName,
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
    }),
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
                  {t("teachers")}
                </div>
                <div
                  style={{
                    gap: "20px",
                    display: "grid",
                    width: "80%",
                    justifyContent: "right",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                  }}
                >
                  <div />
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    name="firstName"
                    className="form-control"
                    required
                    placeholder={`${t("firstName")}`}
                  />
                  <select
                    className="form-control form-control-md"
                    onChange={(e) => setRegion(e.target.value)}
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
                  <select
                    className="form-control form-control-md"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                  >
                    <option value="">{t("select")}</option>
                    {schools?.result.data?.map((option) => (
                      <option value={option.id} key={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate("/teachers/create")}
                  >
                    + {t("createButton")}
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
                        <td>{t("image")}</td>
                        <th>{t("name")}</th>
                        <th>{t("school")}</th>
                        <th>{t("email")}</th>
                        <th>{t("username")}</th>
                        <th className="text-end">{t("action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers?.result?.data?.map((item, ind) => (
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
                              onClick={() => navigate(`/teachers/${item.id}`)}
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
      <DeleteTeacher
        isOpen={deleteModal}
        onClose={() => setDeleteModal(null)}
      />
      {customers?.result.totalPages > 0 && (
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
                  .repeat(customers?.result.totalPages - 1)
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
                      page + 1 < customers?.result.totalPages &&
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

export default Teachers;
