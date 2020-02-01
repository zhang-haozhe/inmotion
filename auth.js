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
    const res = await axios
      .post("http://localhost:8080/api/auth", body, config)
      .then(response => {
        console.log(body);
        console.log(response);
      });

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
const register = async function (name, email, password) {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post("http://localhost:8080/api/users", body, config).then(response=>{console.log(body);
    console.log(response)});

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
