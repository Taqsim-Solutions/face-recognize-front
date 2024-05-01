import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import swal from "sweetalert";
import { updateTeacherPassword } from "../../../../../api";

export function NewPassword({ onClose, id }) {
  const [errors, setErrors] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const onSubmit = () => {
    let error = false;
    const errorObj = { ...errors };
    if (newPassword === "") {
      errorObj.newPassword = `${t("password")} ${t("isRequired")}`;
      error = true;
    }
    if (repeat !== newPassword) {
      errorObj.repeat = t("repeat_password");
      error = true;
    }

    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    updateTeacherPassword(newPassword, id)
      .then((res) => {
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal className="fade" show={!!id} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>{t("new_password")}</Modal.Title>
        <Button variant="" className="btn-close" onClick={onClose}></Button>
      </Modal.Header>
      <Modal.Body>
        <div class="mb-3 d-block col-lg-12">
          <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
            {t("new_password")}
          </label>
          <input
            className="form-control"
            id="exampleFormControlInput2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <div className="text-danger fs-12">{errors.newPassword}</div>
          )}
        </div>{" "}
        <div class="mb-3 d-block col-lg-12">
          <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
            {t("repeat_password")}
          </label>
          <input
            className="form-control"
            id="exampleFormControlInput2"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
          {errors.repeat && (
            <div className="text-danger fs-12">{errors.repeat}</div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger light" onClick={onClose}>
          {t("closeButton")}
        </Button>
        <Button variant="primary" disabled={loading} onClick={onSubmit}>
          {t("saveButton")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
