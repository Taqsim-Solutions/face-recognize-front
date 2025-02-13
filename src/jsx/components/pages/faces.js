import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getFacesQuery } from "../../../queries/index";
import { useState } from "react";
import Pagination from "../Pagination/Pagination";
import { getMeQuery } from "../../../queries/index";

function Faces() {
  const [showMainImage, setShowMainImage] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState("10");
  const { t } = useTranslation();

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  const { data: faces } = useQuery({
    ...getFacesQuery({
      PageIndex: page,
      PageSize: size,
      DateFrom: "2023-09-01Z",
    }),
  });

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row" style={{ marginLeft: "3px" }}>
            <div className="page-title flex-wrap">
              <div
                className="dashboard_bar header-left"
                style={{
                  textTransform: "capitalize",
                  fontSize: "20px",
                }}
              >
                {t("faces")}
              </div>
              {user?.result?.level === 5 && (
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="flexSwitchCheckDefault"
                    onChange={(e) => setShowMainImage(e.target.checked)}
                    value={showMainImage}
                  />
                  <label class="form-check-label" for="flexSwitchCheckDefault">
                    {t("show_main_images")}
                  </label>
                </div>
              )}
            </div>
            {faces?.result?.data?.map((image) => (
              <div
                className="card"
                style={{ marginLeft: "24px", padding: "10px", width: "200px" }}
              >
                <img
                  src={`data:image/png;base64, ${
                    showMainImage ? image.mainImage64 : image.image64
                  }`}
                  alt=""
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    height: "170px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "5px",
                    textAlign: "center",
                    lineHeight: 1.3,
                    color: "black",
                  }}
                >
                  {image.name}
                </p>
                <p
                  style={{
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.comingTime.slice(0, 10).split("-").join(".")}-{" "}
                  {image.comingTime.slice(11, 19)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pagination
        onPageChange={(page) => setPage(page)}
        totalPages={faces?.result.totalPages}
        size={size}
        setSize={setSize}
      />
    </>
  );
}

export default Faces;
