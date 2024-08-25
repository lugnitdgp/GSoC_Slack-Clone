import { useContext } from "react";
import { Allconvers } from "../context api/context";
import ProfileCSS from "./profile.module.css";
import { ImCross } from "react-icons/im";

export default function Profile() {
  const { currentUser, profile, setprofile } = useContext(Allconvers);
  return (
    <>
      {profile ? (
        <div className={ProfileCSS.whole}>
          <div className={ProfileCSS.box}>
            <div className={ProfileCSS.top}>
              <ImCross
                style={{ marginRight: "10px", cursor: "pointer" }}
                onClick={() => {
                  setprofile(false);
                }}
              />
            </div>
            <div className={ProfileCSS.bottom}>
              <div className={ProfileCSS.left}>
                <img
                  src={currentUser[0].avatar_url}
                  alt=""
                  className={ProfileCSS.img}
                />
              </div>
              <div className={ProfileCSS.right}>
                <p className={ProfileCSS.p}>
                  <b>ID:</b> {currentUser[0].id}
                </p>
                <p className={ProfileCSS.p}>
                  <b>Name:</b> {currentUser[0].username}
                </p>
                <p className={ProfileCSS.p}>
                  <b>Email:</b> {currentUser[0].email}
                </p>
                <p className={ProfileCSS.p}>
                  <b>Phone:</b> {currentUser[0].phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={ProfileCSS.noProfile}>
          <p>No profile information available.</p>
        </div>
      )}
    </>
  );
}
