import React, { useEffect, useState } from "react";
import dashboardService from "./DashboardService";

const DashboardScreen = () => {
  const [_lineData1, setLineData1] = useState([]);
  const [_lineData2, setLineData2] = useState([]);

  const getData = async () => {
    const res = await dashboardService.getLineGraph();
    setLineData1(res.negative);
    setLineData2(res.positive);
  };

  useEffect(() => {
    getData();
  }, []);

  return <></>;
};

export default DashboardScreen;
