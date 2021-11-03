import React, { createRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { DropzoneContainer } from "./DropzoneContainer";
import { DefaultMessage, DropMessage } from "./DropzoneMessage";
import { File } from "./File";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import PacmanLoader from "react-spinners/PacmanLoader";
import { Carousel } from "./Carousel";
import toast, { Toaster } from "react-hot-toast";

const styles = {
  mainDiv: {
    width: "100%",
    height: "100vh",
  },
  headerFooter: {
    width: "100%",
    height: "5vh",
    backgroundColor: "#686868",
    color: "white",
  },
  footer: {
    position: "absolute",
    bottom: 0,
  },
  flexColumnContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  flexRowContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    padding: "10px",
    fontFamily: "inherit",
    fontSize: ".875rem",
    cursor: "pointer",
    display: "inline-block",
    margin: "10px",
    height: "auto",
    border: "1px solid transparent",
    borderRadius: "5px",
    verticalAlign: "middle",
  },
  uploadButton: {
    color: "#ffffff",
    backgroundColor: "#28a745",
  },
  clearButton: {
    color: "#212529",
    backgroundColor: "#ffc107",
  },
  slideNumberStyle: {
    fontSize: "20px",
    fontWeight: "bold",
  },
};

const Renderer = ({
  accept,
  maxSize,
  minSize,
  multiple,
  showPreview,
  showFileSize,
}) => {
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const containerRef = createRef();
  let client = null;

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (showPreview) {
        // Accepted files is read-only.
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
      setFiles([...acceptedFiles]);
    },
    [showPreview]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    minSize,
    multiple,
    noClick: files.length, // If files are in dropzone, disable click
    onDrop,
  });

  const removeFile = () => {
    setFiles([]);
  };

  const currentFiles = files.map((file, index) => (
    <File
      file={file}
      key={index}
      removeFile={removeFile}
      showPreview={showPreview}
      showFileSize={showFileSize}
      margin={{ bottom: index !== files.length - 1 ? "xsmall" : "none" }}
    />
  ));

  //upload the selected file to the server & open a websocket connection to the websocket server
  const handleFileUpload = (e) => {
    e.preventDefault();
    setImages([]);

    const formData = new FormData();
    formData.append("pitchDeck", files[0]);

    axios
      .post(
        `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/upload-pitch-deck`,
        formData,
        {}
      )
      .then((res) => {
        //console.log(res);
        setLoading(true);
        connectWebSocket(res.data.companyCreated.name);
      });
  };

  const connectWebSocket = (filename) => {
    if (client == null) {
      //open a connection to the websocket server if it doesn't exist
      client = new W3CWebSocket(
        `ws://${process.env.REACT_APP_WORKER_HOST}:${process.env.REACT_APP_WORKER_PORT}/`
      );

      //On connection open, send a message with the selected filename to the WS server
      client.onopen = (response) => {
        console.log("WebSocket Client connected: ", response);
        client.send(
          JSON.stringify({
            type: "message",
            msg: filename,
          })
        );
      };
    }

    //listen on the incoming messages
    client.onmessage = (response) => {
      let websocketResponse = JSON.parse(response.data);
      console.log("Response for onmessage event: ", websocketResponse);

      if (websocketResponse instanceof Array && websocketResponse.length > 0) {
        //add images to the 'images' state variable & render
        setImages(
          websocketResponse.map((entry) => ({
            image: `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}${entry}`,
          }))
        );
      } else if (!(websocketResponse instanceof Array)) {
        //file conversion completed or errored, clear file from the Dropzone container
        setLoading(false);
        removeFile();

        if (
          websocketResponse !== "Done" &&
          websocketResponse.includes("Error")
        ) {
          toast.error(
            `File conversion error - ${
              websocketResponse.split("-")[1]
            }. Please try again.`,
            {
              position: "bottom-center",
            }
          );
        }
      }
    };
  };

  //Page Header component
  const Header = ({ title }) => (
    <header style={{ ...styles.headerFooter, ...styles.flexColumnContainer }}>
      {title}
    </header>
  );

  return (
    <div style={styles.mainDiv}>
      <Header title={"Pitch Deck Uploader"} />
      <div style={styles.flexColumnContainer}>
        {images && images.length > 0 && (
          <Carousel
            data={images}
            time={8000}
            width="850px"
            height="auto"
            radius="10px"
            slideNumber={true}
            slideNumberStyle={styles.slideNumberStyle}
            automatic={false}
            dots={true}
            pauseIconColor="white"
            pauseIconSize="40px"
            slideBackgroundColor="darkgrey"
            slideImageFit="cover"
            thumbnails={true}
            thumbnailWidth="100px"
            style={{
              textAlign: "center",
              maxWidth: "100vw",
              margin: "10px auto",
            }}
          />
        )}
        {!loading && (
          <DropzoneContainer
            isDragActive={isDragActive}
            files={files}
            ref={containerRef}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {files.length ? currentFiles : undefined}
            {!files.length &&
              (!isDragActive ? (
                <DefaultMessage multiple={multiple} />
              ) : (
                <DropMessage multiple={multiple} />
              ))}
            {files.length > 0 && (
              <div style={styles.flexRowContainer}>
                <button
                  style={{ ...styles.button, ...styles.uploadButton }}
                  onClick={handleFileUpload}
                >
                  Upload Pitch Deck!
                </button>
                <button
                  style={{ ...styles.button, ...styles.clearButton }}
                  onClick={removeFile}
                >
                  Clear
                </button>
              </div>
            )}
          </DropzoneContainer>
        )}
        {loading && (
          <div style={styles.flexColumnContainer}>
            <h4> Generating the pitch deck... </h4>
            <PacmanLoader color={"#3667D7"} loading={loading} size={25} />
          </div>
        )}
        <Toaster />
      </div>
    </div>
  );
};

Renderer.propTypes = {
  accept: PropTypes.string,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  multiple: PropTypes.bool,
  showPreview: PropTypes.bool,
  showFileSize: PropTypes.bool,
};

Renderer.defaultProps = {
  accept: "",
  maxSize: undefined,
  minSize: undefined,
  multiple: false,
  showPreview: false,
  showFileSize: false,
};

export default Renderer;
