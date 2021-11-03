import React from "react";
import { Anchor, Text } from "grommet";
import { CloudUpload } from "grommet-icons";

export const DefaultMessage = ({ multiple }) => {
  return (
    <>
      <CloudUpload />
      <Text>
        Drag and drop or <Anchor>choose</Anchor> {multiple ? "files" : "a file"}
      </Text>
    </>
  );
};

export const DropMessage = ({ multiple }) => {
  return (
    <Text color="brand" weight="bold">
      Drop {multiple ? "files" : "file"} here
    </Text>
  );
};
