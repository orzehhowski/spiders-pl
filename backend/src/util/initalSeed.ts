// it's just seed to initalize database
import User from "../models/user";
import db from "./db";
import { hash } from "bcryptjs";

interface Options {
  isTesting?: boolean;
}

export default async (options?: Options) => {
  return db({ isTesting: !!options?.isTesting })
    .sync({ force: true })
    .then(async () => {
      const passwordHash = await hash("wlodzimierzbialy123", 12);
      if (!passwordHash) {
        throw new Error("password hash error");
      }
      const user = await User.create({
        username: "admin",
        email: "admin@admin.pl",
        passwordHash,
        isAdmin: true,
        isOwner: true,
      });
      const secondPasswordHash = await hash("jeremiaszruzowy321", 12);
      if (!secondPasswordHash) {
        throw new Error("password hash error");
      }
      const secondUser = await User.create({
        username: "not admin",
        email: "test@test.pl",
        passwordHash: secondPasswordHash,
      });
      const firstSuggestion = await secondUser.$create("suggestion", {
        isNew: true,
        isFamily: true,
        name: "krzyżakowats",
        latinName: "testtest",
        appearanceDesc:
          "ogromny pajonk. // mają 8 nóg === to jest podtytuł === hej hej hej to jest podsekcja",
        behaviorDesc: "robią dwuwymiarowe sieci",
      });
      await firstSuggestion.$create("source", {
        source: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
      });
      await firstSuggestion.$create("source", {
        source: "https://arages.de/files/checklist2004_araneae.pdf",
      });
      const suggestionImage = await firstSuggestion.$create("image", {
        src: "img/krzyzak.jpg",
        author: "Bartosz Orzechowski",
      });
      const firstFamily = await user.$create("family", {
        adminId: user.id,
        name: "krzyżakowate",
        latinName: "araneidae",
        appearanceDesc:
          "=== to tez jest podtytul === ile dalbym by zapomniec cie wszystkie chwile te ktore sa na nie bo chce bo chce nie myslec o tym juz zdmuchnac wszystkie wspomnienia niczym zalegly kusz tak juz tak juz po prostu nie pamietac sytuacji w ktorych serce penka wiem nie wyrwe sie chociaz bardzo chce mam nadzieje ze to weisz i ty i ty. // mają 8 nóg === to jest podtytuł === hej hej hej to jest podsekcja",
        behaviorDesc: "robią dwuwymiarowe sieci",
      });
      await firstFamily.$create("source", {
        source: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
      });
      await firstFamily.$create("source", {
        source: "https://arages.de/files/checklist2004_araneae.pdf",
      });
      const familyImage = await firstFamily.$create("image", {
        src: "img/krzyzak.jpg",
        author: "Bartosz Orzechowski",
      });

      const firstSpider = await firstFamily.$create("spider", {
        name: "krzyzak ogrodowy",
        latinName: "araneidae ogrodae",
        appearanceDesc:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim commodi atque aut voluptates ea deleniti nostrum deserunt, ipsam repudiandae soluta quis maiores similique libero ipsa excepturi odit voluptatibus fugit sint temporibus ipsum! Commodi, corrupti? Ipsam, doloremque. Ex, debitis quo? Nostrum esse et commodi neque assumenda repellendus, veniam in exercitationem. Error molestiae saepe blanditiis incidunt numquam dolorum, libero quasi? Aperiam veritatis omnis id eveniet autem quo fugit vel saepe, neque expedita quam? Modi vel iusto facere laudantium porro voluptate, minus quia tempora sunt perferendis quibusdam fugiat nemo dolorum dolorem, corporis deleniti sed magni impedit. Necessitatibus soluta repellendus error tenetur aliquam, ratione quae porro eius eligendi quasi, at voluptatibus ducimus dolore! Distinctio corporis minima inventore nihil ad maiores facilis aperiam magnam assumenda illo sint, praesentium dolore, excepturi, ipsam cupiditate amet voluptas repellat. Sunt quas ex temporibus, ea dignissimos beatae sed laudantium totam enim harum sapiente cumque reprehenderit maxime quos officiis commodi pariatur numquam quis repellendus. Eveniet nemo inventore incidunt dicta, voluptatum impedit in iure vero quo explicabo dolor eum sequi, aut quisquam eaque veritatis fugiat odit expedita quis neque consequatur aspernatur distinctio qui. Minima atque dolor dignissimos provident! Ducimus fuga optio itaque ex ut, at quo aut nostrum, eveniet atque harum consequuntur pariatur, officia laudantium. Laboriosam sit beatae ullam reiciendis soluta hic repudiandae accusantium modi, dolores consequatur similique harum quae expedita delectus provident sunt quis iure, aliquam, at sapiente facilis labore rerum vero? Quaerat corporis, molestias ea fugiat aliquid, amet tenetur iure, ipsum veniam impedit asperiores ipsam temporibus nisi debitis quia? Ducimus, fugit. Laudantium, perspiciatis? Laudantium laborum modi quis tenetur officia numquam, delectus cupiditate nobis, veniam obcaecati nulla molestias quaerat sit necessitatibus iusto? Facere harum quis tempore magni consectetur laudantium sunt recusandae soluta minima dolorum, modi non voluptas exercitationem consequatur doloribus culpa sit et accusantium corporis. Ab eum odio quam mollitia ea.",
        behaviorDesc:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim commodi atque aut voluptates ea deleniti nostrum deserunt, ipsam repudiandae soluta quis maiores similique libero ipsa excepturi odit voluptatibus fugit sint temporibus ipsum! Commodi, corrupti? Ipsam, doloremque. Ex, debitis quo? Nostrum esse et commodi neque assumenda repellendus, veniam in exercitationem. Error molestiae saepe blanditiis incidunt numquam dolorum, libero quasi? Aperiam veritatis omnis id eveniet autem quo fugit vel saepe, neque expedita quam? Modi vel iusto facere laudantium porro voluptate, minus quia tempora sunt perferendis quibusdam fugiat nemo dolorum dolorem, corporis deleniti sed magni impedit. Necessitatibus soluta repellendus error tenetur aliquam, ratione quae porro eius eligendi quasi, at voluptatibus ducimus dolore! Distinctio corporis minima inventore nihil ad maiores facilis aperiam magnam assumenda illo sint, praesentium dolore, excepturi, ipsam cupiditate amet voluptas repellat. Sunt quas ex temporibus, ea dignissimos beatae sed laudantium totam enim harum sapiente cumque reprehenderit maxime quos officiis commodi pariatur numquam quis repellendus. Eveniet nemo inventore incidunt dicta, voluptatum impedit in iure vero quo explicabo dolor eum sequi, aut quisquam eaque veritatis fugiat odit expedita quis neque consequatur aspernatur distinctio qui. Minima atque dolor dignissimos provident! Ducimus fuga optio itaque ex ut, at quo aut nostrum, eveniet atque harum consequuntur pariatur, officia laudantium. Laboriosam sit beatae ullam reiciendis soluta hic repudiandae accusantium modi, dolores consequatur similique harum quae expedita delectus provident sunt quis iure, aliquam, at sapiente facilis labore rerum vero? Quaerat corporis, molestias ea fugiat aliquid, amet tenetur iure, ipsum veniam impedit asperiores ipsam temporibus nisi debitis quia? Ducimus, fugit. Laudantium, perspiciatis? Laudantium laborum modi quis tenetur officia numquam, delectus cupiditate nobis, veniam obcaecati nulla molestias quaerat sit necessitatibus iusto? Facere harum quis tempore magni consectetur laudantium sunt recusandae soluta minima dolorum, modi non voluptas exercitationem consequatur doloribus culpa sit et accusantium corporis. Ab eum odio quam mollitia ea.",
        userId: user.id,
        adminId: user.id,
      });

      await firstSpider.$create("source", {
        source: "https://pl.wikipedia.org/wiki/Krzy%C5%BCakowate",
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
        adminId: user.id,
        name: "kwadratnikowate",
        latinName: "Tetragnathidae",
      });
      const secondFamilyImage = await secondFamily.$create("image", {
        src: "img/pajak1.jpg",
        author: "Bartosz Orzechowski",
      });
      const secondSpider = await secondFamily.$create("spider", {
        latinName: "Metellina segmentata",
        userId: user.id,
        adminId: user.id,
      });

      await secondSpider.$create("image", {
        src: "img/pajak1.jpg",
        author: "Bartosz Orzechowski",
      });
    });
};
