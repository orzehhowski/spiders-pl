import Family from "../models/family";
import db from "./db";

export default async () => {
  return db.sync({ force: true }).then(async () => {
    const firstFamily = await Family.create({
      name: "krzyżakowate",
      latinName: "araneidae",
      appearanceDesc:
        "majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krpie majom <br/>krzyz upie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na majomrzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz na dupie majom krzyz dupie",
      behaviorDesc: "robią dwuwymiarowe sieci",
      image: "/img/krzyzak.jpg",
      imageAuthor: "Bartosz Orzechowski",
      resources:
        "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate https://arages.de/files/checklist2004_araneae.pdf",
    });

    const firstSpider = await firstFamily.createSpider({
      name: "krzyzak ogrodowy",
      latinName: "araneidae ogrodae",
      appearanceDesc: "ladny jest",
      behaviorDesc: "sieci plecie",
      resources: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
    });

    await firstSpider.createImage({
      src: "img/krzyzak.jpg",
      author: "Bartosz Orzechowski",
    });
    await firstSpider.createImage({
      src: "img/krzyzak2.jpg",
      author: "Bartosz Orzechowski",
    });

    const secondFamily = await Family.create({
      name: "kwadratnikowate",
      latinName: "Tetragnathidae",
      image: "/img/pajak1.jpg",
      imageAuthor: "Bartosz Orzechowski",
    });
    const secondSpider = await secondFamily.createSpider({
      latinName: "Metellina segmentata",
    });

    await secondSpider.createImage({
      src: "img/pajak1.jpg",
      author: "Bartosz Orzechowski",
    });
  });
};
