const fs = require('fs');


let data={
    "name": "Albert",
    "surname": "Xamzin",
    "organization": "Kibernetikada Innovatsiyalar IT-Parki MCHJ",
    "location": "Mirzo Ulug'bek Tumani",
    "state": "Toshkent Shahri",
    "country": "Uzbekistan",
    "uid": "575975561",
    "businessCategory": "Masʼuliyati Cheklangan Jamiyat",
    "serialNumber": "77ebb2ed",
    "validFrom": "2023-02-16 17:09:57",
    "validTo": "2025-02-16 23:59:59",
    "commonName": "Xamzin Albert Almazovich",
    "organizationFull": "Kibernetikada Innovatsiyalar IT-Parki MCHJ",
    "pinfl": "32808810170066",
    "position": "Директор",
    "tin": "308121587",
    "id": "543962cfb7f4aacfe660a229d20ef5ec"
}
// Function to read a JSON file and return its data
function readJSONFile(filename) {
    return data
}

// Export the readJSONFile function
module.exports = readJSONFile;
