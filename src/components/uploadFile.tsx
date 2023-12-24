import React, { useState } from 'react';

import {
    CircularProgress,
    Modal,
    Stack,
    TextField,
    Box,
    Button,
    Typography
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Workbook } from 'exceljs';
import { addToFirestore } from '../services/firestore';
import { Data } from '../static/types';

interface UploadFileModalProps {
    open: number;
    onClose: Function;
    setData: Function;
}

interface RowData {
    [key: string]: any;
}

export default function UploadFileModal(props: UploadFileModalProps) {

    const { open, onClose, setData } = props;

    const [selectedFile, setSelectedFile] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false); // State for loading indication

    const handleClose = () => {
        setSelectedFile(null)
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target?.files?.[0];
        if (file?.name) {
            setSelectedFile(file);
        }
    }

    const parseData = (data: any) => {
        // This key map for matching incoming data according corresponding key
        const keyMap: RowData = {
            firstname: "firstName",
            lastname: "lastName",
            email: "email",
            gender: "gender",
            address: "address",
            phone: "mobile"
        }

        // Set the Default Values to empty so the cant be undefined anymore
        const defaultValues = {
            firstName: "",
            lastName: "",
            email: "",
            gender: "",
            address: "",
            mobile: "",
        }

        // Generate the Payload that saved in the firestore
        const payloadData = data.map((x: any) => {
            const newData: RowData = { ...defaultValues };

            for (const [key, value] of Object.entries(x)) {
                // Check whether the key is main key or not
                // Keys like "first name" | "FirstName" | "first_name" will be transformed in "firstName" (value of keyMap)

                let newKey: string = key.toLowerCase().replace(/[^a-zA-Z]/g, '');
                newKey = keyMap[newKey] || key

                // add key to the payload Object
                newData[newKey] = value
            }

            return newData;
        })

        return payloadData
    }

    const handleAddRecord = async () => {

        if (loading || !selectedFile) {
            return false
        }

        const reader = new FileReader();

        reader.onload = async (event) => {

            setLoading(true);

            const result = event.target?.result;

            if (result) {
                let buffer: ArrayBuffer;
                if (typeof result === 'string') {
                    // Convert binary string to ArrayBuffer
                    const binaryString = atob(result);
                    const length = binaryString.length;
                    buffer = new ArrayBuffer(length);
                    const view = new Uint8Array(buffer);
                    for (let i = 0; i < length; i++) {
                        view[i] = binaryString.charCodeAt(i);
                    }
                } else {
                    buffer = result;
                }

                try {
                    const workbook = new Workbook();
                    await workbook.xlsx.load(buffer);

                    const sheet = workbook.getWorksheet(1);
                    const jsonData: RowData[] = [];

                    if (sheet) {
                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber !== 1) {
                                // Assuming the first row is headers
                                const rowData: RowData = {};

                                row.eachCell((cell, colNumber) => {
                                    const headerCell = sheet.getRow(1).getCell(colNumber);
                                    const header = headerCell.text;
                                    if (header && typeof header === 'string') {

                                        const cellText = cell.text

                                        if (typeof cellText === 'string') {
                                            rowData[header] = cellText;
                                        } else {
                                            rowData[header] = "";
                                        }
                                    }
                                });

                                jsonData.push(rowData);
                            }
                        });
                    }
                    // Parse the table data into payload format
                    const parsedData = parseData(jsonData);

                    parsedData.forEach(async (data: RowData) => {
                        const id = await addToFirestore(data);
                        if (id) {
                            const uploadedData = {
                                ...data,
                                name: `${data.firstName} ${data.lastName}`,
                                id: id
                            }
                            setData((prev: Data[]) => [...prev, uploadedData])

                            console.log("your file is Upload");
                        } else {
                            console.log("your Data is not saved");
                        }
                    });

                } catch (err) {
                    console.log("Error:", err);
                    alert(err);
                }

                setLoading(false);
                handleClose();
            }

        }

        reader.readAsArrayBuffer(selectedFile);
    }

    return (
        <Modal
            open={open === 2}
            onClose={handleClose}
            aria-labelledby="add-record-modal"
            aria-describedby="adds New record in the database"
        >
            <Box className={"modal add-dialog"}>
                <Typography id="modal-modal-title" variant="h4" component="h2" align="center">
                    Upload Excel File
                </Typography>

                <label className="file-input-button">
                    <UploadFileIcon fontSize={"large"} />
                    <h1>
                        {
                            selectedFile ? selectedFile?.name : "Upload File Here"
                        }
                    </h1>
                    <input accept=".xlsx, .xls" onChange={handleFileChange} style={{ display: "none" }} type="file" />
                </label>

                <Stack mt={2} direction="row" justifyContent="space-between">
                    <Button onClick={handleClose} variant="outlined" color="error">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={loading || selectedFile === null}
                        onClick={handleAddRecord}
                        startIcon={
                            loading && (
                                <CircularProgress
                                    size={20}
                                    color="inherit"
                                    variant="indeterminate"
                                />
                            )
                        }
                    >
                        Upload{loading && "ing..."}
                    </Button>
                </Stack>
            </Box>
        </Modal >
    );
}
