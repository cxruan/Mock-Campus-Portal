import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { withSnackbar } from 'notistack';
import { Avatar, Button, CssBaseline, TextField, Typography, Container } from '@material-ui/core/';
import { makeStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  paper: {
    marginTop: theme.spacing(15),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

function SignIn({ handleLogin, enqueueSnackbar }) {
  const classes = useStyles();

  function logIn(event) {
    event.preventDefault();
    axios
      .post('/api/login', {
        username: event.target.username.value,
        password: event.target.password.value
      })
      .then(() => enqueueSnackbar('登录成功', { variant: 'success' }))
      .then(handleLogin)
      .catch(() => enqueueSnackbar('登录失败', { variant: 'error' }));
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          登录
        </Typography>
        <form className={classes.form} onSubmit={logIn}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="用户名"
            name="username"
            autoComplete="username"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            登录
          </Button>
        </form>
      </div>
    </Container>
  );
}

SignIn.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(SignIn);
