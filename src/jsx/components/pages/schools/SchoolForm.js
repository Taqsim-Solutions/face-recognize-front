import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { getRegionsQuery } from "../../../../queries/index";
import { createSchool, editSchool } from "../../../../api";
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

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

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
