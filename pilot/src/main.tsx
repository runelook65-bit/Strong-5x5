import * as React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import "./index.css"

const element = document.getElementById("root")
if (!element) throw new Error("ARM pilot root element was not found")

createRoot(element).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
