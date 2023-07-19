// function to delete image with given path
import fs from "fs";
import path from "path";

export default (src: string) => {
  const pth = path.join("src", "public", src);
  if (fs.existsSync(pth)) {
    fs.unlink(pth, (err) => {
      err && console.log(err);
    });
  }
};
