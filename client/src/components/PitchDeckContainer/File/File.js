import React from "react";
import PropTypes from "prop-types";
import { Box } from "grommet";
import { FileInfo } from ".";

export const File = ({
  file,
  removeFile,
  showPreview,
  showFileSize,
  ...rest
}) => {
  return (
    <Box direction="row" align="center" justify="center" {...rest}>
      <FileInfo
        file={file}
        showFileSize={showFileSize}
        showPreview={showPreview}
      />
    </Box>
  );
};

File.propTypes = {
  file: PropTypes.shape({
    path: PropTypes.string.isRequired
  }).isRequired,
  showPreview: PropTypes.bool,
  showFileSize: PropTypes.bool,
  removeFile: PropTypes.func.isRequired
};

File.defaultProps = {
  showPreview: false,
  showFileSize: false
};
