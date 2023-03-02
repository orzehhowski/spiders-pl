import Family from "../models/family";
import User from "../models/user";
import db from "./db";

export default async () => {
  return db.sync({ force: true }).then(async () => {
    const user = await User.create({
      username: "admin",
      email: "admin@admin.pl",
      passwordHash: "abcd",
    });
    const firstFamily = await user.$create("family", {
      name: "krzyżakowate",
      latinName: "araneidae",
      appearanceDesc:
        "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz dupie",
      behaviorDesc: "robią dwuwymiarowe sieci",
      image: "img/krzyzak.jpg",
      imageAuthor: "Bartosz Orzechowski",
      resources:
        "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    });

    const firstSpider = await firstFamily.$create("spider", {
      name: "krzyzak ogrodowy",
      latinName: "araneidae ogrodae",
      appearanceDesc: "ladny jest",
      behaviorDesc: "sieci plecie",
      resources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
      userId: user.id,
    });

    await firstSpider.$create("image", {
      src: "img/krzyzak.jpg",
      author: "Bartosz Orzechowski",
    });
    await firstSpider.$create("image", {
      src: "img/krzyzak2.jpg",
      author: "Bartosz Orzechowski",
    });

    const secondFamily = await user.$create("family", {
      name: "kwadratnikowate",
      latinName: "Tetragnathidae",
      image: "img/pajak1.jpg",
      imageAuthor: "Bartosz Orzechowski",
    });
    const secondSpider = await secondFamily.$create("spider", {
      latinName: "Metellina segmentata",
      userId: user.id,
    });

    await secondSpider.$create("image", {
      src: "img/pajak1.jpg",
      author: "Bartosz Orzechowski",
    });
  });
};
