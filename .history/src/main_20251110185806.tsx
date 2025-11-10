// FILE: src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import RootLayout from "./layout/RootLayout";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";

// Top-Level
import MA from "./pages/MA";
import PKL from "./pages/PKL";

// MA Subpages
import MA_Abrechnung from "./pages/MA/abrechnung";
import MA_Aufmass from "./pages/MA/aufmass";
import MA_Fahrtenberichte from "./pages/MA/fahrtenberichte";
import MA_Zeitenberichte from "./pages/MA/zeitenberichte";

// PKL Subpages
import PKL_Abrechnung from "./pages/PKL/abrechnung";
import PKL_Aufmass from "./pages/PKL/aufmass";
import PKL_Fahrtenberichte from "./pages/PKL/fahrtenberichte";
import PKL_Zeitenberichte from "./pages/PKL/zeitenberichte";

const router = createBrowserRouter(
  [
    { path: "/login", element: <Login /> },
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },

        // MA
        { path: "ma", element: <MA /> },
        { path: "ma/abrechnung", element: <MA_Abrechnung /> },
        { path: "ma/aufmass", element: <MA_Aufmass /> },
        { path: "ma/fahrtenberichte", element: <MA_Fahrtenberichte /> },
        { path: "ma/zeitenberichte", element: <MA_Zeitenberichte /> },

        // PKL
        { path: "pkl", element: <PKL /> },
        { path: "pkl/abrechnung", element: <PKL_Abrechnung /> },
        { path: "pkl/aufmass", element: <PKL_Aufmass /> },
        { path: "pkl/fahrtenberichte", element: <PKL_Fahrtenberichte /> },
        { path: "pkl/zeitenberichte", element: <PKL_Zeitenberichte /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
