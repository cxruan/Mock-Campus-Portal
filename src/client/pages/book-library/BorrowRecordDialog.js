import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import clsx from 'clsx';
import {
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Typography,
  Chip
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';
import InfoIcon from '@material-ui/icons/Info';
import * as utils from '../../utils';

const useStyles = makeStyles(theme => ({
  table: {
    minWidth: 650
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

function RecordTable({ bookId, handleFetchFailure }) {
  const [page, setPage] = React.useState(0);
  const [data, setData] = React.useState({ borrow_records: [] });

  React.useEffect(() => {
    axios
      .get(`/api/library/book/${bookId}/borrow_records`)
      .then(res => setData(res.data))
      .catch(handleFetchFailure);
  }, [bookId]);

  const rowsPerPage = 5;
  const rows = data.borrow_records;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const classes = useStyles();

  function handleChangePage(event, newPage) {
    setPage(newPage);
  }

  return (
    <div>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell>借阅人姓名</TableCell>
            <TableCell align="center">借阅人ID</TableCell>
            <TableCell align="center">借阅日期</TableCell>
            <TableCell align="center">预计归还日期</TableCell>
            <TableCell align="center">实际归还日期</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
            const borrowStatus =
              (row.actual_return_time === null && 'unreturned') ||
              (row.actual_return_time > row.expected_return_time && 'overdue');
            return (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {row.borrower_name}
                </TableCell>
                <TableCell align="center">{row.borrower_id}</TableCell>
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
      </Table>
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
  bookId: PropTypes.number.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};

export default function BorrowRecordDialog({ disabled, bookName, ...otherProps }) {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Tooltip title="借阅记录">
        <div>
          <IconButton aria-label="借阅记录" onClick={handleOpen} disabled={disabled}>
            <InfoIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          借阅记录
          <Typography variant="body2" id="tableTitle">
            {`(书籍名: ${bookName})`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <RecordTable {...otherProps} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

BorrowRecordDialog.propTypes = {
  disabled: PropTypes.bool.isRequired,
  bookName: PropTypes.string.isRequired,
  bookId: PropTypes.number.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};
