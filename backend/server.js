const fs = require("fs");
const fastcsv = require("fast-csv");
const csv = require("csv-parser");

const {
    validatePhone,
    validatePayment,
    validateDate
} = require("./validator");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/outputs", express.static("outputs"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

app.get("/", (req, res) => {
    res.send("Transaction Validator Backend Running");
});

app.post("/upload", upload.single("file"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    const results = [];
    const orderIds = new Set();

fs.createReadStream(req.file.path)
.pipe(csv())
.on("data", (row) => {

    let errors = [];
    if (orderIds.has(row.order_id)) {
    errors.push("Duplicate Order ID");
} else {
    orderIds.add(row.order_id);
}

    if (
        !validatePhone(
            row.phone,
            row.country
        )
    ) {
        errors.push("Invalid Phone");
    }

    if (
        !validatePayment(
            row.payment_mode
        )
    ) {
        errors.push("Invalid Payment Mode");
    }
    if (
    !validateDate(
        row.date
    )
) {
    errors.push("Invalid Date");
}

    results.push({
        row,
        errors
    });

})
.on("end", () => {

    const validRows =
        results.filter(
            r => r.errors.length === 0
        );

    const invalidRows =
        results.filter(
            r => r.errors.length > 0
        );
       const cleanedData =
    validRows.map(v => v.row);
const chunkSize = 2;

for (
    let i = 0;
    i < cleanedData.length;
    i += chunkSize
) {

    const chunk =
        cleanedData.slice(
            i,
            i + chunkSize
        );

    const chunkFilePath =
        `outputs/chunks/chunk_${Math.floor(i / chunkSize) + 1}.csv`;

    const chunkWs =
        fs.createWriteStream(
            chunkFilePath
        );

    fastcsv
        .write(chunk, {
            headers: true
        })
        .pipe(chunkWs);
}
    const errorData =
    invalidRows.map(item => ({
        order_id: item.row.order_id,
        phone: item.row.phone,
        country: item.row.country,
        payment_mode: item.row.payment_mode,
        date: item.row.date,
        errors: item.errors.join(", ")
    }));

const cleanedFilePath =
    "outputs/cleaned_transactions.csv";

const ws =
    fs.createWriteStream(
        cleanedFilePath
    );

fastcsv
    .write(cleanedData, {
        headers: true
    })
    .pipe(ws);  
    const errorFilePath =
    "outputs/validation_report.csv";

const errorWs =
    fs.createWriteStream(
        errorFilePath
    );

fastcsv
    .write(errorData, {
        headers: true
    })
    .pipe(errorWs);  
    const totalChunks =
    Math.ceil(
        cleanedData.length /
        chunkSize
    );


   res.json({
    totalRecords: results.length,
    validRecords: validRows.length,
    invalidRecords: invalidRows.length,
    invalidRows,

    cleanedFile:
        "http://localhost:5000/outputs/cleaned_transactions.csv",

    errorFile:
        "http://localhost:5000/outputs/validation_report.csv",

    totalChunks
});

});

});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});