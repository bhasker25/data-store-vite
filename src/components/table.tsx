import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    TextField,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Toolbar,
    Paper
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import AddRecordModal from './addRecord';
import { db } from '../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import UploadFileModal from './uploadFile';

interface Data {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    address: string;
    mobile: string;
    name: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
    disablePadding: boolean;
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'id',
        numeric: false,
        disablePadding: false,
        label: 'Id',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Name',
    },
    {
        id: 'email',
        numeric: false,
        disablePadding: false,
        label: 'Email',
    },
    {
        id: 'gender',
        numeric: false,
        disablePadding: false,
        label: 'Gender',
    },
    {
        id: 'address',
        numeric: false,
        disablePadding: false,
        label: 'Address',
    },
    {
        id: 'mobile',
        numeric: false,
        disablePadding: false,
        label: 'Mobile',
    },
];

interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface TableToolbarProps {
    numSelected: number;
    toggleOpenModal: Function;
    setSearchQuery: (newVal: string) => void;
}


function TableToolBar(props: TableToolbarProps) {
    const { numSelected, toggleOpenModal, setSearchQuery } = props;

    const queryRef = useRef<HTMLInputElement>(null)

    const handleSearch = () => {
        const query = queryRef?.current?.value;
        if (typeof query === "string") {
            setSearchQuery(query);
        }

    }

    return (
        <Toolbar sx={{ flexWrap: "wrap" }}>
            <Box sx={{ flexGrow: 1 }}>
                <TextField inputRef={queryRef} size="small" />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    sx={{
                        ml: 1,
                        py: 1,
                        px: 2
                    }}
                >
                    Search
                </Button>
            </Box>


            <Button
                variant="contained"
                onClick={() => toggleOpenModal(1)}
                sx={{
                    py: 1,
                    px: 2
                }}
            >
                Add New Record
            </Button>

            <Button
                variant="contained"
                onClick={() => toggleOpenModal(2)}
                sx={{
                    py: 1,
                    px: 2,
                    ml: 1,
                }}
            >
                Upload Excel file
            </Button>
        </Toolbar>
    )
}

type ModalState = 0 | 1 | 2;

export default function DataTable() {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('firstName');
    const [data, setData] = useState<Data[]>([]);
    const [openModal, setOpenModal] = useState<ModalState>(0);
    const [searchQuery, setSearchQuery] = useState<string>("")

    const handleOpenModal = (num: number = 0) => {
        if ([0, 1, 2].includes(num)) {
            setOpenModal(num as ModalState);
        }
    }

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const fetchPost = async () => {
        await getDocs(collection(db, "data-store"))
            .then((querySnapshot) => {
                const newData = querySnapshot.docs.map((doc) => {
                    const docData = doc.data()
                    return {
                        ...docData,
                        name: `${docData.firstName} ${docData.lastName}`,
                        id: doc.id
                    }
                });
                console.log("New Data => ", newData);
                setData(newData as Data[])
            })
    }

    let filteredData = [...data];

    if (searchQuery) {
        filteredData = data.filter(x => {
            const name = x.name.toLowerCase().trim()
            const query = searchQuery.toLowerCase().trim();
            return name.startsWith(query);
        });
    }



    useEffect(() => {
        fetchPost().then()
    }, [])

    return (
        <Box>
            <Paper >
                <TableToolBar
                    setSearchQuery={setSearchQuery}
                    numSelected={0}
                    toggleOpenModal={handleOpenModal}
                />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="Data Table"
                    >
                        <EnhancedTableHead
                            numSelected={0}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={filteredData.length}
                        />
                        <TableBody>
                            {filteredData?.map((row, index) => {
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.id}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                        >
                                            {row.id}
                                        </TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.gender}</TableCell>
                                        <TableCell>{row.address}</TableCell>
                                        <TableCell>{row.mobile}</TableCell>
                                    </TableRow>
                                );
                            })}

                            <TableRow>
                                <TableCell colSpan={6} />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <AddRecordModal setData={setData} open={openModal} onClose={() => setOpenModal(0)} />
            <UploadFileModal setData={setData} open={openModal} onClose={() => setOpenModal(0)} />
        </Box>
    );
}
