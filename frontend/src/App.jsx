import { useState } from "react";
import axios from "axios";

function App() {

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [cleanedFile, setCleanedFile] = useState("");
  const [totalChunks, setTotalChunks] = useState(0);
const [errorFile, setErrorFile] = useState("");
  const uploadFile = async () => {

    if (!file) {
      alert("Select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await axios.post(
        "https://transaction-validator-z2lg.onrender.com/upload",
        formData
      );

      setMessage(`
Total Records: ${response.data.totalRecords}

Valid Records: ${response.data.validRecords}

Invalid Records: ${response.data.invalidRecords}
`);
setCleanedFile(response.data.cleanedFile);
setErrorFile(response.data.errorFile);
setTotalChunks(response.data.totalChunks);

    } catch (error) {
  console.error(error);

  if (error.response) {
    setMessage(
      JSON.stringify(error.response.data, null, 2)
    );
  } else {
    setMessage(error.message);
  }
}

  };

 return (
  <div style={{ padding: "40px" }}>
    <h1>Transaction Validator</h1>

    <input
      type="file"
      accept=".csv"
      onChange={(e) => setFile(e.target.files[0])}
    />

    <br /><br />

    <button onClick={uploadFile}>
      Upload CSV
    </button>

    <p>{message}</p>

    {cleanedFile && (
      <div>
        <a
          href={cleanedFile}
          target="_blank"
          rel="noreferrer"
        >
          Download Cleaned CSV
        </a>
      </div>
    )}

    {errorFile && (
      <div>
        <a
          href={errorFile}
          target="_blank"
          rel="noreferrer"
        >
          Download Validation Report
        </a>
      </div>
    )}

    {totalChunks > 1 && (
      <p>
        CSV split into {totalChunks} chunks
      </p>
    )}

  </div>
);
}

export default App;