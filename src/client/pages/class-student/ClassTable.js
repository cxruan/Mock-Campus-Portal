import React from 'react';
import PropTypes from 'prop-types';
import { withSnackbar } from 'notistack';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress
} from '@material-ui/core/';
import { lighten, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import ClassEditRow from './ClassEditRow';
import * as utils from '../../utils';

function CustomedTableHead({ headRows, order, orderBy, onRequestSort, emptyCellsNum }) {
  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />
        {headRows.map(row => (
          <TableCell
            key={row.id}
            align={row.id !== 'name' ? 'center' : 'left'}
            padding={row.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === row.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === row.id}
              direction={order}
              onClick={createSortHandler(row.id)}
            >
              {row.label}
            </TableSortLabel>
          </TableCell>
        ))}
        {emptyCellsNum !== 0 && <TableCell padding="checkbox" colSpan={emptyCellsNum} />}
      </TableRow>
    </TableHead>
  );
}

CustomedTableHead.propTypes = {
  headRows: PropTypes.array.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  emptyCellsNum: PropTypes.number.isRequired
};

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1)
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85)
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark
        },
  spacer: {
    flex: '1 1 100%'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: '0 0 auto'
  }
}));

const CustomedTableToolbar = props => {
  const { handleAddClass, disabled } = props;
  const classes = useToolbarStyles();

  return (
    <Toolbar className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6" id="tableTitle">
          班级管理
        </Typography>
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <Tooltip title="添加班级">
          <div>
            <IconButton aria-label="添加班级" onClick={handleAddClass} disabled={disabled}>
              <AddIcon />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

CustomedTableToolbar.propTypes = {
  handleAddClass: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3)
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  table: {
    position: 'relative'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  progress: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto auto'
  }
}));

const editingStyles = makeStyles(() => ({
  grayout: {
    transition: 'all 300ms ease 0s',
    opacity: 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

function ClassTable({ isLoading, setIsLoading, handleFetchFailure, enqueueSnackbar }) {
  const classes = useStyles();
  const editingClasses = editingStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [page, setPage] = React.useState(0);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editRowID, setEditRowId] = React.useState(-1);
  const initValues = {
    name: ''
  };
  const [newValues, setNewValues] = React.useState(initValues);
  const [data, setData] = React.useState({ classes: [] });

  React.useEffect(() => {
    if (!isLoading) {
      axios
        .get('/api/classes')
        .then(res => setData(res.data))
        .catch(handleFetchFailure);
    }
  }, [isLoading]);

  const rowsPerPage = 5;
  const headRows = [
    { id: 'name', numeric: false, disablePadding: true, label: '班级名称' },
    { id: 'id', numeric: true, disablePadding: false, label: 'ID' }
  ];
  const rows = data.classes;
  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage) - (isAdding ? 1 : 0);

  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  function handleAddClass() {
    setIsAdding(true);
  }

  async function handleConfirmAddClass() {
    if (!newValues.name) {
      enqueueSnackbar('请输入完整信息', {
        variant: 'warning'
      });
      return;
    }
    setIsAdding(false);
    setIsLoading(true);
    await axios
      .post('/api/classes', newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setNewValues(initValues);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelAddClass() {
    setIsAdding(false);
    setNewValues(initValues);
  }

  function handleEditClass(row) {
    setEditRowId(row.id);
    setIsEditing(true);
    setNewValues({
      name: row.name
    });
  }

  async function handleConfirmEditClass(row) {
    setIsEditing(false);
    if (row.name === newValues.name) {
      return;
    }
    setIsLoading(true);
    await axios
      .put(`/api/classes/${editRowID}`, newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    setNewValues(initValues);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelEditClass() {
    setIsEditing(false);
    setEditRowId(-1);
    setNewValues(initValues);
  }

  function getDeleteItemList(class_) {
    const requestList = [];
    data.students.forEach(student => {
      if (student.class_id === class_.id) {
        requestList.push(axios.delete(`/api/students/${student.id}`));
        if (student.avatar_url !== '') {
          requestList.push(axios.delete('/api/uploads/' + student.avatar_url.match(/[^/]*$/g)[0]));
        }
      }
    });
    requestList.push(axios.delete(`/api/classes/${class_.id}`));
    return requestList;
  }

  function handleDeleteClass(row) {
    setIsDeleting(true);
    setEditRowId(row.id);
  }

  async function handleConfirmDeleteClass(row) {
    setIsDeleting(false);
    setIsLoading(true);
    await axios
      .all(getDeleteItemList(row))
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelDeleteClass() {
    setIsDeleting(false);
    setEditRowId(-1);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <CustomedTableToolbar disabled={isEditing || isDeleting} handleAddClass={handleAddClass} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <CustomedTableHead
              headRows={headRows}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              emptyCellsNum={2}
            />
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell padding="none" style={{ borderBottom: 0 }}>
                    <CircularProgress className={classes.progress} />
                  </TableCell>
                </TableRow>
              )}
              {utils
                .stableSort(rows, utils.getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const grayOut =
                    isLoading || isAdding || ((isEditing || isDeleting) && row.id !== editRowID);
                  if (isEditing && row.id === editRowID) {
                    return (
                      <ClassEditRow
                        key={-1}
                        rowId={row.id}
                        newValues={newValues}
                        setNewValues={setNewValues}
                        handleConfirmAction={() => handleConfirmEditClass(row)}
                        handleCancelAction={handleCancelEditClass}
                      />
                    );
                  }
                  if (isDeleting && row.id === editRowID) {
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="right" padding="default" colSpan={3}>
                          确认要删除该班级及其学生?
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="确认">
                            <IconButton onClick={() => handleConfirmDeleteClass(row)}>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="取消">
                            <IconButton onClick={handleCancelDeleteClass}>
                              <ClearIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow
                      hover={!isAdding}
                      tabIndex={-1}
                      key={row.id}
                      className={grayOut ? editingClasses.grayout : ''}
                    >
                      <TableCell padding="checkbox" />
                      <TableCell component="th" id={index} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="编辑班级">
                          <div>
                            <IconButton onClick={() => handleEditClass(row)} disabled={grayOut}>
                              <EditIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="删除班级">
                          <div>
                            <IconButton onClick={() => handleDeleteClass(row)} disabled={grayOut}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {isAdding && (
                <ClassEditRow
                  rowId={0}
                  newValues={newValues}
                  setNewValues={setNewValues}
                  handleConfirmAction={handleConfirmAddClass}
                  handleCancelAction={handleCancelAddClass}
                />
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page'
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page'
          }}
          onChangePage={handleChangePage}
          ActionsComponent={utils.TablePaginationActions}
        />
      </Paper>
    </div>
  );
}

ClassTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(ClassTable);
