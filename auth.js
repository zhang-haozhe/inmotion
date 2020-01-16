import axios from "axios";
import setAuthToken from "../utils/setAuthToken";

//Login User
const login = () => {
  let elements = documents.getElementById("myForm").elements;

  axios.post("http://localhost:8080/user", { a: 1 })
}