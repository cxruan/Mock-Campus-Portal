import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableCell, TextField, IconButton, Tooltip } from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

const editRowStyles = makeStyles(() => ({
  input: {
    width: '100%'
  },
  id: {
    width: '20%'
  }
}));

export default function BookEditRow({
  rowId,
  newValues,
  setNewValues,
  handleConfirmAction,
  handleCancelAction
}) {
  const classes = editRowStyles();

  function handleEditChange(event) {
    const { name, value } = event.target;
    setNewValues(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  return (
    <TableRow>
      <TableCell padding="checkbox" />
      <TableCell component="th" scope="row" padding="none">
        <TextField
          placeholder="书籍名称"
          className={classes.input}
          InputProps={{
            'aria-label': 'Description'
          }}
          value={newValues.name}
          name="name"
          onChange={handleEditChange}
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          disabled
          placeholder="ID"
          className={classes.id}
          InputProps={{
            'aria-label': 'Description'
          }}
          value={rowId || ''}
          name="id"
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          placeholder="库存"
          type="number"
          className={classes.id}
          InputProps={{
            'aria-label': 'Description',
            inputProps: { min: 0 }
          }}
          value={newValues.num_of_copies}
          name="num_of_copies"
          onChange={handleEditChange}
        />
      </TableCell>
      <TableCell colSpan={2} />
      <TableCell align="center" padding="checkbox">
        <Tooltip title="确认">
          <IconButton onClick={handleConfirmAction}>
            <CheckIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="center" padding="checkbox">
        <Tooltip title="取消">
          <IconButton onClick={handleCancelAction}>
            <ClearIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

BookEditRow.propTypes = {
  newValues: PropTypes.object.isRequired,
  setNewValues: PropTypes.func.isRequired,
  handleConfirmAction: PropTypes.func.isRequired,
  handleCancelAction: PropTypes.func.isRequired,
  rowId: PropTypes.number.isRequired
};
