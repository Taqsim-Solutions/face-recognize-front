import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getUnknownFacesQuery } from "../../../queries/index";
import { useState } from "react";
import settings from "../../../settings/settings";
import { deleteUnknownImage } from "../../../api";
import Pagination from "../Pagination/Pagination";

function UnknownFaces() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState("10");
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: faces } = useQuery({
    ...getUnknownFacesQuery({
      PageIndex: page,
      PageSize: size,
      DateFrom: "2023-09-01Z",
    }),
  });

  const onDeleteImage = (imageName) => {
    deleteUnknownImage(imageName).then(() => {
      queryClient.invalidateQueries(["unknown-faces"]);
    });
  };

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row" style={{ rowGap: "5px" }}>
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{ textTransform: "capitalize", fontSize: "20px" }}
                >
                  {t("unknown-faces")}
                </div>
              </div>
            </div>
            {faces?.result?.data?.map((image) => (
              <div
                className="card"
                style={{ marginLeft: "35px", padding: "10px", width: "200px" }}
              >
                <img
                  src={`${settings.baseURL}/api/images?filename=${image.imageName}`}
                  alt=""
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.imageName}
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.createdAt.slice(0, 10).split("-").join(".")}-{" "}
                  {image.createdAt.slice(11, 19)}
                </p>
                <button
                  className="btn btn-danger sw-btn-next ms-1 mt-3"
                  style={{ width: "100%" }}
                  onClick={() => onDeleteImage(image.id)}
                >
                  {t("delete")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pagination
        currentPage={page}
        onPageChange={(page) => setPage(page)}
        totalPages={faces?.result.totalPages}
        size={size}
        setSize={setSize}
      />
    </>
  );
}

export default UnknownFaces;
