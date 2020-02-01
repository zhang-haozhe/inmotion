//import setAuthToken from "utils/setAuthToken";

//Login User
const login = async function(email, password) {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const body = JSON.stringify({ email, password });
  // console.log(body)
  try {
    var token = "";
    const res = await axios
      .post("http://localhost:8080/api/auth", body, config)
      .then(response => {
        // console.log(response);
        // console.log(response.data.token);
        token = response.data.token;
      });
    //debugger;
    //localStorage.setItem("token", token);
    //console.log(localStorage.getItem("token"));
    document.cookie = `token=${token}`;
    console.log(document.cookie.substring(6)); //this is the token

    // dispatch({
    //   //   type: LOGIN_SUCCESS,
    //   payload: res.data
    // });

    //dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;
    console.log(errors);

    // if (errors) {
    //   errors.forEach(error => dispatch(setAlert(error.msg, "danger")));
    // }

    // dispatch({
    //   //   type: LOGIN_FAIL
    // });
  }
};

//Register User
const register = async function(name, email, password) {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const body = JSON.stringify({ name, email, password });

  try {
    var token = "";
    const res = await axios
      .post("http://localhost:8080/api/users", body, config)
      .then(response => {
        console.log(response);
        token = response.data.token;
      });
    document.cookie = `token=${token}`;

    // dispatch({
    //   type: REGISTER_SUCCESS,
    //   payload: res.data
    // });

    //dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;

    if (errors) {
      //errors.forEach(error => dispatch(setAlert(error.msg, "danger")));
      errors.forEach(error => console.log(error));
    }

    // dispatch({
    //   type: REGISTER_FAIL
    // });
  }
};
