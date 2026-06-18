function validatePhone(phone, country) {

    const rules = {
        India: 10,
        Singapore: 8
    };

    if (!rules[country]) {
        return false;
    }

    return (
        /^\d+$/.test(phone) &&
        phone.length === rules[country]
    );
}

function validatePayment(paymentMode) {

    const validModes = [
        "UPI",
        "Credit Card",
        "Debit Card",
        "Cash"
    ];

    return validModes.includes(paymentMode);
}

function validateDate(date) {

    const ddmmyyyy =
        /^\d{2}-\d{2}-\d{4}$/;

    const yyyymmdd =
        /^\d{4}-\d{2}-\d{2}$/;

    return (
        ddmmyyyy.test(date) ||
        yyyymmdd.test(date)
    );
}

module.exports = {
    validatePhone,
    validatePayment,
    validateDate
};