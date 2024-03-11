// src/components/DataGridComponent.tsx
import { useEffect, useState, useCallback } from 'react';
import { useDataGridWebSocket } from '../hooks/useDataGridWebSocket';

import { DataGrid, GridColDef, GridRowId, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';



const DataGridComponent = ({ wsUrl }: { wsUrl: string; }) => {
    const { rows, setRows, createRow, updateRow, deleteRow, readData } = useDataGridWebSocket(wsUrl);
    const [open, setOpen] = useState(false);
    const [newRowData, setNewRowData] = useState({ name: '', age: '', school: '' });

    // Read data on component mount
    useEffect(() => {
        readData();
    }, [readData]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleAdd = useCallback(() => {
        const newId = Math.max(0, ...rows.map(r => r.id)) + 1;
        const newRow = { ...newRowData, id: newId };
        setRows([...rows, newRow]); // Optimistically update the local state
        createRow(newRow); // Send the new row to the server for official addition
        handleClose();
    }, [createRow, handleClose, newRowData, rows, setRows]);

    const handleRowEditUpdate = useCallback((updatedRow, originalRow) => {
        updateRow(updatedRow);

        return updatedRow;
    }, [updateRow]);

    const handleDeleteClick = useCallback((id: GridRowId) => {
        // Optimistically update the local state to remove the row
        setRows(rows.filter(row => row.id !== id));
        // Send the delete operation to the server
        deleteRow(id);
    }, [deleteRow, rows, setRows]);



    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90, editable: false },
        { field: 'name', headerName: 'Name', width: 150, editable: true },
        { field: 'age', type: 'number', headerName: 'Age', width: 100, editable: true },
        { field: 'school', headerName: 'School', width: 150, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDeleteClick(params.id)}
                />,
            ],
        },
    ];



    return (
        <div style={{ height: 400, width: '100%' }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                Add Row
            </Button>

            <DataGrid
                columns={columns}
                rows={rows}
                checkboxSelection
                editMode='cell'
                processRowUpdate={handleRowEditUpdate}
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Row</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        variant="standard"
                        value={newRowData.name}
                        onChange={(e) => setNewRowData({ ...newRowData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Age"
                        fullWidth
                        variant="standard"
                        value={newRowData.age}
                        onChange={(e) => setNewRowData({ ...newRowData, age: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="School"
                        fullWidth
                        variant="standard"
                        value={newRowData.school}
                        onChange={(e) => setNewRowData({ ...newRowData, school: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAdd}>Add</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DataGridComponent;
