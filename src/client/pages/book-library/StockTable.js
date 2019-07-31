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
  CircularProgress,
  Chip
} from '@material-ui/core/';
import { lighten, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import BookEditRow from './BookEditRow';
import LendDialog from './LendDialog';
import BorrowRecordDialog from './BorrowRecordDialog';
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

const CustomedTableToolbar = ({ handleAddClass, disabled }) => {
  const classes = useToolbarStyles();

  return (
    <Toolbar className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6" id="tableTitle">
          书籍管理
        </Typography>
      </div>
      <div className={classes.spacer} />
      <div className={classes.actions}>
        <Tooltip title="添加书籍">
          <div>
            <IconButton aria-label="添加书籍" onClick={handleAddClass} disabled={disabled}>
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
  },
  chip_warning: {
    backgroundColor: theme.palette.red,
    color: 'white'
  }
}));

const editingStyles = makeStyles(() => ({
  grayout: {
    transition: 'all 300ms ease 0s',
    opacity: 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

function StockTable({ isLoading, setIsLoading, handleFetchFailure, enqueueSnackbar }) {
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
    name: '',
    num_of_copies: 0
  };
  const [newValues, setNewValues] = React.useState(initValues);
  const [data, setData] = React.useState({ books: [] });
  React.useEffect(() => {
    if (!isLoading) {
      axios
        .get('/api/library/book')
        .then(res => setData(res.data))
        .catch(handleFetchFailure);
    }
  }, [isLoading]);

  const headRows = [
    { id: 'name', numeric: false, disablePadding: true, label: '书籍名称' },
    { id: 'id', numeric: true, disablePadding: false, label: 'ID' },
    { id: 'num_of_copies', numeric: true, disablePadding: false, label: '库存剩余' }
  ];
  const rows = data.books;
  const rowsPerPage = 5;
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

  function handleAddBook() {
    setIsAdding(true);
  }

  async function handleConfirmAddBook() {
    if (!newValues.name || !newValues.num_of_copies) {
      enqueueSnackbar('请输入完整信息', { variant: 'warning' });
      return;
    }
    setIsAdding(false);
    setIsLoading(true);
    await axios
      .post('/api/library/book', newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setNewValues(initValues);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelAddBook() {
    setIsAdding(false);
    setNewValues(initValues);
  }

  function handleEditBook(row) {
    setEditRowId(row.id);
    setIsEditing(true);
    setNewValues({
      name: row.name,
      num_of_copies: row.num_of_copies
    });
  }

  async function handleConfirmEditBook(row) {
    setIsEditing(false);
    if (row.name === newValues.name && row.num_of_copies === newValues.num_of_copies) {
      return;
    }
    setIsLoading(true);
    await axios
      .put(`/api/library/book/${row.id}`, newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    setNewValues(initValues);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelEditBook() {
    setIsEditing(false);
    setEditRowId(-1);
    setNewValues(initValues);
  }

  function handleDeleteBook(row) {
    setIsDeleting(true);
    setEditRowId(row.id);
  }

  async function handleConfirmDeleteBook(row) {
    setIsDeleting(false);
    setIsLoading(true);
    await axios
      .delete(`/api/library/book/${row.id}`)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelDeleteBook() {
    setIsDeleting(false);
    setEditRowId(-1);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <CustomedTableToolbar disabled={isEditing || isDeleting} handleAddClass={handleAddBook} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <CustomedTableHead
              headRows={headRows}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              emptyCellsNum={4}
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
                      <BookEditRow
                        key={-1}
                        rowId={row.id}
                        newValues={newValues}
                        setNewValues={setNewValues}
                        handleConfirmAction={() => handleConfirmEditBook(row)}
                        handleCancelAction={handleCancelEditBook}
                      />
                    );
                  }
                  if (isDeleting && row.id === editRowID) {
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="right" padding="default" colSpan={6}>
                          确认要删除该书籍?
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="确认">
                            <IconButton onClick={() => handleConfirmDeleteBook(row)}>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="取消">
                            <IconButton onClick={handleCancelDeleteBook}>
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
                      <TableCell align="center" padding="checkbox" />
                      <TableCell id={index} style={{ fontWeight: 600, fontStyle: 'italic' }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="center">{row.id}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={row.num_of_copies}
                          className={row.num_of_copies === 0 ? classes.chip_warning : ''}
                        />
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <LendDialog
                          initValues={{
                            book_id: row.id,
                            borrower_id: null,
                            lend_time: utils.dateFormat(new Date()),
                            expected_return_time: utils.dateFormat(new Date()),
                            actual_return_time: null
                          }}
                          bookName={row.name}
                          disabled={grayOut || row.num_of_copies <= 0}
                          setIsLoading={setIsLoading}
                          handleFetchFailure={handleFetchFailure}
                        />
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <BorrowRecordDialog
                          bookId={row.id}
                          bookName={row.name}
                          disabled={grayOut}
                          handleFetchFailure={handleFetchFailure}
                        />
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="编辑书籍">
                          <div>
                            <IconButton onClick={() => handleEditBook(row)} disabled={grayOut}>
                              <EditIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="删除书籍">
                          <div>
                            <IconButton onClick={() => handleDeleteBook(row)} disabled={grayOut}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {isAdding && (
                <BookEditRow
                  rowId={0}
                  newValues={newValues}
                  setNewValues={setNewValues}
                  handleConfirmAction={handleConfirmAddBook}
                  handleCancelAction={handleCancelAddBook}
                />
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={8} />
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

StockTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(StockTable);
