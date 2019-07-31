import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import { useSnackbar } from 'notistack';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  IconButton,
  Box,
  Typography
} from '@material-ui/core/';
import { makeStyles } from '@material-ui/styles';
import RedoIcon from '@material-ui/icons/Redo';
import { dateFormat, sleep } from '../../utils';

const dialogStyles = makeStyles(theme => ({
  overflow: {
    overflow: 'visible'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  },
  select: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200
  }
}));

function CustomContent({ handleClose, setIsLoading, initValues, bookName, handleFetchFailure }) {
  const classes = dialogStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [newValues, setNewValues] = React.useState(initValues);

  const fetchData = () =>
    axios
      .get(`/api/library/book/${newValues.book_id}/student_options/`)
      .then(res =>
        res.data.map(row => ({
          value: row.id,
          name: row.name,
          label:
            row.disabled === 'yes'
              ? `(已借出) ${row.name} (ID: ${row.id})`
              : `${row.name} (ID: ${row.id})`,
          disabled: row.disabled
        }))
      )
      .catch(handleFetchFailure);

  const filterStudents = async inputValue => {
    const options = await fetchData();
    return options.filter(i => i.name.toLowerCase().includes(inputValue.toLowerCase()));
  };

  const promiseOptions = inputValue =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterStudents(inputValue));
      }, 1000);
    });

  function handleChange(event) {
    const { id, value } = event.target;
    setNewValues(prevState => ({
      ...prevState,
      [id]: value
    }));
  }

  function handleSelectChange(target) {
    setNewValues(prevState => ({
      ...prevState,
      borrower_id: target.value
    }));
  }

  async function handleConfirmLend() {
    if (!newValues.borrower_id) {
      enqueueSnackbar('请输入完整信息', {
        variant: 'warning'
      });
      return;
    }
    setIsLoading(true);
    await sleep(500);
    await axios
      .post(`/api/library/borrow_records/`, newValues)
      .then(() => enqueueSnackbar('操作成功', { variant: 'success' }))
      .catch(err => {
        enqueueSnackbar('操作失败', { variant: 'error' });
        console.log(err.response.data);
      })
      .then(handleClose);
    setIsLoading(false);
  }

  return (
    <React.Fragment>
      <DialogTitle id="form-dialog-title">
        登记借书人
        <Typography variant="body2">{`(书籍名: ${bookName})`}</Typography>
      </DialogTitle>

      <DialogContent className={classes.overflow}>
        <Box display="flex" flexDirection="row" justifyContent="space-around">
          <AsyncSelect
            className={classes.select}
            id="borrower_id"
            cacheOptions
            defaultOptions
            onChange={handleSelectChange}
            loadOptions={promiseOptions}
            isOptionDisabled={option => option.disabled === 'yes'}
          />
          <TextField
            className={classes.textField}
            id="lend_time"
            label="借书时间 (当前日期)"
            type="date"
            value={newValues.lend_time}
            disabled
          />
          <TextField
            className={classes.textField}
            id="expected_return_time"
            label="预计归还时间"
            type="date"
            onChange={handleChange}
            value={newValues.expected_return_time}
            InputProps={{ inputProps: { min: dateFormat(new Date()) } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirmLend} color="primary">
          确定
        </Button>
        <Button onClick={handleClose} color="primary">
          取消
        </Button>
      </DialogActions>
    </React.Fragment>
  );
}

CustomContent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  initValues: PropTypes.object.isRequired,
  bookName: PropTypes.string.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};

export default function LendDialog({ disabled, ...otherProps }) {
  const classes = dialogStyles();
  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div>
      <Tooltip title={disabled ? '无剩余库存，无法借阅' : '借出书籍'}>
        <div>
          <IconButton aria-label="借出书籍" onClick={handleClickOpen} disabled={disabled}>
            <RedoIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Dialog
        classes={{ paperScrollPaper: classes.overflow }}
        fullWidth
        maxWidth="md"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <CustomContent handleClose={handleClose} {...otherProps} />
      </Dialog>
    </div>
  );
}

LendDialog.propTypes = {
  disabled: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  initValues: PropTypes.object.isRequired,
  bookName: PropTypes.string.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};
