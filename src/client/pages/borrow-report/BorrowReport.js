import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import clsx from 'clsx';
import {
  Box,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography
} from '@material-ui/core';
import MuiTable from '@material-ui/core/Table';
import { makeStyles } from '@material-ui/styles';
import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import 'rsuite-table/lib/less/index.less';
import * as utils from '../../utils';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      overflow: 'hidden'
    }
  },
  table: {
    minWidth: 400
  },
  unreturned_chip: {
    backgroundColor: theme.palette.orange,
    color: 'white'
  },
  overdue_chip: {
    backgroundColor: theme.palette.red,
    color: 'white'
  }
}));

function RecordTable({ records }) {
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const rows = records;
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  const classes = useStyles();

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  return (
    <div>
      <MuiTable className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">借阅日期</TableCell>
            <TableCell align="center">预计归还日期</TableCell>
            <TableCell align="center">实际归还日期</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
            const borrowStatus =
              (row.actual_return_time === null && 'unreturned') ||
              (row.actual_return_time > row.expected_return_time && 'overdue');
            return (
              <TableRow key={index}>
                <TableCell align="center">{utils.dateFormat(row.lend_time)}</TableCell>
                <TableCell align="center">{utils.dateFormat(row.expected_return_time)}</TableCell>
                <TableCell align="center">
                  <Tooltip title={borrowStatus === 'overdue' ? '逾期归还' : ''}>
                    <Chip
                      size="small"
                      label={
                        borrowStatus === 'unreturned'
                          ? '未归还'
                          : utils.dateFormat(row.actual_return_time)
                      }
                      className={clsx(
                        borrowStatus === 'unreturned' && classes.unreturned_chip,
                        borrowStatus === 'overdue' && classes.overdue_chip
                      )}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 36 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </MuiTable>
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
    </div>
  );
}

RecordTable.propTypes = {
  records: PropTypes.array.isRequired
};

function BorrowRecordDialog({ records, bookName, borrowerName }) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="查看借阅记录">
        <Chip label={records.length} onClick={handleOpen} color="primary" />
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          借阅记录
          <Typography variant="body2" id="tableTitle1">
            {`(书籍名: ${bookName})`}
          </Typography>
          <Typography variant="body2" id="tableTitle2">
            {`(借书人: ${borrowerName})`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <RecordTable records={records} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

BorrowRecordDialog.propTypes = {
  bookName: PropTypes.string.isRequired,
  borrowerName: PropTypes.string.isRequired,
  records: PropTypes.array.isRequired
};

const MyCell = ({ rowData, dataKey, ...props }) => {
  if (dataKey === 'book_name' || dataKey === 'book_id') {
    return <Cell {...props}>{rowData[dataKey]}</Cell>;
  }
  const { records, borrowerName } = rowData.recordsByBorrowerId[dataKey];
  if (records.length === 0) {
    return (
      <Cell {...props}>
        <Chip label={records.length} />
      </Cell>
    );
  }
  return (
    <Cell {...props}>
      <BorrowRecordDialog
        records={records}
        bookName={rowData.book_name}
        borrowerName={borrowerName}
      />
    </Cell>
  );
};

MyCell.propTypes = {
  rowData: PropTypes.object,
  dataKey: PropTypes.string.isRequired
};

function ReportTable({ data, height, isLoading }) {
  return (
    <div>
      <Table height={height} data={data.rows} loading={isLoading}>
        <Column width={70} align="center" fixed resizable>
          <HeaderCell>书籍ID</HeaderCell>
          <MyCell dataKey="book_id" />
        </Column>
        <Column width={300} align="center" fixed resizable>
          <HeaderCell>书籍名称</HeaderCell>
          <MyCell dataKey="book_name" />
        </Column>
        {data.studentList.map(column => (
          <Column key={column.id} width={110} align="center" resizable>
            <HeaderCell>{`${column.name} (ID: ${column.id})`}</HeaderCell>
            <MyCell dataKey={column.id.toString()} />
          </Column>
        ))}
      </Table>
    </div>
  );
}

ReportTable.propTypes = {
  data: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired
};

export default function BorrowReport({ isLoading, setIsLoading, handleFetchFailure }) {
  const height = window.innerHeight * 0.8;
  const [data, setData] = React.useState({ rows: [], studentList: [] });
  React.useEffect(() => {
    axios
      .all([
        axios.get('/api/students'),
        axios.get('/api/library/book'),
        axios.get('/api/library/borrow_records/')
      ])
      .then(
        axios.spread((res1, res2, res3) => {
          const rows = [];
          const studentList = res1.data.students.map(row => ({ id: row.id, name: row.name }));
          const bookList = res2.data.books.map(row => ({ id: row.id, name: row.name }));
          const borrowRecords = res3.data.borrow_records;
          const records = utils.create2DArray(
            utils.getMaxById(bookList) + 1,
            utils.getMaxById(studentList) + 1
          );
          borrowRecords.forEach(record => {
            records[record.book_id][record.borrower_id].records.push({
              lend_time: record.lend_time,
              expected_return_time: record.expected_return_time,
              actual_return_time: record.actual_return_time
            });
          });
          bookList.forEach(book => {
            const row = {
              book_id: book.id,
              book_name: book.name,
              recordsByBorrowerId: {}
            };
            studentList.forEach(student => {
              row.recordsByBorrowerId[student.id] = records[book.id][student.id];
              row.recordsByBorrowerId[student.id].borrowerName = student.name;
            });
            rows.push(row);
          });
          setData({ rows, studentList });
        })
      )
      .then(() => {
        setIsLoading(false);
      })
      .catch(handleFetchFailure);
  }, []);

  return (
    <Box mt="5vh" display="flex" justifyContent="center">
      <Paper style={{ height, width: '90%' }}>
        <ReportTable height={height} data={data} isLoading={isLoading} />
      </Paper>
    </Box>
  );
}

BorrowReport.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};
