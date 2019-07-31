import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core/';
import { sleep } from '../../utils';
import ClassTable from './ClassTable';
import StudentTable from './StudentTable';

export default function StudentManageTab(props) {
  React.useEffect(() => {
    sleep(200).then(() => props.setIsLoading(false));
  }, []);

  return (
    <Box mt="100px" display="flex" flexDirection="row" justifyContent="space-around">
      <Box width="30%">
        <ClassTable {...props} />
      </Box>
      <Box width="55%">
        <StudentTable {...props} />
      </Box>
    </Box>
  );
}

StudentManageTab.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};
