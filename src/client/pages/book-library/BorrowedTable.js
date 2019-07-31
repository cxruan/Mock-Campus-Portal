import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withSnackbar } from 'notistack';
import clsx from 'clsx';
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
  Avatar,
  CircularProgress,
  Chip
} from '@material-ui/core/';
import { lighten, makeStyles } from '@material-ui/core/styles';
import UndoIcon from '@material-ui/icons/Undo';
import ClearIcon from '@material-ui/icons/Clear';
import CheckIcon from '@material-ui/icons/Check';
import FilterIcon from '@material-ui/icons/FilterList';
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
            padding={row.padding}
            sortDirection={orderBy === row.id ? order : false}
          >
            {row.sort && (
              <TableSortLabel
                active={orderBy === row.id}
                direction={order}
                onClick={createSortHandler(row.id)}
              >
                {row.label}
              </TableSortLabel>
            )}
            {!row.sort && row.label}
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
    flex: '1 1 100%',
    textAlign: 'right',
    marginRight: '20px'
  },
  actions: {
    color: theme.palette.text.secondary
  },
  title: {
    flex: '0 0 auto'
  }
}));

const CustomedTableToolbar = ({ filterd, handleFilter }) => {
  const classes = useToolbarStyles();

  return (
    <Toolbar className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6" id="tableTitle">
          借阅管理
        </Typography>
      </div>
      <div className={classes.spacer}>
        <Typography>{`当前日期: ${utils.dateFormat(new Date())}`}</Typography>
      </div>
      <div className={classes.actions}>
        <Tooltip title={!filterd ? '显示逾期借书人' : '显示全部借书人'}>
          <div>
            <IconButton onClick={handleFilter}>
              <FilterIcon />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

CustomedTableToolbar.propTypes = {
  filterd: PropTypes.bool.isRequired,
  handleFilter: PropTypes.func.isRequired
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
    backgroundColor: theme.palette.orange,
    color: 'white'
  },
  chip_error: {
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

function BorrowedTable({ isLoading, setIsLoading, handleFetchFailure, enqueueSnackbar }) {
  const classes = useStyles();
  const editingClasses = editingStyles();
  const [isReturning, setIsReturning] = React.useState(false);
  const [filterUnreturned, setFilterUnreturned] = React.useState(false);
  const [editRowID, setEditRowId] = React.useState(-1);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('expected_return_time');
  const [page, setPage] = React.useState(0);
  const [data, setData] = React.useState({ unreturned_books: [] });
  React.useEffect(() => {
    if (!isLoading) {
      axios
        .get('/api/library/unreturned_borrow_records')
        .then(res => {
          setData(res.data);
        })
        .catch(handleFetchFailure);
    }
  }, [isLoading]);

  const headRows = [
    { id: 'book_name', padding: 'default', label: '书籍名称', sort: true },
    { id: 'book_id', padding: 'default', label: '书籍ID', sort: true },
    { id: 'borrower_name', padding: 'default', label: '借书人姓名', sort: false },
    { id: 'borrower_avatar_url', padding: 'default', label: '', sort: false },
    { id: 'borrower_id', padding: 'default', label: '借书人ID', sort: false },
    { id: 'lend_time', padding: 'default', label: '借书时间', sort: true },
    { id: 'expected_return_time', padding: 'default', label: '预计归还时间', sort: true }
  ];
  const rows = data.unreturned_books
    ? data.unreturned_books.filter(row =>
        filterUnreturned
          ? utils.dateFormat(row.expected_return_time) < utils.dateFormat(new Date())
          : true
      )
    : [];
  const rowsPerPage = 5;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  function handleFilter() {
    setFilterUnreturned(!filterUnreturned);
  }

  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(property);
  }

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  function handleReturnBook(row) {
    setEditRowId(row.id);
    setIsReturning(true);
  }

  async function handleConfirmReturnBook(row) {
    setIsReturning(false);
    setIsLoading(true);
    const updated = {
      book_id: row.book_id,
      actual_return_time: utils.dateFormat(new Date())
    };
    await axios
      .put(`/api/library/borrow_records/${row.id}`, updated)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(handleFetchFailure);
    setEditRowId(-1);
    await utils.sleep(500);
    setIsLoading(false);
  }

  function handleCancelReturnBook() {
    setIsReturning(false);
    setEditRowId(-1);
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <CustomedTableToolbar filterd={filterUnreturned} handleFilter={handleFilter} />
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby="tableTitle">
            <CustomedTableHead
              headRows={headRows}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              emptyCellsNum={1}
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
                  const grayOut = isLoading || (isReturning && row.id !== editRowID);
                  const borrowStatus =
                    (utils.dateFormat(new Date()) === utils.dateFormat(row.expected_return_time) &&
                      'warning') ||
                    (utils.dateFormat(new Date()) > utils.dateFormat(row.expected_return_time) &&
                      'error');
                  if (isReturning && row.id === editRowID) {
                    return (
                      <TableRow key={row.id}>
                        <TableCell align="right" padding="default" colSpan={8}>
                          确认要归还该书籍?
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="确认">
                            <IconButton onClick={() => handleConfirmReturnBook(row)}>
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center" padding="checkbox">
                          <Tooltip title="取消">
                            <IconButton onClick={handleCancelReturnBook}>
                              <ClearIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.id}
                      className={grayOut ? editingClasses.grayout : ''}
                    >
                      <TableCell align="center" padding="checkbox" />
                      <TableCell id={index} style={{ fontWeight: 600, fontStyle: 'italic' }}>
                        {row.book_name}
                      </TableCell>
                      <TableCell align="center">{row.book_id}</TableCell>
                      <TableCell align="center">{row.borrower_name}</TableCell>
                      <TableCell align="center" padding="checkbox">
                        {row.borrower_avatar_url ? (
                          <Avatar alt="img" src={row.borrower_avatar_url} />
                        ) : (
                          <Avatar alt="img">{row.borrower_name[0]}</Avatar>
                        )}
                      </TableCell>
                      <TableCell align="center">{row.borrower_id}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={utils.dateFormat(row.lend_time)} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={(() => {
                            switch (borrowStatus) {
                              case 'warning':
                                return '已逾期';
                              case 'error':
                                return '已逾期';
                              default:
                                return '';
                            }
                          })()}
                        >
                          <Chip
                            size="small"
                            label={utils.dateFormat(row.expected_return_time)}
                            className={clsx(
                              borrowStatus === 'warning' && classes.chip_warning,
                              borrowStatus === 'error' && classes.chip_error
                            )}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" padding="checkbox">
                        <Tooltip title="归还书籍">
                          <div>
                            <IconButton onClick={() => handleReturnBook(row)} disabled={grayOut}>
                              <UndoIcon />
                            </IconButton>
                          </div>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center" padding="checkbox" />
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={10} />
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

BorrowedTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(BorrowedTable);
