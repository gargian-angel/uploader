# PitchDeck Uploader

A simple (yet over-engineered) application that allows documents to be uploaded and renders them as images.

## Usage

Requires `docker`, `docker-compose` and the ports in the `.env` file should be open.

To run:

```
./dev_run
```

runs a development instance of all the components (files are mounted into the containers to allow hot-relaods).

Currently there are no tests, and no non-development deployments.

## Components

Piggybacked this project onto some PoCs I was doing for work. Hence this has a few too many components.

### Client (port 20000)

React App; entrypoint into application for end users.

Allows you to upload or drag & drop PDF/PPT/ODT files using an open source DropZone component and renders the converted PDFs.

Upon upload, opens a web socket connection with a worker to track doc-to-PNG conversion.

Uses an open source Carousel component to render images along with image thumbnails.

Multiple clients can connect and uplaod files at the same time & will receive images for their own pitch-deck.

### Server (port 20001)

Node Server; receives upload from the client.

Saves the file to disk on a volume shared with the worker.

### Worker (port 20002)

Web Socket Server; communicates with the client about the conversion status for a single document.

Runs a bash script wrapping calls to conversion tools and can be easily extended to support new tools.

The Node application runs `inotify` to watch for file changes within a single directory.

Within a short duration of the file being completely created, the client is notified allowing for a real-time loading.

### MongoDB

Runs on the default ports and is currently exposed beyond what is needed. Isn't really used for much beyond simple book-keeping.

### Logs (port 20004)

3rd party application that tails container logs.