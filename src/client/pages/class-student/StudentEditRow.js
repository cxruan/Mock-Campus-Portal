import React from 'react';
import PropTypes from 'prop-types';
import {
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  Avatar
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

const editRowStyles = makeStyles(() => ({
  input: {
    width: '60%'
  },
  select: {
    minWidth: '60px'
  },
  avatar: {
    width: 40,
    height: 40
  }
}));

export default function StudentEditRow({
  newValues,
  setNewValues,
  rowId,
  classList,
  handleConfirmAction,
  handleCancelAction
}) {
  const classes = editRowStyles();

  function handleUploadChange(event) {
    const newUrl = URL.createObjectURL(event.target.files[0]);
    setNewValues(oldValues => ({
      ...oldValues,
      avatar_url: newUrl
    }));
  }

  function handleEditChange(event) {
    const { name, value } = event.target;
    setNewValues(oldValues => ({
      ...oldValues,
      [name]: value
    }));
  }

  return (
    <TableRow>
      <TableCell padding="checkbox">
        <label htmlFor="avatar-file">
          <input
            hidden
            accept="image/*"
            id="avatar-file"
            type="file"
            onChange={handleUploadChange}
          />
          <IconButton component="span">
            {newValues.avatar_url ? (
              <Avatar alt="img" className={classes.avatar} src={newValues.avatar_url} />
            ) : (
              <Avatar alt="img" className={classes.avatar}>
                {newValues.name[0]}
              </Avatar>
            )}
          </IconButton>
        </label>
      </TableCell>
      <TableCell component="th" scope="row" align="center">
        <TextField
          placeholder="姓名"
          className={classes.input}
          inputProps={{
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
          className={classes.input}
          inputProps={{
            'aria-label': 'Description'
          }}
          value={rowId || ''}
          name="id"
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          placeholder="年龄"
          className={classes.input}
          type="number"
          inputProps={{
            'aria-label': 'Description'
          }}
          value={newValues.age}
          name="age"
          onChange={handleEditChange}
        />
      </TableCell>
      <TableCell align="center">
        <Select
          className={classes.select}
          value={newValues.class_id}
          name="class_id"
          onChange={handleEditChange}
        >
          <MenuItem value="" disabled>
            所属班级
          </MenuItem>
          {classList.map(class_ => (
            <MenuItem key={class_.id} value={class_.id}>
              {class_.name}
            </MenuItem>
          ))}
        </Select>
      </TableCell>
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

StudentEditRow.propTypes = {
  newValues: PropTypes.object.isRequired,
  setNewValues: PropTypes.func.isRequired,
  handleConfirmAction: PropTypes.func.isRequired,
  handleCancelAction: PropTypes.func.isRequired,
  rowId: PropTypes.number.isRequired,
  classList: PropTypes.array.isRequired
};
