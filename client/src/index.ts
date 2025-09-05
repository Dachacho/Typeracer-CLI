import axios from "axios";

async function getText() {
  const response = await axios.get("http://localhost:3000/text");
  console.log(response.data);
}

getText();
