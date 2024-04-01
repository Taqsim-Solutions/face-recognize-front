import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { deleteSchool } from "../../../../api/index";
import { useTranslation } from "react-i18next";

export const DeleteSchool = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const onSubmit = () => {
    setLoading(true);
    deleteSchool(isOpen)
      .then(() => {
        queryClient.invalidateQueries(["schools"]);
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal onHide={onClose} show={isOpen} centered>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">
            {t("deleteButton")}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <div className="modal-body">{t("deleteConfirmTxt")}</div>
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
            {t("deleteButton")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
