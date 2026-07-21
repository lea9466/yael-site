import type {
  ArticleBlock,
  ArticleHeadingBlock,
  ArticleImageBlock,
  ArticleListBlock,
  ArticleParagraphBlock,
  ArticleQuoteBlock,
} from "@/lib/articles/types";

export type AboutEditorialBand = "white" | "soft" | "linen";

export type AboutEditorialUnit =
  | { type: "heading"; block: ArticleHeadingBlock }
  | { type: "paragraphs"; blocks: ArticleParagraphBlock[] }
  | { type: "list"; block: ArticleListBlock }
  | {
      type: "quote";
      block: ArticleQuoteBlock;
      band: AboutEditorialBand;
    }
  | {
      type: "image-feature";
      block: ArticleImageBlock;
      variant: "wide" | "portrait" | "inset-start" | "inset-end";
    }
  | {
      type: "split";
      image: ArticleImageBlock;
      prose: Array<ArticleParagraphBlock | ArticleListBlock>;
      imageSide: "start" | "end";
      band: AboutEditorialBand;
    };

type ProseBlock = ArticleParagraphBlock | ArticleListBlock;

function isProseBlock(block: ArticleBlock): block is ProseBlock {
  return block.type === "paragraph" || block.type === "list";
}

function takeProse(
  blocks: ArticleBlock[],
  start: number,
  max: number
): ProseBlock[] {
  const collected: ProseBlock[] = [];

  for (
    let index = start;
    index < blocks.length && collected.length < max;
    index += 1
  ) {
    const block = blocks[index];

    if (!block || !isProseBlock(block)) {
      break;
    }

    collected.push(block);
  }

  return collected;
}

function bandForIndex(index: number): AboutEditorialBand {
  const bands: AboutEditorialBand[] = ["white", "soft", "linen"];
  return bands[index % bands.length] ?? "white";
}

/**
 * Turns a flat ArticleContent block list into magazine-style editorial units.
 * Presentation-only — does not mutate or reshape stored AboutPageData.
 */
export function composeAboutEditorialUnits(
  blocks: ArticleBlock[]
): AboutEditorialUnit[] {
  const units: AboutEditorialUnit[] = [];
  let index = 0;
  let imageCount = 0;
  let bandCount = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (!block) {
      break;
    }

    if (block.type === "quote") {
      units.push({
        type: "quote",
        block,
        band: bandForIndex(bandCount),
      });
      bandCount += 1;
      index += 1;
      continue;
    }

    if (block.type === "heading") {
      units.push({ type: "heading", block });
      index += 1;
      continue;
    }

    if (block.type === "image") {
      const followingProse = takeProse(blocks, index + 1, 2);

      if (followingProse.length > 0) {
        units.push({
          type: "split",
          image: block,
          prose: followingProse,
          imageSide: imageCount % 2 === 0 ? "start" : "end",
          band: bandForIndex(bandCount),
        });
        bandCount += 1;
        imageCount += 1;
        index += 1 + followingProse.length;
        continue;
      }

      const variants = [
        "wide",
        "portrait",
        "inset-end",
        "inset-start",
      ] as const;

      units.push({
        type: "image-feature",
        block,
        variant: variants[imageCount % variants.length] ?? "wide",
      });
      imageCount += 1;
      index += 1;
      continue;
    }

    if (isProseBlock(block)) {
      const proseRun = takeProse(blocks, index, 3);
      const afterProse = blocks[index + proseRun.length];

      if (
        afterProse?.type === "image" &&
        proseRun.length > 0 &&
        proseRun.length <= 2
      ) {
        units.push({
          type: "split",
          image: afterProse,
          prose: proseRun,
          imageSide: imageCount % 2 === 0 ? "end" : "start",
          band: bandForIndex(bandCount),
        });
        bandCount += 1;
        imageCount += 1;
        index += proseRun.length + 1;
        continue;
      }

      if (block.type === "list") {
        units.push({ type: "list", block });
        index += 1;
        continue;
      }

      const paragraphs: ArticleParagraphBlock[] = [];

      while (index < blocks.length && blocks[index]?.type === "paragraph") {
        const upcoming = takeProse(blocks, index, 3);
        const nextBreak = blocks[index + upcoming.length];

        if (
          paragraphs.length > 0 &&
          nextBreak?.type === "image" &&
          upcoming.length <= 2
        ) {
          break;
        }

        const paragraph = blocks[index];

        if (paragraph?.type === "paragraph") {
          paragraphs.push(paragraph);
        }

        index += 1;

        if (paragraphs.length >= 3) {
          break;
        }
      }

      if (paragraphs.length > 0) {
        units.push({ type: "paragraphs", blocks: paragraphs });
      }

      continue;
    }

    index += 1;
  }

  return units;
}
