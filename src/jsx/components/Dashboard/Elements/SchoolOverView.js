import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const SchoolOverView = ({ data }) => {
  const [serie2s, setSeries] = useState([]);

  useEffect(() => {
    const payload = [
      {
        name: "Attented",
        data: [],
      },
    ];
    if (data) {
      data.forEach((day) => {
        payload[0].data.push(`${day.percentage}%`);
      });
    }
    setSeries(payload);
  }, [data]);

  const options = {
    chart: {
      type: "area",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["var(--rgba-primary-1)", "#f5a792"],
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["var(--primary)", "var(--secondary)"],
    },
    legend: {
      show: false,
    },
    grid: {
      show: false,
      strokeDashArray: 6,
      borderColor: "#dadada",
    },
    yaxis: {
      labels: {
        style: {
          colors: "#B5B5C3",
          fontSize: "12px",
          fontFamily: "Poppins",
          fontWeight: 400,
        },
        formatter: function (value) {
          return value % 1 === 0 ? value : "";
        },
      },
    },

    xaxis: {
      categories: [
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
        "April",
        "May",
      ],
      labels: {
        style: {
          colors: "#B5B5C3",
          fontSize: "12px",
          fontFamily: "Poppins",
          fontWeight: 400,
        },
      },
    },
    fill: {
      type: "solid",
      opacity: 0.05,
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };
  return (
    <div id="marketChart">
      <ReactApexChart
        options={options}
        series={serie2s}
        type="area"
        height={280}
      />
    </div>
  );
};
export default SchoolOverView;
