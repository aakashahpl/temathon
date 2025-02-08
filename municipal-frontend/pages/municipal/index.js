"use client";
import React, { useEffect, useRef } from "react";
import MapboxMap from "../../components/MapboxMap";


const Municipal = () => {

  return (
    <div className="w-100 h-screen flex justify-end">
        <div className="w-8/12">

        <MapboxMap/>
        </div>
    </div>
  );
};

export default Municipal;
