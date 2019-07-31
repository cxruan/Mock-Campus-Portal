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
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress
} from '@material-ui/core/';
import { lighten, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import StudentEditRow from './StudentEditRow';
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
    flex: '1 1 10%'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: '0 0 auto'
  },
  search_bar: {
    width: '249px',
    marginRight: '30px'
  }
}));

const CustomedTableToolbar = ({
  searchWords,
  setSearchWords,
  setPage,
  handleAddStudent,
  disabled
}) => {
  const classes = useToolbarStyles();

  function handleSearchChange(event) {
    setSearchWords(event.target.value);
    setPage(0);
  }

  function handleSearchClear() {
    setSearchWords('');
    setPage(0);
  }

  return (
    <Toolbar className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6" id="tableTitle">
          学生管理
        </Typography>
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <TextField
          value={searchWords}
          className={classes.search_bar}
          placeholder="Search"
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearchClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Tooltip title="添加学生">
          <IconButton aria-label="添加学生" onClick={handleAddStudent} disabled={disabled}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

CustomedTableToolbar.propTypes = {
  searchWords: PropTypes.string.isRequired,
  setSearchWords: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  handleAddStudent: PropTypes.func.isRequired,
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
  avatar: {
    width: 40,
    height: 40,
    marginLeft: 20
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

function StudentTable({ isLoading, setIsLoading, handleFetchFailure, enqueueSnackbar }) {
  const classes = useStyles();
  const editingClasses = editingStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchWords, setSearchWords] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editRowID, setEditRowId] = React.useState(-1);
  const initValues = {
    name: '',
    age: '',
    class_id: 0,
    avatar_url: ''
  };
  const [newValues, setNewValues] = React.useState(initValues);
  const [data, setData] = React.useState({ students: [], classes: [] });

  React.useEffect(() => {
    if (!isLoading) {
      axios
        .all([axios.get('/api/students'), axios.get('/api/classes')])
        .then(axios.spread((res1, res2) => setData({ ...res1.data, ...res2.data })))
        .catch(handleFetchFailure);
    }
  }, [isLoading]);

  const headRows = [
    { id: 'name', numeric: false, disablePadding: true, label: '姓名' },
    { id: 'id', numeric: true, disablePadding: false, label: 'ID' },
    { id: 'age', numeric: true, disablePadding: false, label: '年龄' },
    { id: 'class_name', numeric: false, disablePadding: false, label: '班级' }
  ];
  const rows = !searchWords
    ? data.students
    : data.students.filter(row => {
        let flag = false;
        Object.keys(row).forEach(key => {
          if (
            key !== 'class_id' &&
            key !== 'avatar_url' &&
            row[key]
              .toString()
              .toLowerCase()
              .includes(searchWords)
          ) {
            flag = true;
          }
        });
        return flag;
      });
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

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value);
  }

  function handleAddStudent() {
    setIsAdding(true);
  }

  async function handleConfirmAddStudent() {
    if (!newValues.name || !newValues.age || !newValues.class_id) {
      enqueueSnackbar('请输入完整信息', {
        variant: 'warning'
      });
      return;
    }
    if (newValues.avatar_url) {
      if (document.querySelector('#avatar-file').files[0].size > 512 * 1024) {
        enqueueSnackbar('上传头像大小限制为512Kb', {
          variant: 'warning'
        });
        return;
      }
    }
    setIsAdding(false);
    setIsLoading(true);
    // upload new avatar
    if (newValues.avatar_url !== '') {
      await uploadAvatar();
    }
    await axios
      .post('/api/students', newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setNewValues(initValues);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelAddStudent() {
    setIsAdding(false);
    setNewValues(initValues);
  }

  function handleEditStudent(row) {
    setEditRowId(row.id);
    setIsEditing(true);
    setNewValues({
      name: row.name,
      age: row.age,
      class_id: row.class_id,
      avatar_url: row.avatar_url
    });
  }

  async function handleConfirmEditStudent(row) {
    if (newValues.avatar_url !== row.avatar_url) {
      if (document.querySelector('#avatar-file').files[0].size > 512 * 1024) {
        enqueueSnackbar('上传头像大小限制为512Kb', {
          variant: 'warning'
        });
        return;
      }
    }
    setIsEditing(false);
    if (
      row.name === newValues.name &&
      row.age === newValues.age &&
      row.class_id === newValues.class_id &&
      row.avatar_url === newValues.avatar_url
    ) {
      return;
    }
    setIsLoading(true);
    if (newValues.avatar_url !== row.avatar_url) {
      await uploadAvatar();
    }
    await axios
      .put(`/api/students/${editRowID}`, newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setNewValues(initValues);
    setEditRowId(-1);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelEditStudent() {
    setIsEditing(false);
    setEditRowId(-1);
    setNewValues(initValues);
  }

  function handleDeleteStudent(row) {
    setIsDeleting(true);
    setEditRowId(row.id);
  }

  async function handleConfirmDeleteStudent(row) {
    setIsDeleting(false);
    setIsLoading(true);
    if (row.avatar_url) {
      deleteAvatar(row.avatar_url);
    }
    await axios
      .delete(`/api/students/${editRowID}`)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelDeleteStudent() {
    setIsDeleting(false);
    setEditRowId(-1);
  }

  async function uploadAvatar(old_avatar_url = '') {
    deleteAvatar(old_avatar_url);
    const formData = new FormData();
    const avatar = document.querySelector('#avatar-file');
    formData.append('avatar', avatar.files[0]);
    return axios
      .post('/api/uploads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(res => {
        return '/uploads/' + res.data.filename;
      })
      .then(url => {
        newValues.avatar_url = url;
      })
      .then(() => enqueueSnackbar('头像上传成功', { variant: 'success' }))
      .catch(() => enqueueSnackbar('头像上传失败', { variant: 'error' }));
  }

  async function deleteAvatar(url) {
    if (!url) {
      return;
    }
    axios.delete('/api/uploads/' + url.match(/[^/]*$/g)[0]);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <CustomedTableToolbar
          handleAddStudent={handleAddStudent}
          disabled={isEditing || isDeleting}
          searchWords={searchWords}
          setSearchWords={setSearchWords}
          setPage={setPage}
        />
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
                      <StudentEditRow
                        key={row.id}
                        rowId={row.id}
                        classList={data.classes}
                        newValues={newValues}
                        setNewValues={setNewValues}
                        handleConfirmAction={() => handleConfirmEditStudent(row)}
                        handleCancelAction={handleCancelEditStudent}
                      />
                    );
                  }
                  if (isDeleting && row.id === editRowID) {
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="right" padding="default" colSpan={5}>
                          确认要删除该学生?
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="确认">
                            <IconButton onClick={() => handleConfirmDeleteStudent(row)}>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="取消">
                            <IconButton onClick={handleCancelDeleteStudent}>
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
                      <TableCell padding="checkbox">
                        {row.avatar_url ? (
                          <Avatar alt="img" src={row.avatar_url} className={classes.avatar} />
                        ) : (
                          <Avatar alt="img" className={classes.avatar}>
                            {row.name[0]}
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell component="th" id={index} scope="row" align="center">
                        {row.name}
                      </TableCell>
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell align="center">{row.age}</TableCell>
                      <TableCell align="center">{row.class_name}</TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="编辑学生">
                          <div>
                            <IconButton onClick={() => handleEditStudent(row)} disabled={grayOut}>
                              <EditIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="删除学生">
                          <div>
                            <IconButton onClick={() => handleDeleteStudent(row)} disabled={grayOut}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {isAdding && (
                <StudentEditRow
                  rowId={0}
                  classList={data.classes}
                  newValues={newValues}
                  setNewValues={setNewValues}
                  handleConfirmAction={handleConfirmAddStudent}
                  handleCancelAction={handleCancelAddStudent}
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
          rowsPerPageOptions={[5, 10, 25]}
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
          onChangeRowsPerPage={handleChangeRowsPerPage}
          ActionsComponent={utils.TablePaginationActions}
        />
      </Paper>
    </div>
  );
}

StudentTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(StudentTable);
