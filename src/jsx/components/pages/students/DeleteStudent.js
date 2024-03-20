import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { deleteStudent } from "../../../../api/index";

export const DeleteStudent = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = () => {
    setLoading(true);
    deleteStudent(isOpen)
      .then(() => {
        queryClient.invalidateQueries(["students"]);
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
              Delete student
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            Do you really want to delete this student?
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger light"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSubmit}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
