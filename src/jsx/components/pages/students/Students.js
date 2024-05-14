import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentsQuery,
  getMeQuery,
  getSchoolsQuery,
  getRegionsQuery,
  getClassesQuery,
} from "../../../../queries/index";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DeleteStudent } from "./DeleteStudent";
import settings from "../../../../settings/settings";
import FileUpload from "./StudentExcelUpload";
import { uploadStudentPhoto } from "../../../../api";
import Pagination from "../../Pagination/Pagination";

const Students = () => {
  const [firstName, setFirstName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [excelModal, setExcelModal] = useState(false);
  const [page, setPage] = useState(0);
  const [classesValues, setClassesValues] = useState([]);
  const [classId, setClassId] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: students } = useQuery({
    ...getStudentsQuery({
      PageIndex: page,
      PageSize: 10,
      searchText: firstName,
      RegionId: user?.result.region?.id || region,
      CityId: user?.result.city?.id,
      SchoolId: user?.result.school?.id || schoolId,
      ClassId: classId,
    }),
  });

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ size: "100", RegionId: region, CityId: cityId }),
  });

  const { data: classes } = useQuery({
    ...getClassesQuery({
      PageSize: "1000",
      SchoolId: schoolId || user?.result.school?.id,
      WithStudents: true,
    }),
    enabled: Boolean(schoolId || user?.result.school?.id),
  });

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const onUpload = async (fileList, studentId) => {
    // Convert FileList to an array
    const images = Array.from(fileList);

    const uploadPromises = images.map((imageFile) => {
      const formData = new FormData();
      formData.append("file", imageFile);

      return uploadStudentPhoto(formData, studentId)
        .then((response) => response.data)
        .catch((error) => {
          alert(error.response?.data?.message || "Upload failed");
        });
    });

    // Wait for all promises to complete
    await Promise.all(uploadPromises);

    // Invalidate query cache to trigger re-fetching
    queryClient.invalidateQueries(["students"]);
  };

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
                  className="dashboard_bar header-left"
                  style={{
                    textTransform: "capitalize",
                    fontSize: "20px",
                    width: "10%",
                  }}
                >
                  {t("students")}
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
                  {!user?.result.region?.id && (
                    <select
                      className="form-control form-control-md"
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setCityId("");
                        setSchoolId("");
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
                  )}
                  {!user?.result.city?.id && region && (
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
                  {!user?.result.school?.id && cityId && (
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
                  )}
                  {(!user?.result.class?.id || schoolId) && schoolId && (
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
                </div>{" "}
                {(user?.result.level === 1 ||
                  user?.result.level === 5 ||
                  user?.result.level === 2) && (
                  <div style={{ marginLeft: "auto" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => navigate("/students/create")}
                      style={{ marginRight: "15px" }}
                    >
                      + {t("createButton")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setExcelModal(true)}
                      style={{
                        width: "100px",
                      }}
                    >
                      {t("excelUploadButton")}
                    </button>
                  </div>
                )}
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
                        <th>{t("name")}</th>
                        <th>{t("phoneNumber")}</th>
                        <th>{t("dateOfBirth")}</th>
                        <th>{t("father_of_student")}</th>
                        <th>{t("mother_of_student")}</th>{" "}
                        <th>{t("uploadImage")}</th>
                        <th className="text-end">{t("action")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students?.result?.data.map((item, ind) => (
                        <tr key={ind}>
                          <td>
                            <div className="trans-list" style={{ gap: "15px" }}>
                              <img
                                src={`${settings.baseURL}/images?filename=${item.mainImageName}`}
                                alt=""
                                style={{ width: "50px", borderRadius: "8px" }}
                              />
                              <div>
                                <h4>{`${item.firstName} ${item.lastName}`}</h4>
                                <h6 className="mb-0">
                                  {item.schoolName} ({item.className})
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <h6 className="mb-0">{item.phoneNumber}</h6>
                          </td>
                          <td>
                            <h6 className="mb-0">
                              {item.dateOfBirth.slice(0, 10)}
                            </h6>
                          </td>
                          <td>
                            <div className="trans-list" style={{ gap: "15px" }}>
                              <div>
                                <h4>{`${item.parents?.[0]?.firstName || ""} ${
                                  item.parents?.[0]?.lastName || ""
                                }`}</h4>
                                <h6 className="mb-0">
                                  {item.parents?.[0]?.phoneNumber}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="trans-list" style={{ gap: "15px" }}>
                              <div>
                                <h4>{`${item.parents?.[1]?.firstName || ""} ${
                                  item.parents?.[1]?.lastName || ""
                                }`}</h4>
                                <h6 className="mb-0">
                                  {item.parents?.[1]?.phoneNumber}
                                </h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <input
                              accept="image/*"
                              type="file"
                              id="formFile"
                              onChange={(e) =>
                                onUpload(e.target.files, item.id)
                              }
                              multiple
                            />
                          </td>
                          <td
                            style={{
                              justifyContent: "right",
                              display: "flex",
                              gap: "10px",
                              marginTop: "8px",
                            }}
                          >
                            {(user?.result.level === 1 ||
                              user?.result.level === 5) && (
                              <>
                                <i
                                  className="material-icons"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    navigate(`/students/${item.id}`)
                                  }
                                >
                                  edit
                                </i>
                              </>
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
      <Pagination
        onPageChange={(page) => setPage(page)}
        totalPages={students?.result.totalPages}
      />
    </>
  );
};

export default Students;
