import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { CircularProgress, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import { addToFirestore } from '../services/firestore';
import { Data } from '../static/types';

interface AddRecordModalProps {
    open: number;
    onClose: Function;
    setData: Function;
}

interface RecordObject {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    address: string;
    mobile: string;
}

interface ActionObject {
    type: string;
    payload?: Partial<RecordObject>;
}

export default function AddRecordModal({ open, onClose, setData }: AddRecordModalProps) {

    const newRecordInitialState: RecordObject = {
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        address: "",
        mobile: ""
    }

    const reducer = (state: RecordObject, action: ActionObject): RecordObject => {
        switch (action.type) {
            case "RESET":
                return newRecordInitialState;
            case "TEXT":
                return {
                    ...state,
                    ...action.payload
                }
            case "MOBILE":
                return {
                    ...state,
                    ...action.payload
                }
            default:
                return state;
        }
    };

    const [newRecord, dispatch] = React.useReducer(reducer, newRecordInitialState);
    const [error, setError] = React.useState<string | null>(null); // State for handling errors
    const [loading, setLoading] = React.useState<boolean>(false); // State for loading indication

    const handleClose = () => {
        setError(null);
        setLoading(false)
        dispatch({ type: "RESET" })
        onClose();
    };

    const handleAddRecord = async () => {

        if (loading) {
            return false;
        }

        setLoading(true);

        // Validate fields
        const nameRegex = /^[a-zA-Z\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;

        if (
            !nameRegex.test(newRecord.firstName.trim()) ||
            !nameRegex.test(newRecord.lastName.trim()) ||
            !emailRegex.test(newRecord.email.trim()) ||
            !phoneRegex.test(newRecord.mobile.trim())
        ) {
            setError("Invalid input in one or more fields");
            setLoading(false);
            return;
        }

        // Check that no other field is empty
        if (
            newRecord.firstName.trim() === "" ||
            newRecord.lastName.trim() === "" ||
            newRecord.email.trim() === "" ||
            newRecord.mobile.trim() === "" ||
            newRecord.gender.trim() === "" ||
            newRecord.address.trim() === ""
        ) {
            setError("All fields must be filled");
            setLoading(false);
            return;
        }

        const id = await addToFirestore(newRecord);
        if (id) {
            const uploadedData = {
                ...newRecord,
                name: `${newRecord.firstName} ${newRecord.lastName}`,
                id: id
            }
            setData((prev: Data[]) => [...prev, uploadedData])


            console.log("your file is Upload");
        } else {
            console.log("your Data is not saved");
        }
        setLoading(false)
    };

    return (
        <Modal
            open={open === 1}
            onClose={handleClose}
            aria-labelledby="add-record-modal"
            aria-describedby="adds New record in the database"
        >
            <Box className={"modal add-dialog"}>
                <Typography id="modal-modal-title" variant="h4" component="h2" align="center">
                    Add New Record
                </Typography>

                {/* Render error message */}
                {error && (
                    <Typography color="error" variant="body2" align="center">
                        {error}
                    </Typography>
                )}

                <Box mt={2} display="flex" flexDirection={"column"} gap={1}>
                    <TextField
                        size="small"
                        fullWidth
                        label="First Name"
                        value={newRecord.firstName}
                        onChange={(e) => dispatch({ type: "TEXT", payload: { firstName: e.target.value } })}
                    />

                    <TextField
                        size="small"
                        fullWidth
                        label="Last Name"
                        value={newRecord.lastName}
                        onChange={(e) => dispatch({ type: "TEXT", payload: { lastName: e.target.value } })}
                    />

                    <TextField
                        size="small"
                        fullWidth
                        label="Email"
                        value={newRecord.email}
                        onChange={(e) => dispatch({ type: "TEXT", payload: { email: e.target.value } })}
                    />

                    <TextField
                        size="small"
                        fullWidth
                        label="mobile"
                        value={newRecord.mobile}
                        onChange={(e) => dispatch({ type: "MOBILE", payload: { mobile: e.target.value } })}
                    />

                    <FormControl>
                        <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-radio-buttons-group-label"
                            defaultValue=""
                            name="radio-buttons-group"
                            value={newRecord.gender}
                            onChange={(e) => dispatch({ type: "TEXT", payload: { gender: e.target.value } })}
                        >
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        multiline
                        fullWidth
                        size="small"
                        label="Address"
                        minRows={2}
                        maxRows={4}
                        value={newRecord.address}
                        onChange={(e) => dispatch({ type: "TEXT", payload: { address: e.target.value } })}
                    />
                </Box>

                <Stack mt={2} direction="row" justifyContent="space-between">
                    <Button onClick={handleClose} variant="outlined" color="error">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={loading}
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
                        Add{loading && "ing..."}
                    </Button>
                </Stack>
            </Box>
        </Modal >
    );
}
