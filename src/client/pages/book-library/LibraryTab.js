import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core/';
import { sleep } from '../../utils';
import StockTable from './StockTable';
import BorrowedTable from './BorrowedTable';

export default function LibraryTab(props) {
  React.useEffect(() => {
    sleep(200).then(() => props.setIsLoading(false));
  }, []);

  return (
    <Box mt="50px" display="flex" flexDirection="column" alignContent="center">
      <Box width="90%" mx="auto">
        <StockTable {...props} />
        <BorrowedTable {...props} />
      </Box>
    </Box>
  );
}

LibraryTab.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
  handleFetchFailure: PropTypes.func.isRequired
};
