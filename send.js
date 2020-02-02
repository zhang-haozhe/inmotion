//Send image
const sendImg = async function(asset) {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  const body = JSON.stringify(asset);
  // console.log(body)
  try {
    const res = await axios
      .post("http://localhost:8080/api/img", body, config)
      .then(response => {
        console.log(response);
        // console.log(response.data.token);
      });
    //debugger;
    //localStorage.setItem("token", token);
    //console.log(localStorage.getItem("token"));

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
