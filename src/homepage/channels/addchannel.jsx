import { useContext, useEffect } from "react";
import { Allconvers } from "../../context api/context";
import AddchannnelCSS from "./addchannel.module.css";
const Addchannel = () => {
  const { addchannel, setAddchannel } = useContext(Allconvers);
  useEffect(() => {
    console.log(addchannel);
  }, [addchannel]);
  if (addchannel) {
    return (
      <div className={AddchannnelCSS.body}>
        <div className={AddchannnelCSS.box}>
          <div className={AddchannnelCSS.h1}>
            <h1>Add Channel</h1>
          </div>
          <div className={AddchannnelCSS.inputbox}>
            <input type="text" placeholder="Enter the Channel Name" className={AddchannnelCSS.input} />
          </div>
          <div className={AddchannnelCSS.bottom}>
            <div className={AddchannnelCSS.cancel}>Clear</div>
            <div className={AddchannnelCSS.submit}>Create</div>
          </div>
        </div>
      </div>
    );
  }
};

export default Addchannel;
