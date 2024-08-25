import { useContext } from "react";
import loaderCSS from "./loader.module.css";
export default function Loader() {
  return (
    <div className={loaderCSS.whole}>
      <div className={loaderCSS.body}></div>
    </div>
  );
}
