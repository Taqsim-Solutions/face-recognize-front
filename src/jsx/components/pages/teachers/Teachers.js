import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTeachersQuery,
  getSchoolsQuery,
  getRegionsQuery,
  getMeQuery,
  getClassesQuery,
} from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DeleteTeacher } from "./DeleteTeacher";
import settings from "../../../../settings/settings";
import Pagination from "../../Pagination/Pagination";

const Teachers = () => {
  const [firstName, setFirstName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [classesValues, setClassesValues] = useState([]);
  const [classId, setClassId] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState("10");
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ size: size, RegionId: region, CityId: cityId }),
  });

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: classes } = useQuery({
    ...getClassesQuery({
      PageSize: "1000",
      SchoolId: schoolId || user?.result?.school?.id,
      WithStudents: true,
    }),
    enabled: Boolean(schoolId || user?.result?.school?.id),
  });

  const { data: customers } = useQuery({
    ...getTeachersQuery({
      PageIndex: page,
      searchText: firstName,
      RegionId: region,
      CityId: cityId,
      SchoolId: schoolId,
      ClassId: classId,
      PageSize: size,
    }),
  });

  useEffect(() => {
    if (classes?.result) {
      const options = classes.result.data.map((option) => ({
        label: `${option.degree}-${option.symbol}`,
        value: option.id,
      }));
      setClassesValues(options);
    }
  }, [classes]);

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row">
            <div className="col-xl-12">
              <div className="page-title flex-wrap tableTop">
                <div
                  className="dashboard_bar"
                  style={{
                    textTransform: "capitalize",
                    fontSize: "20px",
                    width: "15%",
                  }}
                >
                  {t("teachers")}
                </div>
                <div className="teacherFilters">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    name="firstName"
                    className="form-control"
                    required
                    placeholder={`${t("firstName")}`}
                  />
                  {!user?.result?.region?.id && (
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
                  )}
                  {!user?.result?.city?.id && region && (
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
                  )}
                  {!user?.result?.school?.id && cityId && (
                    <select
                      className="form-control form-control-md"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                    >
                      <option value="">{t("school")}</option>
                      {schools?.result.data?.map((option) => (
                        <option value={option.id} key={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  )}{" "}
                  {!user?.result?.class?.id &&
                    (user?.result?.school?.id || schoolId) && (
                      <select
                        className="form-control form-control-md"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                      >
                        <option value="">{t("class")}</option>
                        {classesValues?.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ marginLeft: "auto" }}
                  onClick={() => navigate("/teachers/create")}
                >
                  + {t("createButton")}
                </button>
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
                        <th>{t("class")}</th>
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
                            <h6 className="mb-0">{`${item.class?.degree || ""}${
                              item.class?.symbol ? `-${item.class?.symbol}` : ""
                            }`}</h6>
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
      <Pagination
        size={size}
        setSize={setSize}
        onPageChange={(page) => setPage(page)}
        totalPages={customers?.result.totalPages}
      />
    </>
  );
};

export default Teachers;
