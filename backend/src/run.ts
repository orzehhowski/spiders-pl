// code that mounts the app
import app from "./app";
import initalSeed from "./util/initalSeed";

initalSeed()
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
