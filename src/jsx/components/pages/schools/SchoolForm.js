import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { getRegionsQuery, getCamerasQuery } from "../../../../queries/index";
import { createSchool, editSchool, createCamera, updateCamera, deleteCamera } from "../../../../api";
import { useTranslation } from "react-i18next";

const SchoolForm = ({ isCreate, school, onClose }) => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [loading, setLoading] = useState(false);
  let errorsObj = {
    name: "",
    cityId: "",
  };
  const { t } = useTranslation();
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  const [cameras, setCameras] = useState([]);
  const [newCamera, setNewCamera] = useState({ name: "", serialNumber: "", type: 1 });
  const [showAddCamera, setShowAddCamera] = useState(false);


  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const { data: schoolCameras, refetch: refetchCameras } = useQuery({
    ...getCamerasQuery({ schoolId: school?.id }),
    enabled: !!school?.id,
  });

  useEffect(() => {
    if (schoolCameras?.result) {
      setCameras(schoolCameras.result);
    }
  }, [schoolCameras]);


  const handleAddCamera = () => {
    if (!newCamera.name || !newCamera.serialNumber) {
      swal("Oops", t("fillAllFields"), "error");
      return;
    }
    setLoading(true);
    createCamera({ ...newCamera, schoolId: school.id })
      .then(() => {
        refetchCameras();
        setNewCamera({ name: "", serialNumber: "", type: 1 });
        setShowAddCamera(false);
      })
      .catch((err) => swal("Oops", err.data.message, "error"))
      .finally(() => setLoading(false));
  };

  const handleDeleteCamera = (cameraId) => {
    swal({
      title: t("areYouSure"),
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteCamera(cameraId).then(() => refetchCameras());
      }
    });
  };

  const onSubmit = () => {

    let error = false;
    const errorObj = { ...errorsObj };
    if (cityId === "") {
      errorObj.cityId = `${t("district")} ${t("isRequired")}`;
      error = true;
    }
    if (name === "") {
      errorObj.name = `${t("name")} ${t("isRequired")}`;
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (school ? editSchool : createSchool)(
      {
        name,
        cityId,
      },
      school?.id
    )
      .then(() => {
        queryClient.invalidateQueries(["schools"]);
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (school) {
      setCityId(school.region.cities[0].id);
      setName(school.name);
      setRegion(school.region.id);
    }
  }, [school]);

  return (
    <>
      <Modal onHide={onClose} show={isCreate || school} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {school ? t("editButton") : t("createButton")}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("name")}
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <div className="text-danger fs-12">{errors.name}</div>
              )}
            </div>
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("region")}
              </label>
              <select
                className="form-control form-control-md"
                onChange={(e) => setRegion(e.target.value)}
                value={region}
              >
                <option value="">{t("select")}</option>
                {regions?.result?.map((option) => (
                  <option value={option.id} key={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.cityId && (
                <div className="text-danger fs-12">{errors.cityId}</div>
              )}
            </div>
            {region && (
              <div className="form-group mb-3">
                <label htmlFor="basic-url" className="form-label d-block">
                  {t("district")}
                </label>
                <select
                  className="form-control form-control-md"
                  onChange={(e) => setCityId(e.target.value)}
                  value={cityId}
                >
                  <option value="">{t("select")}</option>
                  {regions?.result
                    .filter((currentRegion) => +region === currentRegion.id)[0]
                    ?.cities?.map((option) => (
                      <option value={option.id} key={option.name}>
                        {option.name}
                      </option>
                    ))}
                </select>
                {errors.cityId && (
                  <div className="text-danger fs-12">{errors.cityId}</div>
                )}
              </div>
            )}

            {school && (
              <div className="mt-4">
                <h6>{t("cameras")}</h6>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>{t("name")}</th>
                      <th>{t("serialNumber")}</th>
                      <th>{t("type")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cameras.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.serialNumber}</td>
                        <td>
                          {c.type === 1 ? t("Entrance") : c.type === 2 ? t("Exit") : t("EntranceAndExit")}
                        </td>
                        <td>
                          <i
                            className="material-icons text-danger"
                            style={{ cursor: "pointer", fontSize: "18px" }}
                            onClick={() => handleDeleteCamera(c.id)}
                          >
                            delete
                          </i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!showAddCamera ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAddCamera(true)}
                  >
                    + {t("addCamera")}
                  </button>
                ) : (
                  <div className="border p-2 rounded">
                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm mb-1"
                        placeholder={t("cameraName")}
                        value={newCamera.name}
                        onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm mb-1"
                        placeholder={t("serialNumber")}
                        value={newCamera.serialNumber}
                        onChange={(e) => setNewCamera({ ...newCamera, serialNumber: e.target.value })}
                      />
                      <select
                        className="form-control form-control-sm mb-2"
                        value={newCamera.type}
                        onChange={(e) => setNewCamera({ ...newCamera, type: parseInt(e.target.value) })}
                      >
                        <option value={1}>{t("Entrance")}</option>
                        <option value={2}>{t("Exit")}</option>
                        <option value={3}>{t("EntranceAndExit")}</option>
                      </select>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={handleAddCamera}
                      >
                        {t("saveButton")}
                      </button>
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={() => setShowAddCamera(false)}
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger light"
              onClick={onClose}
            >
              {t("closeButton")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              {school ? t("saveButton") : t("createButton")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SchoolForm;
