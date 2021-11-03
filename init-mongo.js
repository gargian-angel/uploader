db.createUser({
  user: "root",
  pwd: "secret",
  roles: [
    {
      role: "readWrite",
      db: "pitch-deck-uploader-db",
    },
  ],
});
