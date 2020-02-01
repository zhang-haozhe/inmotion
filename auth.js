//import setAuthToken from "utils/setAuthToken";

//Login User
const login = async function (email, password) {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const body = JSON.stringify({ email, password });
  console.log(body)
  try {
    const res = await axios.post("http://localhost:8080/api/auth", body, config).then(response => {
      console.log(body)
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
