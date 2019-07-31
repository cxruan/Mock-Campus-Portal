import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Cookie from 'cookie-universal';
import { withSnackbar } from 'notistack';
import { Typography, AppBar, Button, Grid, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PersonIcon from '@material-ui/icons/Person';
import LibraryIcon from '@material-ui/icons/LocalLibrary';
import ExitIcon from '@material-ui/icons/ExitToApp';
import StudentTab from './class-student/StudentTab';
import LibraryTab from './book-library/LibraryTab';
import BorrowReport from './borrow-report/BorrowReport';

const cookies = Cookie();

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: 'rgb(245,245,245)'
    }
  },
  root: {
    flexGrow: 1,
    minHeight: '100vh'
  },
  button: {
    marginRight: theme.spacing(5),
    padding: theme.spacing(1),
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgb(28, 39, 51)'
    }
  },
  focus: {
    backgroundColor: 'rgb(28, 39, 51)'
  }
}));

function AppPages({ logOut, isLoading, setIsLoading, enqueueSnackbar }) {
  const classes = useStyles();
  const [index, setIndex] = React.useState(cookies.get('page_index') || 0);

  function handleChange(newIndex) {
    if (index !== newIndex) {
      setIndex(newIndex);
      cookies.set('page_index', newIndex, { path: '/' });
      setIsLoading(true);
    }
  }

  function handleFetchFailure(err) {
    console.log(err.response.data);
    if (err.response.status === 401) {
      logOut();
      enqueueSnackbar('登录超时，请重新登录', { variant: 'error' });
      return;
    }
    enqueueSnackbar('操作失败', { variant: 'error' });
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Grid container spacing={3} alignItems="center">
            <Grid item md style={{ textAlign: 'center' }}>
              <Button
                className={clsx(classes.button, {
                  [classes.focus]: index === 0
                })}
                onClick={() => handleChange(0)}
              >
                <PersonIcon />
                <Typography variant="h6">班级学生管理</Typography>
              </Button>
              <Button
                className={clsx(classes.button, {
                  [classes.focus]: index === 1
                })}
                onClick={() => handleChange(1)}
              >
                <LibraryIcon />
                <Typography variant="h6">图书管理</Typography>
              </Button>
              <Button
                className={clsx(classes.button, {
                  [classes.focus]: index === 2
                })}
                onClick={() => handleChange(2)}
              >
                <LibraryIcon />
                <Typography variant="h6">借阅报表</Typography>
              </Button>
            </Grid>
            <Grid item md={7} style={{ textAlign: 'right' }}>
              <Button className={classes.button} onClick={logOut}>
                <ExitIcon />
                <Typography variant="h6">退出</Typography>
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      {index === 0 && (
        <StudentTab
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleFetchFailure={handleFetchFailure}
        />
      )}
      {index === 1 && (
        <LibraryTab
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleFetchFailure={handleFetchFailure}
        />
      )}
      {index === 2 && (
        <BorrowReport
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleFetchFailure={handleFetchFailure}
        />
      )}
    </div>
  );
}

AppPages.propTypes = {
  logOut: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(AppPages);
