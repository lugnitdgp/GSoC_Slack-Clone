import supabase from "../../supabase.jsx";
import { useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import updateuserCSS from "./updateuser.module.css";

function Update(data, settoken) {
  let navigate = useNavigate();
  const usernameRef = useRef("");
  const phoneRef = useRef("");
  console.log(data.data.user.user_metadata.username);
  if (data.data.user.user_metadata.username) {
    navigate("/");
  } else {
    async function update(e) {
      e.preventDefault();
      const username = usernameRef.current.value; //used useRef because spreading and updating the data didn't work using usestate//

      const phone = phoneRef.current.value;

      if (username.trim() === "") {
        alert("Please enter a username."); //.trim is used to remove the blank spaces before the text is entered//
        return;
      }

      if (phone.trim() === "") {
        alert("Please enter a phone number.");
        return;
      }

      if (username) {
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: { username: username, phone: phone },
          });
          if (data) {
            alert("update succesful");
            console.log(data.user);
            navigate("/");
            settoken(data);
            console.log(data.user);
          } else {
            console.log(error);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        }
      } else {
        alert("Enter the Username");
      }
    }
    return (
      <div className={updateuserCSS.body}>
        <form onSubmit={update} className={updateuserCSS.form}>
          <div className={updateuserCSS.head}>
            <h1>Update User</h1>
          </div>
          <div className={updateuserCSS.inputout}>
            <span>
              <FaUserAlt />
            </span>
            <input
              type="text"
              placeholder="Display Name"
              ref={usernameRef}
              className={updateuserCSS.input}
            />
          </div>
          <div className={updateuserCSS.inputout}>
            <span>
              <FaPhoneAlt />
            </span>
            <input
              type="tel"
              placeholder="Ph No."
              pattern="[0-9]{10}"
              className={updateuserCSS.input}
              ref={phoneRef}
            />
          </div>
          <button type="submit" className={updateuserCSS.enter}>
            Login
          </button>
        </form>
      </div>
    );
  }
}
export default Update;
