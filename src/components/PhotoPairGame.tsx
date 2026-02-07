"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// 18 images (valid ones)
const baseImages = [
  "/game-photos/1.avif",
  "/game-photos/2.avif",
  "/game-photos/3.avif",
  "/game-photos/4.avif",
  "/game-photos/5.avif",
  "/game-photos/6.avif",
  "/game-photos/7.avif",
  "/game-photos/8.avif",
  "/game-photos/9.avif",
  "/game-photos/10.avif",
  "/game-photos/11.avif",
  "/game-photos/12.avif",
  "/game-photos/13.avif",
  "/game-photos/14.avif",
  "/game-photos/15.avif",
  "/game-photos/16.avif",
  "/game-photos/17.avif",
  "/game-photos/18.avif",
];

// 18 pairs -> 36 cards
const buildPairs = (imgs: string[]) => imgs.flatMap((img) => [img, img]);

const shuffleArray = <T,>(array: T[]) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const heartLayout: Array<Array<number | null>> = [
  [null, null, 0, 1, null, 2, 3, null, null],
  [null, 4, 5, 6, 7, 8, 9, 10, null],
  [11, 12, 13, 14, 15, 16, 17, 18, 19],
  [null, 20, 21, 22, 23, 24, 25, 26, null],
  [null, null, 27, 28, 29, 30, 31, null, null],
  [null, null, null, 32, 33, 34, null, null, null],
  [null, null, null, null, 35, null, null, null, null],
];

type PhotoPairGameProps = {
  handleShowProposal: () => void;
};

export default function PhotoPairGame({ handleShowProposal }: PhotoPairGameProps) {
  const imagePairs = useMemo(() => buildPairs(baseImages), []);
  const [deck] = useState<string[]>(() => shuffleArray(imagePairs));

  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [incorrect, setIncorrect] = useState<number[]>([]);

  const handleClick = async (index: number) => {
    if (selected.length === 2) return;
    if (matched.includes(index)) return;
    if (selected.includes(index)) return;

    if (selected.length === 1) {
      const firstIndex = selected[0];
      setSelected((prev) => [...prev, index]);

      if (deck[firstIndex] === deck[index]) {
        setMatched((prev) => [...prev, firstIndex, index]);
        setSelected([]);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIncorrect([firstIndex, index]);
        setTimeout(() => setIncorrect([]), 1000);
        setTimeout(() => setSelected([]), 1000);
      }
    } else {
      setSelected([index]);
    }
  };

  useEffect(() => {
    if (matched.length === deck.length) {
      handleShowProposal();
    }
  }, [matched, deck.length, handleShowProposal]);

  return (
    <div className="grid grid-cols-9 gap-1 lg:gap-2 max-w-[95vw] mx-auto place-items-center">
      {/* Image preload */}
      <div className="hidden">
        {deck.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`Preload ${i + 1}`}
            fill
            className="object-cover"
            priority
          />
        ))}
      </div>

      {heartLayout.flat().map((slotIndex, i) =>
        slotIndex !== null ? (
          <motion.div
            key={i}
            className="w-[11vh] h-[11vh] lg:w-20 lg:h-20 relative cursor-pointer"
            whileHover={{ scale: 1.1 }}
            onClick={() => handleClick(slotIndex)}
            style={{ perspective: "1000px" }}
          >
            {/* Back */}
            {!selected.includes(slotIndex) && !matched.includes(slotIndex) && (
              <motion.div
                className="w-full h-full bg-gray-300 rounded-sm lg:rounded-md absolute z-10"
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY: selected.includes(slotIndex) || matched.includes(slotIndex) ? 180 : 0,
                }}
                transition={{ duration: 0.5 }}
                style={{ backfaceVisibility: "hidden" }}
              />
            )}

            {/* Front */}
            {(selected.includes(slotIndex) || matched.includes(slotIndex)) && (
              <motion.div
                className="w-full h-full absolute"
                initial={{ rotateY: -180 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: 0.5 }}
                style={{ backfaceVisibility: "hidden" }}
              >
                <Image
                  src={deck[slotIndex]}
                  alt={`Image ${slotIndex + 1}`}
                  fill
                  className="rounded-sm lg:rounded-md object-cover"
                />
              </motion.div>
            )}

            {/* Incorrect */}
            {incorrect.includes(slotIndex) && (
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-full h-full bg-red-500 rounded-sm lg:rounded-md" />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div key={i} className="w-[11vh] h-[11vh] lg:w-20 lg:h-20" />
        ),
      )}
    </div>
  );
}
