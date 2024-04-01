import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "../../../api";
import { useTranslation } from "react-i18next";

const DeleteModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const onSubmit = () => {
    setLoading(true);
    deleteUser(isOpen)
      .then(() => {
        queryClient.invalidateQueries(["users"]);
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
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
    </>
  );
};
export default DeleteModal;
